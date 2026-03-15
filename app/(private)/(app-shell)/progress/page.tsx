import Link from "next/link";

import { NoticeBanner } from "@/components/notice-banner";
import { RestartProgramForm } from "@/components/restart-program-form";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getUserProgramSnapshot } from "@/lib/data";
import { getProgramEndState } from "@/lib/program";

export default async function ProgressPage() {
  const user = await requireAuthenticatedUser();
  const snapshot = await getUserProgramSnapshot(user.id);

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
        <p className="eyebrow">Progress</p>
        <h2 className="text-3xl">Start the program to see your 28-day map.</h2>
        <p className="text-base leading-7 text-[var(--muted)]">
          As you complete sessions, each day will fill in here week by week.
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

  const completedDays = new Set(snapshot.sessions.map((session) => session.day_number));
  const { metrics, program } = snapshot;
  const { hasCompletedFinalSession, hasProgramEnded, hasWindowClosedWithoutFinalSession } =
    getProgramEndState(metrics, program.duration_days);
  const hasCompleteWeekContent = snapshot.weeks.length >= 4;
  const accessibleDay = Math.min(metrics.currentDay, program.duration_days);

  return (
    <div className="space-y-6">
      {!hasCompleteWeekContent && hasProgramEnded ? (
        <NoticeBanner
          message="Program content is incomplete. Add all 4 weeks before starting the program again."
          tone="error"
        />
      ) : null}

      <section className="surface space-y-5 p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="eyebrow">
              {hasProgramEnded
                ? hasWindowClosedWithoutFinalSession
                  ? "28-Day Window Complete"
                  : "Program Complete"
                : "Progress"}
            </p>
            <h2 className="text-4xl">
              {hasProgramEnded
                ? hasWindowClosedWithoutFinalSession
                  ? "Your guided window has ended."
                  : "Your 28-day run is complete."
                : "Your 28-day path at a glance."}
            </h2>
            <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
              {hasProgramEnded
                ? hasWindowClosedWithoutFinalSession
                  ? "No new session is due today. Use this page to review what was completed, then start again from Day 1 whenever you want another run."
                  : hasCompletedFinalSession
                    ? "Everything from this run stays visible here. Review it calmly, then begin again whenever you are ready."
                    : "Everything from this run stays visible here for review whenever you want."
                : "Each day fills in as you move through the 28-day program."}
            </p>
          </div>

          {hasProgramEnded ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {hasCompleteWeekContent ? (
                <RestartProgramForm>Start the Program Again</RestartProgramForm>
              ) : null}
              <Link
                className="secondary-button w-full sm:w-auto"
                href="/library"
              >
                Open Library
              </Link>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-muted p-4">
            <p className="eyebrow">Completed Days</p>
            <p className="mt-2 text-3xl">{metrics.completedDaysCount}/28</p>
          </div>
          <div className="surface-muted p-4">
            <p className="eyebrow">Progress</p>
            <p className="mt-2 text-3xl">{metrics.progressPercentage}%</p>
          </div>
          <div className="surface-muted p-4">
            <p className="eyebrow">Current Streak</p>
            <p className="mt-2 text-3xl">{metrics.streak}</p>
          </div>
        </div>
      </section>

      {Array.from({ length: 4 }, (_, weekIndex) => {
        const weekNumber = weekIndex + 1;
        const firstDay = weekIndex * 7 + 1;
        const weekDays = Array.from({ length: 7 }, (_, dayIndex) => firstDay + dayIndex);

        return (
          <section
            className="surface space-y-4 p-6"
            key={weekNumber}
          >
            <div className="space-y-1">
              <p className="eyebrow">Week {weekNumber}</p>
              <h3 className="text-3xl">Days {firstDay}-{firstDay + 6}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {weekDays.map((dayNumber) => {
                const isComplete = completedDays.has(dayNumber);
                const isToday = !hasProgramEnded && dayNumber === metrics.currentDay;
                const isAvailable = dayNumber <= accessibleDay;
                const tileClassName = isComplete
                  ? "border-transparent bg-[var(--accent)] text-white"
                  : isToday
                    ? "border-[rgba(53,83,67,0.25)] bg-[var(--accent-soft)] text-[var(--foreground)]"
                    : isAvailable
                      ? "border-[var(--line)] bg-white/75 text-[var(--foreground)]"
                      : "border-[rgba(34,48,40,0.08)] bg-white/40 text-[rgba(34,48,40,0.55)]";

                return (
                  <div
                    className={`rounded-3xl border p-4 ${tileClassName}`}
                    key={dayNumber}
                  >
                    <p className="text-sm font-semibold">Day {dayNumber}</p>
                    <p className="mt-3 text-sm">
                      {isComplete ? "Complete" : isToday ? "Today" : isAvailable ? "Open" : "Upcoming"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
