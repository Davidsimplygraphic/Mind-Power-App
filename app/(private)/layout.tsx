import { requireAuthenticatedUser } from "@/lib/auth";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedUser();

  return children;
}
