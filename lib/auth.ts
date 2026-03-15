import { cache } from "react";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getProfileByUserId } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
});

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireCompletedOnboarding(userId: string) {
  const profile = await getProfileByUserId(userId);

  if (!profile?.motivation_text?.trim()) {
    redirect("/onboarding");
  }

  return profile;
}

export async function getHomeRouteForCurrentUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return "/login";
  }

  const profile = await getProfileByUserId(user.id);

  return profile?.motivation_text?.trim() ? "/dashboard" : "/onboarding";
}
