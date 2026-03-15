import type { DailySession, IntegrityScore, ProgramMetrics } from "@/lib/types";

export const DAYS_PER_WEEK = 7;
export const PROGRAM_DURATION_DAYS = 28;
export const PROGRAM_TOTAL_WEEKS = 4;

export function getTodayDate(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function toUtcTimestamp(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);

  return Date.UTC(year, month - 1, day);
}

export function getCurrentDay(startedAt: string, todayDate: string) {
  const differenceInMs = toUtcTimestamp(todayDate) - toUtcTimestamp(startedAt);
  const differenceInDays = Math.floor(differenceInMs / 86_400_000);

  return Math.max(1, differenceInDays + 1);
}

export function clampProgramDay(dayNumber: number, durationDays = PROGRAM_DURATION_DAYS) {
  return Math.min(Math.max(dayNumber, 1), durationDays);
}

export function getWeekNumber(dayNumber: number) {
  return Math.min(
    Math.max(Math.ceil(clampProgramDay(dayNumber) / DAYS_PER_WEEK), 1),
    PROGRAM_TOTAL_WEEKS,
  );
}

export function isFirstDayOfWeek(dayNumber: number) {
  return (clampProgramDay(dayNumber) - 1) % DAYS_PER_WEEK === 0;
}

export function getCompletedDayNumbers(sessions: DailySession[]) {
  return new Set(
    sessions
      .map((session) => session.day_number)
      .filter((dayNumber) => dayNumber >= 1 && dayNumber <= PROGRAM_DURATION_DAYS),
  );
}

export function isSessionCompleteForDay(sessions: DailySession[], dayNumber: number) {
  const completedDayNumbers = getCompletedDayNumbers(sessions);

  return completedDayNumbers.has(dayNumber);
}

export function calculateIntegrityScore(sessions: DailySession[]): IntegrityScore {
  const answeredSessions = sessions.filter((session) => session.promise_kept !== null);
  const keptCount = answeredSessions.filter((session) => session.promise_kept).length;
  const answeredCount = answeredSessions.length;
  const percentage =
    answeredCount === 0 ? 0 : Math.round((keptCount / answeredCount) * 100);

  return {
    answeredCount,
    keptCount,
    percentage,
  };
}

export function calculateProgressPercentage(
  sessions: DailySession[],
  durationDays = PROGRAM_DURATION_DAYS,
) {
  const completedDaysCount = getCompletedDayNumbers(sessions).size;

  return Math.round((completedDaysCount / durationDays) * 100);
}

export function calculateCurrentStreak(
  sessions: DailySession[],
  currentDayRaw: number,
  durationDays = PROGRAM_DURATION_DAYS,
) {
  const completedDayNumbers = getCompletedDayNumbers(sessions);
  let dayCursor = Math.min(currentDayRaw, durationDays);

  if (!completedDayNumbers.has(dayCursor)) {
    dayCursor -= 1;
  }

  let streak = 0;

  while (dayCursor > 0 && completedDayNumbers.has(dayCursor)) {
    streak += 1;
    dayCursor -= 1;
  }

  return streak;
}

export function buildProgramMetrics(
  sessions: DailySession[],
  currentDayRaw: number,
  durationDays = PROGRAM_DURATION_DAYS,
): ProgramMetrics {
  const currentDay = clampProgramDay(currentDayRaw, durationDays);
  const completedDaysCount = getCompletedDayNumbers(sessions).size;

  return {
    currentDay,
    currentDayRaw,
    currentWeek: getWeekNumber(currentDay),
    completedDaysCount,
    progressPercentage: calculateProgressPercentage(sessions, durationDays),
    streak: calculateCurrentStreak(sessions, currentDayRaw, durationDays),
    integrityScore: calculateIntegrityScore(sessions),
    isWeekStartDay: isFirstDayOfWeek(currentDay),
    isSessionComplete: isSessionCompleteForDay(sessions, currentDay),
    isProgramFinished: currentDayRaw > durationDays,
  };
}

export function getProgramEndState(
  metrics: ProgramMetrics,
  durationDays = PROGRAM_DURATION_DAYS,
) {
  const hasCompletedFinalSession =
    metrics.currentDay === durationDays && metrics.isSessionComplete;

  return {
    hasCompletedFinalSession,
    hasProgramEnded: metrics.isProgramFinished || hasCompletedFinalSession,
    hasWindowClosedWithoutFinalSession:
      metrics.isProgramFinished && !hasCompletedFinalSession,
  };
}
