"use server";

import { PROGRAM_DURATION_DAYS } from "@/lib/program";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type UpsertExerciseResponseInput = {
  userProgramId: string;
  programId: string;
  weekNumber: number;
  dayNumber: number;
  sectionId: string;
  responseText?: string | null;
  responseJson?: unknown | null;
};

type UpsertExerciseResponseResult = {
  ok: boolean;
  error?: string;
  updatedAt?: string;
};

function normalizeOptionalText(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.replace(/\r/g, "").trimEnd();

  return normalizedValue.trim() ? normalizedValue : null;
}

function normalizeSectionId(value: string) {
  return value.trim();
}

function normalizeDayNumber(value: number) {
  return Math.trunc(value);
}

export async function upsertExerciseResponseAction(
  input: UpsertExerciseResponseInput,
): Promise<UpsertExerciseResponseResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "You are not authenticated.",
    };
  }

  const sectionId = normalizeSectionId(input.sectionId);
  const dayNumber = normalizeDayNumber(input.dayNumber);
  const weekNumber = normalizeDayNumber(input.weekNumber);

  if (!sectionId || sectionId.length > 120) {
    return {
      ok: false,
      error: "Section identifier is invalid.",
    };
  }

  if (dayNumber < 1 || dayNumber > PROGRAM_DURATION_DAYS) {
    return {
      ok: false,
      error: "Day number is out of range.",
    };
  }

  if (weekNumber < 1 || weekNumber > 4) {
    return {
      ok: false,
      error: "Week number is out of range.",
    };
  }

  const { data: ownedRun, error: runLookupError } = await supabase
    .from("user_programs")
    .select("id, program_id")
    .eq("id", input.userProgramId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (runLookupError) {
    return {
      ok: false,
      error: runLookupError.message,
    };
  }

  if (!ownedRun || ownedRun.program_id !== input.programId) {
    return {
      ok: false,
      error: "The selected program run is invalid.",
    };
  }

  const responseText = normalizeOptionalText(input.responseText);
  const responseJson = input.responseJson ?? null;
  const hasResponsePayload = Boolean(responseText) || responseJson !== null;

  if (!hasResponsePayload) {
    const { error: deleteError } = await supabase
      .from("exercise_responses")
      .delete()
      .eq("user_id", user.id)
      .eq("program_id", input.programId)
      .eq("user_program_id", input.userProgramId)
      .eq("day_number", dayNumber)
      .eq("section_id", sectionId);

    if (deleteError) {
      return {
        ok: false,
        error: deleteError.message,
      };
    }

    return { ok: true };
  }

  const updatedAt = new Date().toISOString();
  const { error } = await supabase.from("exercise_responses").upsert(
    {
      user_id: user.id,
      program_id: input.programId,
      user_program_id: input.userProgramId,
      week_number: weekNumber,
      day_number: dayNumber,
      section_id: sectionId,
      response_text: responseText,
      response_json: responseJson,
      updated_at: updatedAt,
    },
    {
      onConflict: "user_program_id,day_number,section_id",
    },
  );

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  return {
    ok: true,
    updatedAt,
  };
}
