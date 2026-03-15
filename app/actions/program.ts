"use server";

import { redirect } from "next/navigation";

import { appEnv } from "@/lib/env";
import { getActiveUserProgram, getProgramByTitle, getProfileByUserId } from "@/lib/data";
import { getCurrentDay, getWeekNumber, PROGRAM_DURATION_DAYS, getTodayDate } from "@/lib/program";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function getRedirectPath(pathname: string, type: "error" | "message", message: string) {
  return `${pathname}?${type}=${encodeURIComponent(message)}`;
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

  const previousStartedAt = userProgram.started_at;
  const previousCompletedAt = userProgram.completed_at;
  const { error: updateError } = await supabase
    .from("user_programs")
    .update({
      started_at: todayDate,
      completed_at: null,
    })
    .eq("id", userProgram.id);

  if (updateError) {
    redirect(getRedirectPath("/dashboard", "error", updateError.message));
  }

  const { error: deleteError } = await supabase
    .from("daily_sessions")
    .delete()
    .eq("user_id", user.id)
    .eq("program_id", program.id);

  if (deleteError) {
    await supabase
      .from("user_programs")
      .update({
        started_at: previousStartedAt,
        completed_at: previousCompletedAt,
      })
      .eq("id", userProgram.id);

    redirect(
      getRedirectPath(
        "/dashboard",
        "error",
        "The program could not be restarted cleanly. Your previous run was kept in place.",
      ),
    );
  }

  redirect(
    getRedirectPath(
      "/dashboard",
      "message",
      "A new 28-day run begins today. Start with Day 1 when you are ready.",
    ),
  );
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
