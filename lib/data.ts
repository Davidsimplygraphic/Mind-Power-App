import { cache } from "react";

import { normalizeAudioPath } from "@/lib/audio";
import { appEnv } from "@/lib/env";
import { buildProgramMetrics, getCurrentDay, getTodayDate } from "@/lib/program";
import { getSupabasePublicClient } from "@/lib/supabase-public";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type {
  ConsistencyItem,
  ConsistencyLog,
  DailySession,
  Profile,
  Program,
  ProgramWeek,
  UserProgram,
  UserProgramSnapshot,
} from "@/lib/types";

export const getProfileByUserId = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (data) {
    return data as Profile;
  }

  if (error) {
    return null;
  }

  const { data: insertedProfile, error: upsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
      },
      {
        onConflict: "id",
      },
    )
    .select("*")
    .maybeSingle();

  if (upsertError) {
    return null;
  }

  return (insertedProfile as Profile | null) ?? null;
});

export const getProgramByTitle = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("programs")
    .select("*")
    .eq("title", appEnv.programTitle)
    .maybeSingle();

  return (data as Program | null) ?? null;
});

export const getProgramWeeks = cache(async (programId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("program_weeks")
    .select("*")
    .eq("program_id", programId)
    .order("week_number", { ascending: true });

  return (data as ProgramWeek[] | null) ?? [];
});

export const getActiveUserProgram = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_programs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as UserProgram | null) ?? null;
});

export const getDailySessions = cache(async (userId: string, programId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("daily_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .order("day_number", { ascending: true });

  return (data as DailySession[] | null) ?? [];
});

export const getConsistencyItemsByUserId = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("consistency_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    return [] as ConsistencyItem[];
  }

  return (data as ConsistencyItem[] | null) ?? [];
});

export const getConsistencyLogsByDate = cache(async (userId: string, logDate: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("consistency_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", logDate);

  if (error) {
    return [] as ConsistencyLog[];
  }

  return (data as ConsistencyLog[] | null) ?? [];
});

export function getPublicAudioUrl(audioPath: string | null) {
  const trimmedAudioPath = normalizeAudioPath(audioPath);

  if (!trimmedAudioPath) {
    return null;
  }

  const supabase = getSupabasePublicClient();
  const { data } = supabase.storage.from(appEnv.audioBucket).getPublicUrl(trimmedAudioPath);

  return data.publicUrl || null;
}

export async function getUserProgramSnapshot(userId: string): Promise<UserProgramSnapshot> {
  const todayDate = getTodayDate(appEnv.appTimezone);
  const [profile, program, userProgram] = await Promise.all([
    getProfileByUserId(userId),
    getProgramByTitle(),
    getActiveUserProgram(userId),
  ]);

  if (!program) {
    return {
      profile,
      program: null,
      weeks: [],
      userProgram: null,
      sessions: [],
      metrics: null,
      todaySession: null,
      todayDate,
      currentWeekContent: null,
    };
  }

  const weeks = await getProgramWeeks(program.id);

  if (!userProgram) {
    return {
      profile,
      program,
      weeks,
      userProgram: null,
      sessions: [],
      metrics: null,
      todaySession: null,
      todayDate,
      currentWeekContent: weeks[0] ?? null,
    };
  }

  const sessions = await getDailySessions(userId, program.id);
  const currentDayRaw = getCurrentDay(userProgram.started_at, todayDate);
  const metrics = buildProgramMetrics(sessions, currentDayRaw, program.duration_days);
  const todaySession =
    sessions.find((session) => session.day_number === metrics.currentDay) ?? null;

  return {
    profile,
    program,
    weeks,
    userProgram,
    sessions,
    metrics,
    todaySession,
    todayDate,
    currentWeekContent:
      weeks.find((week) => week.week_number === metrics.currentWeek) ?? null,
  };
}
