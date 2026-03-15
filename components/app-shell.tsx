"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/actions/auth";

type AppShellProps = {
  children: React.ReactNode;
  userEmail: string;
};

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/session", label: "Session" },
  { href: "/progress", label: "Progress" },
  { href: "/library", label: "Library" },
];

export function AppShell({ children, userEmail }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div
      className="page-wrap flex min-h-screen flex-col gap-6 px-4 py-5"
      style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
    >
      <header className="surface flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="eyebrow">Mind Power</p>
          <h1 className="text-2xl">Daily practice, without friction.</h1>
          <p className="text-sm text-[var(--muted)]">{userEmail}</p>
        </div>

        <form action={signOutAction}>
          <button
            className="quiet-button w-full sm:w-auto"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="flex-1">{children}</main>

      <nav
        className="surface fixed inset-x-4 z-50 mx-auto grid max-w-3xl grid-cols-4 gap-2 px-2 py-2"
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              className={isActive ? "nav-link nav-link-active" : "nav-link"}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
