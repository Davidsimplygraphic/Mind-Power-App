import { redirect } from "next/navigation";

import { signInAction, signUpAction } from "@/app/actions/auth";
import { NoticeBanner } from "@/components/notice-banner";
import { getHomeRouteForCurrentUser } from "@/lib/auth";
import type { RouteSearchParams } from "@/lib/route-utils";
import { readSearchParam } from "@/lib/route-utils";

type LoginPageProps = {
  searchParams?: RouteSearchParams;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
            <h1 className="max-w-xl text-5xl sm:text-6xl">
              A private 28-day space for one clear instruction at a time.
            </h1>
            <p className="max-w-lg text-base leading-7 text-[var(--muted)]">
              Log in, anchor your reason for doing the program, and let the app tell
              you exactly what to do each day.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="surface-muted p-4">
              <p className="eyebrow">Structure</p>
              <p className="mt-2 text-lg">4 weeks. 28 days. One guided path.</p>
            </div>
            <div className="surface-muted p-4">
              <p className="eyebrow">Focus</p>
              <p className="mt-2 text-lg">Today&apos;s audio, exercises, and reflection.</p>
            </div>
            <div className="surface-muted p-4">
              <p className="eyebrow">Private</p>
              <p className="mt-2 text-lg">Email sign-in and signed audio links only.</p>
            </div>
          </div>
        </section>

        <section className="surface space-y-5 p-6 md:p-8">
          <div className="space-y-2">
            <p className="eyebrow">Welcome back</p>
            <h2 className="text-3xl">Sign in or create your account</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Use the same form for both. If email confirmation is enabled in Supabase,
              new accounts may need to verify first.
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
                autoComplete="current-password"
                className="field"
                id="password"
                name="password"
                placeholder="At least 6 characters"
                required
                type="password"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="primary-button w-full"
                formAction={signInAction}
              >
                Sign In
              </button>
              <button
                className="secondary-button w-full"
                formAction={signUpAction}
              >
                Create Account
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
