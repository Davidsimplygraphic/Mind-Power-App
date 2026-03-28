import Link from "next/link";

import { NoticeBanner } from "@/components/notice-banner";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getUserProgramSnapshot } from "@/lib/data";
import { getProgramEndState } from "@/lib/program";

type ProgressPageProps = { searchParams?: Promise<{ phase?: string }> };

export default async function ProgressPage({ searchParams }: ProgressPageProps) {
  const user = await requireAuthenticatedUser();
  const snapshot = await getUserProgramSnapshot(user.id);
  const selectedPhase = Math.min(4, Math.max(1, parseInt((await searchParams)?.phase ?? "1", 10)));

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
          <h1 className="text-2xl font-bold">Progress</h1>
        </div>
        <div className="surface p-6 space-y-4">
          <p className="text-base leading-7 text-[var(--muted)]">
            Start the program to see your 28-day map.
          </p>
          <Link className="primary-button w-full" href="/dashboard">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const completedDays = new Set(snapshot.sessions.map((session) => session.day_number));
  const { metrics, program, userProgram } = snapshot;
  const { hasProgramEnded } = getProgramEndState(metrics, program.duration_days);
  const accessibleDay = Math.min(metrics.currentDay, program.duration_days);

  const phaseNames = ["ONE", "TWO", "THREE", "FOUR"];
  const weekStartDay = (selectedPhase - 1) * 7 + 1;
  const phaseDays = Array.from({ length: 7 }, (_, i) => weekStartDay + i);
  const startDate = new Date(userProgram.started_at);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const getDayOfWeek = (dayNumber: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return dayNames[date.getDay()];
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Page header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Progress</h1>
      </div>

      {/* Phase tabs */}
      <div className="surface flex gap-2 p-2">
        {phaseNames.map((name, idx) => {
          const phaseNum = idx + 1;
          const isActive = phaseNum === selectedPhase;
          return (
            <Link
              className={`flex-1 rounded-2xl py-3 text-center text-xs font-bold uppercase tracking-wide transition-colors ${
                isActive
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              href={`/progress?phase=${phaseNum}`}
              key={phaseNum}
            >
              <span className="block text-[0.6rem] opacity-70">Phase</span>
              {name}
            </Link>
          );
        })}
      </div>

      {/* Day rows */}
      <div className="surface overflow-hidden">
        {phaseDays.map((dayNumber, idx) => {
          const isComplete = completedDays.has(dayNumber);
          const isToday = !hasProgramEnded && dayNumber === metrics.currentDay;
          const isAvailable = dayNumber <= accessibleDay;
          const dayOfWeek = getDayOfWeek(dayNumber);

          return (
            <div
              className={`flex items-center justify-between px-5 py-4 ${idx > 0 ? "border-t border-[var(--line)]" : ""}`}
              key={dayNumber}
              style={isToday ? { borderLeft: "3px solid var(--accent)" } : {}}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                {dayOfWeek}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">Day {dayNumber}</span>
                {isComplete ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)]">
                    <svg fill="none" height={14} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24" width={14}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : isToday ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--accent)]" />
                ) : isAvailable ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--line)]" />
                ) : (
                  <div className="h-7 w-7 rounded-full border-2 border-[rgba(0,0,0,0.08)]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats card */}
      <div className="surface p-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{metrics.completedDaysCount}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Days Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{metrics.progressPercentage}%</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{metrics.streak}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}
