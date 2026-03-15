import { redirect } from "next/navigation";

import { getHomeRouteForCurrentUser } from "@/lib/auth";

export default async function Home() {
  redirect(await getHomeRouteForCurrentUser());
}
