import Link from "next/link";

import { AudioCard } from "@/components/audio-card";
import { ExerciseTimer } from "@/components/exercise-timer";
import { ExerciseWorkbook } from "@/components/exercise-workbook";
import { NoticeBanner } from "@/components/notice-banner";
import { RestartProgramForm } from "@/components/restart-program-form";
import { SessionForm } from "@/components/session-form";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getExerciseResponsesForRunDay, getPublicAudioUrl, getUserProgramSnapshot } from "@/lib/data";
import { getExerciseContentForWeek } from "@/lib/exercise-content";
import { getMindPowerWeekAudioTracks } from "@/lib/mind-power-audio-catalog";
import { getProgramEndState } from "@/lib/program";
import type { RouteSearchParams } from "@/lib/route-utils";
import { readSearchParam } from "@/lib/route-utils";

type SessionPageProps = {
  searchParams?: RouteSearchParams;
};

function formatPromiseValue(value: boolean | null) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Left unanswered";
}

export default async function SessionPage({ searchParams }: SessionPageProps) {
  const user = await requireAuthenticatedUser();
  const snapshot = await getUserProgramSnapshot(user.id);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const error = readSearchParam(resolvedSearchParams.error);

  if (!snapshot.program) {
    return (
      <NoticeBanner
        message="Mind Power content is missing from the database. Verify that the program and week content were seeded successfully."
        tone="error"
      />
    );
  }

  if (!snapshot.userProgram || !snapshot.metrics) {
    return (
      <div className="space-y-4 pb-4">
        <div className="flex items-center pt-2">
          <h1 className="text-2xl font-bold">Today</h1>
        </div>
        <div className="surface space-y-4 p-6">
          <p className="text-base leading-7 text-[var(--muted)]">
            Start the program from the home screen to unlock today&apos;s session.
          </p>
          <Link className="primary-button w-full" href="/dashboard">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const { metrics, currentWeekContent, todaySession, userProgram } = snapshot;
  const { hasCompletedFinalSession, hasProgramEnded, hasWindowClosedWithoutFinalSession } =
    getProgramEndState(metrics, snapshot.program.duration_days);
  const hasCompleteWeekContent = snapshot.weeks.length >= 4;

  if (hasProgramEnded) {
    return (
      <div className="space-y-4 pb-4">
        <div className="flex items-center pt-2">
          <h1 className="text-2xl font-bold">Today</h1>
        </div>
        {!hasCompleteWeekContent ? (
          <NoticeBanner
            message="Program content is incomplete. Add all 4 weeks before starting the program again."
            tone="error"
          />
        ) : null}
        <div className="surface space-y-4 p-6">
          <p className="eyebrow">
            {hasWindowClosedWithoutFinalSession ? "28-Day Window Complete" : "Program Complete"}
          </p>
          <h2 className="text-2xl font-bold">
            {hasWindowClosedWithoutFinalSession
              ? "Your guided window has ended."
              : "Your 28-day run is complete."}
          </h2>
          <p className="text-base leading-7 text-[var(--muted)]">
            {hasWindowClosedWithoutFinalSession
              ? "No new session is due today. Review the run you just finished, then start again from Day 1 whenever you want."
              : hasCompletedFinalSession
                ? "Day 28 is complete. Revisit the library, review your progress, or begin a fresh 28-day run."
                : "You can still revisit the library and review your progress whenever you want."}
          </p>
          <div className="flex flex-col gap-3">
            {hasCompleteWeekContent ? (
              <RestartProgramForm>Start the Program Again</RestartProgramForm>
            ) : null}
            <Link className="secondary-button w-full" href="/progress">
              View Progress
            </Link>
            <Link className="secondary-button w-full" href="/library">
              Open Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const weekAudioTracks =
    metrics.isWeekStartDay && currentWeekContent
      ? getMindPowerWeekAudioTracks(metrics.currentWeek).map((track) => ({
          ...track,
          audioUrl: getPublicAudioUrl(track.path),
          isCanonical: track.path === currentWeekContent.audio_path,
        }))
      : [];

  const exerciseTimerKey = `mind-power-exercise-timer-${user.id}-${userProgram.program_id}-${metrics.currentDay}-${userProgram.started_at}`;
  const exerciseContent = getExerciseContentForWeek(metrics.currentWeek);
  const exerciseResponses = await getExerciseResponsesForRunDay(
    user.id,
    userProgram.id,
    metrics.currentDay,
  );

  return (
    <div className="space-y-4 pb-4">
      {error ? <NoticeBanner message={error} tone="error" /> : null}

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Today</h1>
        <div className="surface-muted rounded-full px-4 py-2 text-sm font-semibold text-[var(--muted)]">
          Phase {metrics.currentWeek} · Day {metrics.currentDay}
        </div>
      </div>

      {todaySession ? (
        /* Session already complete */
        <div className="surface space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]">
              <svg fill="none" height={18} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24" width={18}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Day {metrics.currentDay} Complete</p>
              <p className="text-xs text-[var(--muted)]">{todaySession.session_date}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="surface-muted p-3">
              <p className="eyebrow">Exercises</p>
              <p className="mt-1 text-sm font-semibold">
                {todaySession.exercise_completed ? "Completed" : "Not checked off"}
              </p>
            </div>
            <div className="surface-muted p-3">
              <p className="eyebrow">Promise</p>
              <p className="mt-1 text-sm font-semibold">{formatPromiseValue(todaySession.promise_kept)}</p>
            </div>
          </div>
          {todaySession.reflection_text ? (
            <div className="surface-muted p-4">
              <p className="eyebrow mb-2">Reflection</p>
              <p className="whitespace-pre-wrap text-sm leading-7">
                {todaySession.reflection_text}
              </p>
            </div>
          ) : null}
          <p className="text-center text-sm text-[var(--muted)]">
            Return tomorrow for Day {metrics.currentDay + 1}.
          </p>
        </div>
      ) : (
        <>
          {/* Exercises — front and centre */}
          {exerciseContent ? (
            <ExerciseWorkbook
              content={exerciseContent}
              dayNumber={metrics.currentDay}
              initialResponses={exerciseResponses}
              key={`workbook-${userProgram.id}-${metrics.currentDay}-${metrics.currentWeek}`}
              programId={userProgram.program_id}
              timerStorageKey={exerciseTimerKey}
              userProgramId={userProgram.id}
              weekNumber={metrics.currentWeek}
            />
          ) : null}

          {/* Timer */}
          <ExerciseTimer
            key={exerciseTimerKey}
            storageKey={exerciseTimerKey}
          />

          {/* Audio — shown on week-start days, collapsible otherwise */}
          {currentWeekContent ? (
            metrics.isWeekStartDay ? (
              <div className="surface p-5">
                <p className="eyebrow mb-3">Week {metrics.currentWeek} Audio</p>
                <AudioCard
                  tracks={weekAudioTracks}
                  title={currentWeekContent.title ?? `Week ${metrics.currentWeek}`}
                />
              </div>
            ) : (
              <details className="surface p-5">
                <summary className="cursor-pointer list-none font-semibold text-[var(--foreground)]">
                  Week {metrics.currentWeek} Audio
                </summary>
                <div className="mt-4">
                  <p className="mb-3 text-sm text-[var(--muted)]">
                    The weekly audio is available in the library anytime.
                  </p>
                  <Link className="secondary-button w-full text-center" href="/library">
                    Open Library Audio
                  </Link>
                </div>
              </details>
            )
          ) : null}

          {/* Close the day */}
          {currentWeekContent ? (
            <div className="surface space-y-4 p-5">
              <div>
                <p className="font-bold">Close Today</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  When you&apos;re done, log your reflection and mark the day complete.
                </p>
              </div>
              <SessionForm
                draftKey={`mind-power-session-${userProgram.id}-${userProgram.started_at}-${metrics.currentDay}`}
              />
            </div>
          ) : (
            <div className="surface p-5">
              <p className="text-sm text-[var(--muted)]">
                This week&apos;s content hasn&apos;t been configured yet. Add the matching program week before logging a session.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
