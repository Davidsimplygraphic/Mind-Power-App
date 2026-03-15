import Link from "next/link";

import { AudioCard } from "@/components/audio-card";
import { ExerciseChecklist } from "@/components/exercise-checklist";
import { ExerciseTimer } from "@/components/exercise-timer";
import { NoticeBanner } from "@/components/notice-banner";
import { RestartProgramForm } from "@/components/restart-program-form";
import { SessionForm } from "@/components/session-form";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getPublicAudioUrl, getUserProgramSnapshot } from "@/lib/data";
import { parseExerciseText } from "@/lib/exercises";
import { getMindPowerWeekAudioTracks } from "@/lib/mind-power-audio-catalog";
import { getProgramEndState } from "@/lib/program";
import type { RouteSearchParams } from "@/lib/route-utils";
import { readSearchParam } from "@/lib/route-utils";

type SessionPageProps = {
  searchParams?: RouteSearchParams;
};

function formatPromiseValue(value: boolean | null) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

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
      <section className="surface space-y-4 p-6">
        <p className="eyebrow">Session</p>
        <h2 className="text-3xl">Start the program to unlock today&apos;s session.</h2>
        <p className="text-base leading-7 text-[var(--muted)]">
          Once Day 1 begins, this page will always tell you exactly what to do next.
        </p>
        <Link
          className="primary-button w-full sm:w-auto"
          href="/dashboard"
        >
          Go to Dashboard
        </Link>
      </section>
    );
  }

  const { metrics, currentWeekContent, todaySession, userProgram } = snapshot;
  const { hasCompletedFinalSession, hasProgramEnded, hasWindowClosedWithoutFinalSession } =
    getProgramEndState(metrics, snapshot.program.duration_days);
  const hasCompleteWeekContent = snapshot.weeks.length >= 4;

  if (hasProgramEnded) {
    return (
      <div className="space-y-4">
        {!hasCompleteWeekContent ? (
          <NoticeBanner
            message="Program content is incomplete. Add all 4 weeks before starting the program again."
            tone="error"
          />
        ) : null}

        <section className="surface space-y-4 p-6">
          <p className="eyebrow">
            {hasWindowClosedWithoutFinalSession ? "28-Day Window Complete" : "Program Complete"}
          </p>
          <h2 className="text-3xl">
            {hasWindowClosedWithoutFinalSession
              ? "Your guided window has ended."
              : "Your 28-day run is complete."}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
            {hasWindowClosedWithoutFinalSession
              ? "No new session is due today. Review the run you just finished, then start again from Day 1 whenever you want another pass."
              : hasCompletedFinalSession
                ? "Day 28 is complete. You can revisit the library, read through your progress, or begin a fresh 28-day run."
                : "You can still revisit the library and read through your progress whenever you want."}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {hasCompleteWeekContent ? (
              <RestartProgramForm>Start the Program Again</RestartProgramForm>
            ) : null}
            <Link
              className="secondary-button w-full sm:w-auto"
              href="/progress"
            >
              View Progress
            </Link>
            <Link
              className="secondary-button w-full sm:w-auto"
              href="/library"
            >
              Open Library
            </Link>
          </div>
        </section>
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
  const exerciseChecklistKey = `mind-power-exercise-checklist-${user.id}-${userProgram.program_id}-${metrics.currentDay}-${userProgram.started_at}`;
  const exerciseItems = parseExerciseText(currentWeekContent?.exercise_text);

  return (
    <div className="space-y-6">
      {error ? (
        <NoticeBanner
          message={error}
          tone="error"
        />
      ) : null}
      {!hasCompleteWeekContent ? (
        <NoticeBanner
          message="Program content is incomplete. Add all 4 weeks so today's session always has the right guidance."
          tone="error"
        />
      ) : null}

      <section className="surface space-y-4 p-6">
        <p className="eyebrow">Today&apos;s Session</p>
        <div className="space-y-2">
          <h2 className="text-4xl">
            Day {metrics.currentDay} - Week {metrics.currentWeek}
          </h2>
          <p className="text-base leading-7 text-[var(--muted)]">
            {metrics.isWeekStartDay
              ? "Start the week with this week's audio guidance, then complete the exercises and reflection."
              : "Repeat this week's exercises, reflect briefly, and close the day with honesty."}
          </p>
        </div>
      </section>

      {!currentWeekContent ? (
        <section className="surface space-y-4 p-6">
          <p className="eyebrow">Missing Week Content</p>
          <h2 className="text-3xl">This week has not been configured yet.</h2>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
            Add the matching `program_weeks` row and exercise text before using this
            session page for the current day.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="secondary-button w-full sm:w-auto"
              href="/library"
            >
              Open Library
            </Link>
            <Link
              className="secondary-button w-full sm:w-auto"
              href="/dashboard"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>
      ) : null}

      {metrics.isWeekStartDay && currentWeekContent ? (
        <AudioCard
          tracks={weekAudioTracks}
          title={currentWeekContent.title ?? `Week ${metrics.currentWeek}`}
        />
      ) : null}

      {currentWeekContent ? (
        <section className="surface space-y-4 p-6">
          <div className="space-y-1">
            <p className="eyebrow">Exercises</p>
            <h2 className="text-2xl">
              {currentWeekContent.title ?? `Week ${metrics.currentWeek}`} practice
            </h2>
          </div>
          {exerciseItems.length > 0 ? (
            <ExerciseChecklist
              items={exerciseItems}
              storageKey={exerciseChecklistKey}
            />
          ) : (
            <p className="text-base leading-8 text-[var(--foreground)]">
              {currentWeekContent.exercise_text?.trim() ||
                "Exercise text is missing for this week. Update the matching program_weeks row to add it."}
            </p>
          )}
        </section>
      ) : null}

      {currentWeekContent && !todaySession ? (
        <ExerciseTimer
          key={exerciseTimerKey}
          storageKey={exerciseTimerKey}
        />
      ) : null}

      {currentWeekContent && todaySession ? (
        <section className="surface space-y-5 p-6">
          <div className="space-y-2">
            <p className="eyebrow">Completed</p>
            <h2 className="text-3xl">Today&apos;s session is already complete.</h2>
            <p className="text-sm text-[var(--muted)]">
              You can review what you logged below, then return tomorrow for the next
              step.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="surface-muted p-4">
              <p className="eyebrow">Exercises</p>
              <p className="mt-2 text-lg">
                {todaySession.exercise_completed ? "Completed" : "Not checked off"}
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="eyebrow">Promise</p>
              <p className="mt-2 text-lg">{formatPromiseValue(todaySession.promise_kept)}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="eyebrow">Session Date</p>
              <p className="mt-2 text-lg">{todaySession.session_date}</p>
            </div>
          </div>

          <div className="surface-muted p-5">
            <p className="eyebrow">Reflection</p>
            <p className="mt-3 whitespace-pre-wrap text-base leading-8">
              {todaySession.reflection_text?.trim() || "No reflection was added today."}
            </p>
          </div>
        </section>
      ) : currentWeekContent ? (
        <section className="surface space-y-5 p-6">
          <div className="space-y-2">
            <p className="eyebrow">Check In</p>
            <h2 className="text-3xl">Close today cleanly.</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Your in-progress draft is saved locally in this browser, so a refresh
              won&apos;t wipe what you&apos;ve written before you submit.
            </p>
          </div>

          <SessionForm
            draftKey={`mind-power-session-${userProgram.id}-${userProgram.started_at}-${metrics.currentDay}`}
          />
        </section>
      ) : null}
    </div>
  );
}
