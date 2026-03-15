import { AppShell } from "@/components/app-shell";
import { requireAuthenticatedUser, requireCompletedOnboarding } from "@/lib/auth";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthenticatedUser();
  await requireCompletedOnboarding(user.id);

  return <AppShell userEmail={user.email ?? "Signed in"}>{children}</AppShell>;
}
