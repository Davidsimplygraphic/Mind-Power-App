"use client";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  void error;

  return (
    <div className="page-wrap flex min-h-screen items-center px-4 py-8">
      <section className="surface mx-auto w-full max-w-3xl space-y-5 p-6 md:p-8">
        <p className="eyebrow">Something Went Wrong</p>
        <h1 className="text-4xl">The page could not finish loading.</h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
          Try again first. If the problem keeps happening, double-check your Supabase
          setup and environment variables.
        </p>
        <button
          className="primary-button w-full sm:w-auto"
          onClick={reset}
          type="button"
        >
          Try Again
        </button>
      </section>
    </div>
  );
}
