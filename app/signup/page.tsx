import Link from "next/link";
import { redirect } from "next/navigation";

import { signUpAction } from "@/app/actions/auth";
import { NoticeBanner } from "@/components/notice-banner";
import { getHomeRouteForCurrentUser } from "@/lib/auth";
import type { RouteSearchParams } from "@/lib/route-utils";
import { readSearchParam } from "@/lib/route-utils";

type SignupPageProps = {
  searchParams?: RouteSearchParams;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const homeRoute = await getHomeRouteForCurrentUser();

  if (homeRoute !== "/login") {
    redirect(homeRoute);
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const message = readSearchParam(resolvedSearchParams.message);
  const error = readSearchParam(resolvedSearchParams.error);

  return (
    <div className="page-wrap flex min-h-screen items-center px-4 py-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface flex flex-col justify-between gap-10 p-6 md:p-8">
          <div className="space-y-4">
            <p className="eyebrow">Mind Power</p>
            <h1 className="max-w-xl text-5xl sm:text-6xl">Create your account.</h1>
            <p className="max-w-lg text-base leading-7 text-[var(--muted)]">
              Start your 4-week Mind Power challenge with one clear step per day.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="eyebrow">Challenge</p>
              <p className="mt-2 text-lg">4 weeks. 28 days. Daily structure.</p>
            </div>
            <div className="surface-muted p-4">
              <p className="eyebrow">Flow</p>
              <p className="mt-2 text-lg">Audio, exercises, and reflection.</p>
            </div>
          </div>

          <div className="surface-muted p-5">
            <p className="eyebrow">Already registered?</p>
            <p className="mt-2 text-base leading-7 text-[var(--muted)]">
              If you already have an account, sign in and continue your current run.
            </p>
            <div className="mt-4">
              <Link
                className="secondary-button w-full sm:w-auto"
                href="/login"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="surface space-y-5 p-6 md:p-8">
          <div className="space-y-2">
            <p className="eyebrow">Create Account</p>
            <h2 className="text-3xl">Set up your new account</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Use an email and password you&apos;ll use to return each day.
            </p>
          </div>

          {message ? <NoticeBanner message={message} /> : null}
          {error ? (
            <NoticeBanner
              message={error}
              tone="error"
            />
          ) : null}

          <form className="space-y-4">
            <input
              name="redirect_to"
              type="hidden"
              value="/signup"
            />
            <div className="space-y-2">
              <label
                className="field-label"
                htmlFor="email"
              >
                Email
              </label>
              <input
                autoComplete="email"
                className="field"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div className="space-y-2">
              <label
                className="field-label"
                htmlFor="password"
              >
                Password
              </label>
              <input
                autoComplete="new-password"
                className="field"
                id="password"
                name="password"
                placeholder="At least 6 characters"
                required
                type="password"
              />
            </div>

            <button
              className="primary-button w-full"
              formAction={signUpAction}
            >
              Create Account
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
