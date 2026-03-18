"use server";

import { redirect } from "next/navigation";

import { appEnv } from "@/lib/env";
import { getActiveUserProgram, getProgramByTitle, getProfileByUserId } from "@/lib/data";
import {
  getCurrentDay,
  getTodayDate,
  getWeekNumber,
  PROGRAM_DURATION_DAYS,
} from "@/lib/program";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RedirectMessageType = "error" | "message";

function buildPathWithParams(
  pathname: string,
  params: Record<string, string | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const queryString = searchParams.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

function getRedirectPath(
  pathname: string,
  type: RedirectMessageType,
  message: string,
  extraParams: Record<string, string | undefined> = {},
) {
  return buildPathWithParams(pathname, {
    [type]: message,
    ...extraParams,
  });
}

function parsePromiseAnswer(value: FormDataEntryValue | null) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}

function parseBooleanFlag(value: FormDataEntryValue | null) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

async function requireActionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

async function requireOnboardedActionUser() {
  const context = await requireActionUser();
  const profile = await getProfileByUserId(context.user.id);

  if (!profile?.motivation_text?.trim()) {
    redirect("/onboarding");
  }

  return context;
}

async function getProgramWeekCount(programId: string) {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("program_weeks")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId);

  return count ?? 0;
}

async function hasFinalSessionRecord(
  userId: string,
  programId: string,
  durationDays: number,
) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("daily_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .eq("day_number", durationDays)
    .maybeSingle();

  return Boolean(data?.id);
}

async function getProgramSessionCount(userId: string, programId: string) {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("daily_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("program_id", programId);

  return count ?? 0;
}

async function getProgramSessions(userId: string, programId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("daily_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .order("day_number", { ascending: true });

  return data ?? [];
}

async function resetCurrentProgramRun(
  userId: string,
  programId: string,
  userProgramId: string,
  todayDate: string,
) {
  const supabase = await createSupabaseServerClient();
  const { data: existingUserProgram } = await supabase
    .from("user_programs")
    .select("started_at, completed_at")
    .eq("id", userProgramId)
    .eq("user_id", userId)
    .eq("program_id", programId)
    .maybeSingle();

  if (!existingUserProgram) {
    return {
      ok: false as const,
      error:
        "Your active program run could not be found. Refresh and try resetting again.",
    };
  }
  const currentRun = existingUserProgram;

  const [
    { data: existingSessions, error: sessionsReadError },
    { data: existingExerciseResponses, error: exerciseResponsesReadError },
    { data: existingConsistencyLogs, error: consistencyLogsReadError },
  ] = await Promise.all([
    supabase
      .from("daily_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("program_id", programId),
    supabase
      .from("exercise_responses")
      .select("*")
      .eq("user_id", userId)
      .eq("program_id", programId)
      .eq("user_program_id", userProgramId),
    supabase
      .from("consistency_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", currentRun.started_at)
      .lte("log_date", todayDate),
  ]);

  if (sessionsReadError || exerciseResponsesReadError || consistencyLogsReadError) {
    return {
      ok: false as const,
      error:
        sessionsReadError?.message ||
        exerciseResponsesReadError?.message ||
        consistencyLogsReadError?.message ||
        "Unable to read current challenge state before reset.",
    };
  }

  const snapshotSessions = existingSessions ?? [];
  const snapshotExerciseResponses = existingExerciseResponses ?? [];
  const snapshotConsistencyLogs = existingConsistencyLogs ?? [];

  async function rollbackReset() {
    await supabase
      .from("user_programs")
      .update({
        started_at: currentRun.started_at,
        completed_at: currentRun.completed_at,
      })
      .eq("id", userProgramId)
      .eq("user_id", userId)
      .eq("program_id", programId);

    if (snapshotSessions.length > 0) {
      await supabase.from("daily_sessions").upsert(snapshotSessions, {
        onConflict: "user_id,program_id,day_number",
      });
    }

    if (snapshotExerciseResponses.length > 0) {
      await supabase.from("exercise_responses").upsert(snapshotExerciseResponses, {
        onConflict: "user_program_id,day_number,section_id",
      });
    }

    if (snapshotConsistencyLogs.length > 0) {
      await supabase.from("consistency_logs").upsert(snapshotConsistencyLogs, {
        onConflict: "user_id,consistency_item_id,log_date",
      });
    }
  }

  const { error: updateError } = await supabase
    .from("user_programs")
    .update({
      started_at: todayDate,
      completed_at: null,
    })
    .eq("id", userProgramId)
    .eq("user_id", userId)
    .eq("program_id", programId);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  const { error: deleteSessionsError } = await supabase
    .from("daily_sessions")
    .delete()
    .eq("user_id", userId)
    .eq("program_id", programId);

  if (deleteSessionsError) {
    await rollbackReset();

    return {
      ok: false as const,
      error:
        "The challenge reset could not be completed cleanly. Your previous run was kept in place.",
    };
  }

  const { error: deleteExerciseResponsesError } = await supabase
    .from("exercise_responses")
    .delete()
    .eq("user_id", userId)
    .eq("program_id", programId)
    .eq("user_program_id", userProgramId);

  if (deleteExerciseResponsesError) {
    await rollbackReset();

    return {
      ok: false as const,
      error:
        "The challenge reset failed while clearing workbook responses. Your previous run was restored.",
    };
  }

  const { error: deleteConsistencyLogsError } = await supabase
    .from("consistency_logs")
    .delete()
    .eq("user_id", userId)
    .gte("log_date", currentRun.started_at)
    .lte("log_date", todayDate);

  if (deleteConsistencyLogsError) {
    await rollbackReset();

    return {
      ok: false as const,
      error:
        "The challenge reset failed while clearing consistency logs. Your previous run was restored.",
    };
  }

  return { ok: true as const };
}

export async function saveOnboardingAction(formData: FormData) {
  const motivationText = formData.get("motivation_text")?.toString().trim() ?? "";

  if (!motivationText) {
    redirect(
      getRedirectPath(
        "/onboarding",
        "error",
        "Write a short reason so the app can reflect it back to you.",
      ),
    );
  }

  const { supabase, user } = await requireActionUser();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      motivation_text: motivationText,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    redirect(getRedirectPath("/onboarding", "error", error.message));
  }

  redirect("/dashboard");
}

export async function startProgramAction() {
  const { supabase, user } = await requireOnboardedActionUser();
  const [program, existingUserProgram] = await Promise.all([
    getProgramByTitle(),
    getActiveUserProgram(user.id),
  ]);

  if (!program) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Mind Power content is missing from the database. Verify that the program and week content were seeded successfully.",
      ),
    );
  }

  if (existingUserProgram) {
    redirect("/dashboard");
  }

  const weekCount = await getProgramWeekCount(program.id);

  if (weekCount < 4) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Add all 4 program weeks before starting the program.",
      ),
    );
  }

  const startedAt = getTodayDate(appEnv.appTimezone);
  const { error } = await supabase.from("user_programs").insert({
    user_id: user.id,
    program_id: program.id,
    started_at: startedAt,
  });

  if (error?.code === "23505") {
    redirect("/dashboard");
  }

  if (error) {
    redirect(getRedirectPath("/dashboard", "error", error.message));
  }

  redirect("/session");
}

export async function restartProgramAction() {
  const { user } = await requireOnboardedActionUser();
  const [program, userProgram] = await Promise.all([
    getProgramByTitle(),
    getActiveUserProgram(user.id),
  ]);

  if (!program || !userProgram) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Start the program before trying to restart it.",
      ),
    );
  }

  const [weekCount, hasFinalSession] = await Promise.all([
    getProgramWeekCount(program.id),
    hasFinalSessionRecord(user.id, program.id, program.duration_days),
  ]);

  if (weekCount < 4) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Add all 4 program weeks before restarting the program.",
      ),
    );
  }

  const todayDate = getTodayDate(appEnv.appTimezone);
  const currentDayRaw = getCurrentDay(userProgram.started_at, todayDate);
  const canRestart =
    Boolean(userProgram.completed_at) ||
    currentDayRaw > program.duration_days ||
    hasFinalSession;

  if (!canRestart) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Finish the current 28-day run before restarting it.",
      ),
    );
  }

  const resetResult = await resetCurrentProgramRun(
    user.id,
    program.id,
    userProgram.id,
    todayDate,
  );

  if (!resetResult.ok) {
    redirect(getRedirectPath("/dashboard", "error", resetResult.error));
  }

  redirect(
    getRedirectPath(
      "/dashboard",
      "message",
      "A new 28-day run begins today. Start with Day 1 when you are ready.",
      { local_reset: "challenge" },
    ),
  );
}

export async function resetChallengeAction(formData: FormData) {
  const confirmed = formData.get("confirm_reset") === "yes";

  if (!confirmed) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Challenge reset was not confirmed.",
      ),
    );
  }

  const { user } = await requireOnboardedActionUser();
  const [program, userProgram] = await Promise.all([
    getProgramByTitle(),
    getActiveUserProgram(user.id),
  ]);

  if (!program || !userProgram) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Start the challenge before trying to reset it.",
      ),
    );
  }

  const todayDate = getTodayDate(appEnv.appTimezone);
  const resetResult = await resetCurrentProgramRun(
    user.id,
    program.id,
    userProgram.id,
    todayDate,
  );

  if (!resetResult.ok) {
    redirect(getRedirectPath("/dashboard", "error", resetResult.error));
  }

  redirect(
    getRedirectPath(
      "/dashboard",
      "message",
      "Challenge reset complete. You are back at Day 1 with a clean run.",
      { local_reset: "challenge" },
    ),
  );
}

export async function resetProgramStartAction() {
  const { supabase, user } = await requireOnboardedActionUser();
  const [program, userProgram] = await Promise.all([
    getProgramByTitle(),
    getActiveUserProgram(user.id),
  ]);

  if (!program || !userProgram) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Start the program before trying to reset it.",
      ),
    );
  }

  const todayDate = getTodayDate(appEnv.appTimezone);
  const currentDayRaw = getCurrentDay(userProgram.started_at, todayDate);
  const sessionCount = await getProgramSessionCount(user.id, program.id);

  if (currentDayRaw !== 1) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "The start date can only be cleared on the same day you began the program.",
      ),
    );
  }

  if (sessionCount > 0) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Day 1 has already been logged. The start can only be cleared before any session is submitted.",
      ),
    );
  }

  const { error } = await supabase.from("user_programs").delete().eq("id", userProgram.id);

  if (error) {
    redirect(getRedirectPath("/dashboard", "error", error.message));
  }

  redirect(
    getRedirectPath(
      "/dashboard",
      "message",
      "Today's start was cleared. Come back tomorrow and begin Day 1 when you're ready.",
      { local_reset: "challenge" },
    ),
  );
}

export async function forceResetProgramStartAction() {
  const { supabase, user } = await requireOnboardedActionUser();
  const [program, userProgram] = await Promise.all([
    getProgramByTitle(),
    getActiveUserProgram(user.id),
  ]);

  if (!program || !userProgram) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Start the program before trying to reset it.",
      ),
    );
  }

  const todayDate = getTodayDate(appEnv.appTimezone);
  const currentDayRaw = getCurrentDay(userProgram.started_at, todayDate);

  if (currentDayRaw !== 1) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Day 1 can only be force-reset on the same day you began the program.",
      ),
    );
  }

  const existingSessions = await getProgramSessions(user.id, program.id);

  if (existingSessions.length === 0) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "No Day 1 session has been logged yet. Use the regular start reset instead.",
      ),
    );
  }

  const { error: deleteSessionsError } = await supabase
    .from("daily_sessions")
    .delete()
    .eq("user_id", user.id)
    .eq("program_id", program.id);

  if (deleteSessionsError) {
    redirect(getRedirectPath("/dashboard", "error", deleteSessionsError.message));
  }

  const { error: deleteUserProgramError } = await supabase
    .from("user_programs")
    .delete()
    .eq("id", userProgram.id);

  if (deleteUserProgramError) {
    const { error: restoreSessionsError } = await supabase
      .from("daily_sessions")
      .upsert(existingSessions);

    if (restoreSessionsError) {
      redirect(
        getRedirectPath(
          "/dashboard",
          "error",
          "The Day 1 reset failed and today's session could not be restored automatically. Check your database state before continuing.",
        ),
      );
    }

    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "The Day 1 reset could not be completed cleanly. Your current start was kept in place.",
      ),
    );
  }

  redirect(
    getRedirectPath(
      "/dashboard",
      "message",
      "Day 1 was cleared, including today's session. You can begin again tomorrow from a clean start.",
      { local_reset: "challenge" },
    ),
  );
}

export async function createConsistencyItemAction(formData: FormData) {
  const { supabase, user } = await requireOnboardedActionUser();
  const title = formData.get("title")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";

  if (!title) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Add a title for your consistency point.",
      ),
    );
  }

  if (title.length > 80) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Consistency titles must be 80 characters or fewer.",
      ),
    );
  }

  const { error } = await supabase.from("consistency_items").insert({
    user_id: user.id,
    title,
    description: description || null,
    is_active: true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(getRedirectPath("/dashboard", "error", error.message));
  }

  redirect(
    getRedirectPath(
      "/dashboard",
      "message",
      "Consistency point added.",
    ),
  );
}

export async function setConsistencyTodayCompletionAction(formData: FormData) {
  const { supabase, user } = await requireOnboardedActionUser();
  const consistencyItemId = formData.get("consistency_item_id")?.toString().trim() ?? "";
  const completed = parseBooleanFlag(formData.get("completed"));

  if (!consistencyItemId || completed === null) {
    redirect(getRedirectPath("/dashboard", "error", "Invalid consistency update request."));
  }

  const { data: ownedItem } = await supabase
    .from("consistency_items")
    .select("id")
    .eq("id", consistencyItemId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ownedItem) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Consistency point not found.",
      ),
    );
  }

  const logDate = getTodayDate(appEnv.appTimezone);
  const { error } = await supabase.from("consistency_logs").upsert(
    {
      user_id: user.id,
      consistency_item_id: consistencyItemId,
      log_date: logDate,
      completed,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,consistency_item_id,log_date",
    },
  );

  if (error) {
    redirect(getRedirectPath("/dashboard", "error", error.message));
  }

  redirect("/dashboard");
}

export async function setConsistencyItemStatusAction(formData: FormData) {
  const { supabase, user } = await requireOnboardedActionUser();
  const consistencyItemId = formData.get("consistency_item_id")?.toString().trim() ?? "";
  const isActive = parseBooleanFlag(formData.get("is_active"));

  if (!consistencyItemId || isActive === null) {
    redirect(getRedirectPath("/dashboard", "error", "Invalid consistency status update."));
  }

  const { error } = await supabase
    .from("consistency_items")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", consistencyItemId)
    .eq("user_id", user.id);

  if (error) {
    redirect(getRedirectPath("/dashboard", "error", error.message));
  }

  redirect("/dashboard");
}

export async function submitSessionAction(formData: FormData) {
  const { supabase, user } = await requireOnboardedActionUser();
  const [program, userProgram] = await Promise.all([
    getProgramByTitle(),
    getActiveUserProgram(user.id),
  ]);

  if (!program || !userProgram) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "Start the program before logging a daily session.",
      ),
    );
  }

  const todayDate = getTodayDate(appEnv.appTimezone);
  const currentDayRaw = getCurrentDay(userProgram.started_at, todayDate);

  if (currentDayRaw > program.duration_days) {
    redirect(
      getRedirectPath(
        "/dashboard",
        "message",
        "The 28-day window is complete. No new session is due today. Review the run or start again from Day 1 whenever you are ready.",
      ),
    );
  }

  const dayNumber = currentDayRaw;
  const weekNumber = getWeekNumber(dayNumber);
  const reflectionText = formData.get("reflection_text")?.toString().trim() ?? "";
  const promiseKept = parsePromiseAnswer(formData.get("promise_kept"));
  const exerciseCompleted = formData.get("exercise_completed") === "on";
  const { data: currentWeekContent } = await supabase
    .from("program_weeks")
    .select("id")
    .eq("program_id", program.id)
    .eq("week_number", weekNumber)
    .maybeSingle();

  if (!currentWeekContent) {
    redirect(
      getRedirectPath(
        "/session",
        "error",
        "This week's content is missing. Add it before submitting a session.",
      ),
    );
  }

  const { data: existingSession } = await supabase
    .from("daily_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("program_id", program.id)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (existingSession) {
    redirect("/session");
  }

  const { error } = await supabase.from("daily_sessions").insert({
    user_id: user.id,
    program_id: program.id,
    day_number: dayNumber,
    week_number: weekNumber,
    session_date: todayDate,
    exercise_completed: exerciseCompleted,
    reflection_text: reflectionText || null,
    promise_kept: promiseKept,
  });

  if (error?.code === "23505") {
    redirect("/session");
  }

  if (error) {
    redirect(getRedirectPath("/session", "error", error.message));
  }

  if (dayNumber === PROGRAM_DURATION_DAYS) {
    await supabase
      .from("user_programs")
      .update({
        completed_at: todayDate,
      })
      .eq("id", userProgram.id);

    redirect(
      getRedirectPath(
        "/dashboard",
        "message",
        "Your 28-day run is complete. Review it or begin again whenever you are ready.",
      ),
    );
  }

  redirect("/dashboard?message=Today%27s%20session%20is%20complete.");
}
