"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
  userEmail: string;
};

const navigationItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg fill="currentColor" height={22} viewBox="0 0 24 24" width={22}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    href: "/progress",
    label: "Progress",
    icon: (
      <svg fill="none" height={22} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" width={22}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: "/session",
    label: "Today",
    icon: (
      <svg fill="none" height={22} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" width={22}>
        <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    href: "/library",
    label: "Library",
    icon: (
      <svg fill="none" height={22} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" width={22}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: "/session",
    label: "Timer",
    icon: (
      <svg fill="none" height={22} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" width={22}>
        <circle cx="12" cy="13" r="8" />
        <polyline points="12 9 12 13 14.5 15.5" />
        <path d="M5 3L2 6M22 6l-3-3" />
      </svg>
    ),
  },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div
      className="page-wrap flex min-h-screen flex-col"
      style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
    >
      <main className="flex-1 px-4 pt-5">{children}</main>

      <nav
        className="surface fixed bottom-0 left-1/2 z-50 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-5 border-t border-[var(--line)] px-1 py-1"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              className={isActive ? "nav-link nav-link-active" : "nav-link"}
              href={item.href}
              key={`${item.href}-${item.label}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
