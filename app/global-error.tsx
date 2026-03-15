"use client";

import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  void error;

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <div className="page-wrap flex min-h-screen items-center px-4 py-8">
          <section className="surface mx-auto w-full max-w-3xl space-y-5 p-6 md:p-8">
            <p className="eyebrow">App Error</p>
            <h1 className="text-4xl">Mind Power hit a blocking error.</h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
              Reset the view first. If this keeps happening, recheck the environment
              variables and Supabase project setup.
            </p>
            <button
              className="primary-button w-full sm:w-auto"
              onClick={reset}
              type="button"
            >
              Reload
            </button>
          </section>
        </div>
      </body>
    </html>
  );
}
