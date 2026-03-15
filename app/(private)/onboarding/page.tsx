import { redirect } from "next/navigation";

import { saveOnboardingAction } from "@/app/actions/program";
import { NoticeBanner } from "@/components/notice-banner";
import { SubmitButton } from "@/components/submit-button";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/data";
import type { RouteSearchParams } from "@/lib/route-utils";
import { readSearchParam } from "@/lib/route-utils";

type OnboardingPageProps = {
  searchParams?: RouteSearchParams;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await requireAuthenticatedUser();
  const profile = await getProfileByUserId(user.id);

  if (profile?.motivation_text?.trim()) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const error = readSearchParam(resolvedSearchParams.error);

  return (
    <div className="page-wrap flex min-h-screen items-center px-4 py-8">
      <section className="surface mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 md:p-8">
        <div className="space-y-3">
          <p className="eyebrow">Onboarding</p>
          <h1 className="text-4xl sm:text-5xl">Why are you doing this program?</h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
            Keep it honest and practical. This becomes your anchor on the days you
            need to remember why you started.
          </p>
        </div>

        {error ? (
          <NoticeBanner
            message={error}
            tone="error"
          />
        ) : null}

        <form
          action={saveOnboardingAction}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              className="field-label"
              htmlFor="motivation_text"
            >
              Your reason
            </label>
            <textarea
              className="field min-h-44 resize-none"
              defaultValue={profile?.motivation_text ?? ""}
              id="motivation_text"
              name="motivation_text"
              placeholder="I'm doing this because..."
              required
            />
          </div>

          <SubmitButton
            className="primary-button w-full sm:w-auto"
            pendingLabel="Saving your reason..."
          >
            Continue to Dashboard
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
