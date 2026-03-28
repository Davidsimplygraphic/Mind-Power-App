import { signOutAction } from "@/app/actions/auth";
import { ResetChallengeForm } from "@/components/reset-challenge-form";
import { requireAuthenticatedUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireAuthenticatedUser();

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center pt-2">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Account */}
      <div className="surface space-y-4 p-5">
        <div>
          <p className="eyebrow">Account</p>
          <p className="mt-2 text-base font-semibold">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <button className="secondary-button w-full" type="submit">
            Sign Out
          </button>
        </form>
      </div>

      {/* Reset */}
      <div className="surface space-y-4 p-5">
        <div>
          <p className="eyebrow">Reset</p>
          <p className="mt-2 text-base font-bold">Start from scratch</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            This clears all your sessions, exercise responses, and progress logs,
            and resets Day 1 to today. Your account and login are kept.
          </p>
        </div>
        <ResetChallengeForm
          className="w-full rounded-full border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100"
          formClassName="w-full"
        />
      </div>
    </div>
  );
}
