import Link from "next/link";

import { startProgramAction } from "@/app/actions/program";
import { ClearRunLocalState } from "@/components/clear-run-local-state";
import { NoticeBanner } from "@/components/notice-banner";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getUserProgramSnapshot } from "@/lib/data";
import type { RouteSearchParams } from "@/lib/route-utils";
import { readSearchParam } from "@/lib/route-utils";

type DashboardPageProps = {
  searchParams?: RouteSearchParams;
};

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
      <div className="space-y-4">
        <NoticeBanner
          message="Mind Power content is missing from the database. Verify that the program and week content were seeded successfully."
          tone="error"
        />
      </div>
    );
  }

  if (!snapshot.userProgram || !snapshot.metrics) {
    return (
      <div className="space-y-4 pb-4">
        <ClearRunLocalState resetSignal={localResetSignal} />
        {message ? <NoticeBanner message={message} /> : null}
        {error ? <NoticeBanner message={error} tone="error" /> : null}
        {!hasCompleteWeekContent ? (
          <NoticeBanner
            message="Program content is incomplete. Seed all 4 program weeks before starting."
            tone="error"
          />
        ) : null}

        <div className="surface p-6 space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]">
            <span className="text-2xl font-black text-white">M</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Mind Power</h2>
            <p className="text-[var(--muted)] leading-6">
              Your 28-day program is ready. Begin Day 1 to start your journey.
            </p>
          </div>
          {snapshot.profile?.motivation_text ? (
            <div className="surface-muted p-4">
              <p className="eyebrow mb-2">Your reason</p>
              <p className="text-base leading-7">{snapshot.profile.motivation_text}</p>
            </div>
          ) : null}
          <div className="flex flex-col gap-3">
            {hasCompleteWeekContent ? (
              <form action={startProgramAction}>
                <button className="primary-button w-full" type="submit">
                  Begin Day 1
                </button>
              </form>
            ) : null}
            <Link className="secondary-button w-full" href="/library">
              Preview the Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, program } = snapshot;

  const phaseNames = ["ONE", "TWO", "THREE", "FOUR"];
  const phaseName = phaseNames[(metrics.currentWeek - 1)] ?? "ONE";

  const quotes = [
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The mind is everything. What you think, you become.", author: "Buddha" },
    { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
    { text: "Whatever the mind can conceive and believe, it can achieve.", author: "Napoleon Hill" },
    { text: "You are the master of your destiny.", author: "Napoleon Hill" },
    { text: "As a man thinketh in his heart, so is he.", author: "James Allen" },
    { text: "Repetition is the mother of skill.", author: "Tony Robbins" },
  ];
  const quote = quotes[metrics.currentDay % quotes.length];

  return (
    <div className="space-y-4 pb-4">
      <ClearRunLocalState resetSignal={localResetSignal} />
      {message ? <NoticeBanner message={message} /> : null}
      {error ? <NoticeBanner message={error} tone="error" /> : null}

      {/* Progress card */}
      <Link href="/progress">
        <div className="surface p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="eyebrow">Progress</p>
              <p className="mt-1 text-base font-bold">PHASE {phaseName}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]">
              <svg fill="none" height={16} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24" width={16}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--card-muted)]">
            <div
              className="h-2 rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${metrics.progressPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Day {metrics.currentDay} of {program.duration_days}
          </p>
        </div>
      </Link>

      {/* Library + Today cards */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/library">
          <div className="surface flex h-full min-h-[140px] flex-col justify-between p-4" style={{ background: "var(--accent)" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <span className="text-xl font-black text-white">M</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Library</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <svg fill="none" height={14} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24" width={14}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/session">
          <div className="surface flex h-full min-h-[140px] flex-col justify-between p-4">
            <div>
              <p className="text-lg font-bold">Today</p>
            </div>
            <div>
              <p className="eyebrow">Phase {metrics.currentWeek}</p>
              <p className="text-sm font-semibold text-[var(--muted)]">
                Day {metrics.currentDay} of {program.duration_days}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">
                  {metrics.isSessionComplete ? "Complete" : "In progress"}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]">
                  <svg fill="none" height={14} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24" width={14}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quote */}
      <div className="surface px-6 py-8 text-center">
        <p className="text-lg font-semibold leading-8">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
          — {quote.author}
        </p>
      </div>

      {/* Orange bottom section */}
      <div className="rounded-3xl p-5 space-y-3" style={{ background: "var(--accent)" }}>
        <Link
          className="flex items-center justify-between rounded-full bg-white/20 px-5 py-3"
          href="/settings"
        >
          <span className="font-semibold text-white">Settings</span>
          <svg fill="none" height={16} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24" width={16}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <Link
          className="flex items-center justify-between rounded-full bg-white/20 px-5 py-3"
          href="mailto:support@mindpower.app"
        >
          <span className="font-semibold text-white">Support</span>
          <svg fill="none" height={16} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24" width={16}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
