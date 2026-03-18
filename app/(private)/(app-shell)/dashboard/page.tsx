import Link from "next/link";

import { startProgramAction } from "@/app/actions/program";
import { ClearRunLocalState } from "@/components/clear-run-local-state";
import { ConsistencyTracker } from "@/components/consistency-tracker";
import { ForceResetProgramStartForm } from "@/components/force-reset-program-start-form";
import { NoticeBanner } from "@/components/notice-banner";
import { ResetChallengeForm } from "@/components/reset-challenge-form";
import { RestartProgramForm } from "@/components/restart-program-form";
import { ResetProgramStartForm } from "@/components/reset-program-start-form";
import { requireAuthenticatedUser } from "@/lib/auth";
import {
  getConsistencyItemsByUserId,
  getConsistencyLogsByDate,
  getExerciseResponsesForRunDayRange,
  getUserProgramSnapshot,
} from "@/lib/data";
import { getProgramEndState } from "@/lib/program";
import type { RouteSearchParams } from "@/lib/route-utils";
import { readSearchParam } from "@/lib/route-utils";

type DashboardPageProps = {
  searchParams?: RouteSearchParams;
};

function getNextStepCopy(
  hasProgramEnded: boolean,
  hasWindowClosedWithoutFinalSession: boolean,
  isSessionComplete: boolean,
  isWeekStartDay: boolean,
  weekTitle: string,
) {
  if (hasProgramEnded) {
    if (hasWindowClosedWithoutFinalSession) {
      return "The 28-day window has closed. Review what you captured, then begin again from Day 1 whenever you want another run.";
    }

    return "Your 28-day run is complete. Take in what changed, revisit the library, or begin again from Day 1 when you feel ready.";
  }

  if (isSessionComplete) {
    return "Today is complete. Let the work settle, and return tomorrow for the next guided step.";
  }

  if (isWeekStartDay) {
    return `Listen to ${weekTitle}'s audio, then complete today's exercise set and reflection.`;
  }

  return `Repeat ${weekTitle}'s exercises, reflect briefly, and close the day with integrity.`;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuthenticatedUser();
  const snapshot = await getUserProgramSnapshot(user.id);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const message = readSearchParam(resolvedSearchParams.message);
  const error = readSearchParam(resolvedSearchParams.error);
  const localResetSignal = readSearchParam(resolvedSearchParams.local_reset) ?? null;
  const hasCompleteWeekContent = snapshot.weeks.length >= 4;

  if (!snapshot.program) {
    return (
      <div className="space-y-6">
        <NoticeBanner
          message="Mind Power content is missing from the database. Verify that the program and week content were seeded successfully."
          tone="error"
        />
      </div>
    );
  }

  if (!snapshot.userProgram || !snapshot.metrics) {
    return (
      <div className="space-y-6">
        <ClearRunLocalState resetSignal={localResetSignal} />
        {message ? <NoticeBanner message={message} /> : null}
        {error ? (
          <NoticeBanner
            message={error}
            tone="error"
          />
        ) : null}
        {!hasCompleteWeekContent ? (
          <NoticeBanner
            message="Program content is incomplete. Seed all 4 program weeks before starting."
            tone="error"
          />
        ) : null}

        <section className="surface space-y-6 p-6">
          <div className="space-y-3">
            <p className="eyebrow">Ready to begin</p>
            <h2 className="text-4xl">Your 28-day program is set up and waiting.</h2>
            <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
              Starting the program sets Day 1 to today. From there, the app will guide
              you through one audio at the start of each week and one daily set of
              exercises for each day that follows.
            </p>
          </div>

          {snapshot.profile?.motivation_text ? (
            <div className="surface-muted p-5">
              <p className="eyebrow">Your reason</p>
              <p className="mt-3 text-lg leading-8">{snapshot.profile.motivation_text}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            {hasCompleteWeekContent ? (
              <form
                action={startProgramAction}
                className="w-full sm:w-auto"
              >
                <button
                  className="primary-button w-full sm:w-auto"
                  type="submit"
                >
                  Begin Day 1
                </button>
              </form>
            ) : null}
            <Link
              className="secondary-button w-full sm:w-auto"
              href="/library"
            >
              Preview the Library
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { metrics, currentWeekContent, profile, program, userProgram } = snapshot;
  const { hasCompletedFinalSession, hasProgramEnded, hasWindowClosedWithoutFinalSession } =
    getProgramEndState(metrics, program.duration_days);
  const weekTitle = currentWeekContent?.title ?? `Week ${metrics.currentWeek}`;
  const nextStep = getNextStepCopy(
    hasProgramEnded,
    hasWindowClosedWithoutFinalSession,
    metrics.isSessionComplete,
    metrics.isWeekStartDay,
    weekTitle,
  );
  const canResetStartToday =
    !hasProgramEnded && metrics.currentDayRaw === 1 && snapshot.sessions.length === 0;
  const canForceResetDayOne =
    !hasProgramEnded && metrics.currentDayRaw === 1 && snapshot.sessions.length > 0;
  const weekStartDay = (metrics.currentWeek - 1) * 7 + 1;
  const weekEndDay = weekStartDay + 6;
  const completedWeekDayBoundary = Math.min(metrics.currentDay, weekEndDay);
  const hasPastDayForReflection = metrics.currentDay > 1;
  const [consistencyItems, consistencyLogsForToday] = await Promise.all([
    getConsistencyItemsByUserId(user.id),
    getConsistencyLogsByDate(user.id, snapshot.todayDate),
  ]);
  const weeklyExerciseResponses = await getExerciseResponsesForRunDayRange(
    user.id,
    userProgram.id,
    weekStartDay,
    completedWeekDayBoundary,
  );
  const yesterdayResponseCount = hasPastDayForReflection
    ? weeklyExerciseResponses.filter(
        (response) => response.day_number === metrics.currentDay - 1,
      ).length
    : 0;
  const weeklyResponseDaysCount = new Set(
    weeklyExerciseResponses.map((response) => response.day_number),
  ).size;

  return (
    <div className="space-y-6">
      <ClearRunLocalState resetSignal={localResetSignal} />
      {message ? <NoticeBanner message={message} /> : null}
      {error ? (
        <NoticeBanner
          message={error}
          tone="error"
        />
      ) : null}
      {!hasCompleteWeekContent ? (
        <NoticeBanner
          message="Only part of the program content is loaded. Add all 4 weeks to keep the daily guidance accurate."
          tone="error"
        />
      ) : null}

      <section className="surface space-y-6 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">
              {hasProgramEnded
                ? hasWindowClosedWithoutFinalSession
                  ? "28-Day Window Complete"
                  : "Program Complete"
                : "Today's Focus"}
            </p>
            <div className="space-y-2">
              {hasProgramEnded ? (
                <>
                  <h2 className="text-4xl sm:text-5xl">
                    {hasWindowClosedWithoutFinalSession
                      ? "Your guided window has ended."
                      : "Your 28-day run is complete."}
                  </h2>
                  <p className="text-lg text-[var(--muted)]">
                    {hasWindowClosedWithoutFinalSession
                      ? "No new session is due today. Review your 28-day record below or start the program again from Day 1."
                      : hasCompletedFinalSession
                        ? `Day ${program.duration_days} is complete. There is no new session due today.`
                        : "There is no new session due today."}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl sm:text-5xl">
                    Day {metrics.currentDay} of {program.duration_days}
                  </h2>
                  <p className="text-lg text-[var(--muted)]">
                    Week {metrics.currentWeek} of 4 -{" "}
                    {metrics.isSessionComplete ? "Session complete" : "Session incomplete"}
                  </p>
                </>
              )}
            </div>
            <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">{nextStep}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {hasProgramEnded ? (
              <>
                {hasCompleteWeekContent ? (
                  <RestartProgramForm>Start the Program Again</RestartProgramForm>
                ) : null}
                <Link
                  className="secondary-button w-full sm:w-auto"
                  href="/progress"
                >
                  Review Your Progress
                </Link>
              </>
            ) : metrics.isSessionComplete ? (
              <Link
                className="secondary-button w-full sm:w-auto"
                href="/session"
              >
                View Today&apos;s Session
              </Link>
            ) : (
              <>
                <Link
                  className="primary-button w-full sm:w-auto"
                  href="/session"
                >
                  Start Today&apos;s Session
                </Link>
                {canResetStartToday ? (
                  <ResetProgramStartForm />
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-muted p-5">
            <p className="eyebrow">Current Streak</p>
            <p className="mt-3 text-4xl">{metrics.streak}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Consecutive completed days.</p>
          </div>
          <div className="surface-muted p-5">
            <p className="eyebrow">Integrity Score</p>
            <p className="mt-3 text-4xl">{metrics.integrityScore.percentage}%</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {metrics.integrityScore.keptCount} kept out of{" "}
              {metrics.integrityScore.answeredCount} answered.
            </p>
          </div>
          <div className="surface-muted p-5">
            <p className="eyebrow">Program Progress</p>
            <p className="mt-3 text-4xl">{metrics.progressPercentage}%</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {metrics.completedDaysCount} of {program.duration_days} days completed.
            </p>
          </div>
        </div>
      </section>

      <ConsistencyTracker
        items={consistencyItems}
        logsForToday={consistencyLogsForToday}
        todayDate={snapshot.todayDate}
      />

      <section className="surface space-y-4 p-6">
        <p className="eyebrow">Reflection Foundations</p>
        <h2 className="text-2xl">Your reflection memory is being prepared.</h2>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
          This run now stores structured workbook responses per day. That enables
          upcoming features like reflecting yesterday&apos;s notes, weekly summaries,
          and pattern detection.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface-muted p-5">
            <p className="eyebrow">Yesterday&apos;s Captures</p>
            <p className="mt-2 text-3xl">{yesterdayResponseCount}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Workbook responses found for yesterday.
            </p>
          </div>
          <div className="surface-muted p-5">
            <p className="eyebrow">Week Response Days</p>
            <p className="mt-2 text-3xl">{weeklyResponseDaysCount}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Days this week with at least one workbook response.
            </p>
          </div>
        </div>
      </section>

      {canResetStartToday ? (
        <section className="surface space-y-3 p-6">
          <p className="eyebrow">Adjust Start</p>
          <h2 className="text-2xl">Started a little too early?</h2>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
            If you have not logged Day 1 yet, you can clear today&apos;s start and come
            back tomorrow to begin cleanly.
          </p>
        </section>
      ) : null}

      {canForceResetDayOne ? (
        <section className="surface space-y-4 p-6">
          <p className="eyebrow">Force Reset Day 1</p>
          <h2 className="text-2xl">Need to wipe today and start fresh tomorrow?</h2>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
            This clears the current run and permanently deletes today&apos;s Day 1
            session so you can begin again tomorrow from a clean start.
          </p>
          <NoticeBanner
            message="Use this only if you intentionally want to erase today's Day 1 progress."
            tone="error"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <ForceResetProgramStartForm />
            <Link
              className="secondary-button w-full sm:w-auto"
              href="/session"
            >
              Keep Today&apos;s Start
            </Link>
          </div>
        </section>
      ) : null}

      <section className="surface space-y-4 p-6">
        <p className="eyebrow">Reset Challenge</p>
        <h2 className="text-2xl">Start over from Day 1</h2>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
          This clears the current run&apos;s progress, daily sessions, workbook responses,
          and run-window consistency logs, then resets the challenge to a fresh Day 1
          state.
        </p>
        <ResetChallengeForm />
      </section>

      {profile?.motivation_text ? (
        <section className="surface space-y-3 p-6">
          <p className="eyebrow">Why You Started</p>
          <p className="text-lg leading-8">{profile.motivation_text}</p>
        </section>
      ) : null}
    </div>
  );
}
