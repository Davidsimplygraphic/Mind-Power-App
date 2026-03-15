"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

function getCredential(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

function getLoginRedirectMessagePath(type: "error" | "message", message: string) {
  return `/login?${type}=${encodeURIComponent(message)}`;
}

export async function signInAction(formData: FormData) {
  const email = getCredential(formData, "email");
  const password = getCredential(formData, "password");

  if (!email || !password) {
    redirect(getLoginRedirectMessagePath("error", "Enter both email and password."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(getLoginRedirectMessagePath("error", error.message));
  }

  redirect("/");
}

export async function signUpAction(formData: FormData) {
  const email = getCredential(formData, "email");
  const password = getCredential(formData, "password");

  if (!email || !password) {
    redirect(getLoginRedirectMessagePath("error", "Enter both email and password."));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(getLoginRedirectMessagePath("error", error.message));
  }

  if (!data.session) {
    redirect(
      getLoginRedirectMessagePath(
        "message",
        "Account created. Check your email if confirmation is enabled in Supabase.",
      ),
    );
  }

  redirect("/");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  redirect("/login");
}
