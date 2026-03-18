"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

function getCredential(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

function getAuthRedirectPath(formData: FormData, fallbackPath: "/login" | "/signup") {
  const requestedPath = formData.get("redirect_to")?.toString().trim();

  if (requestedPath === "/login" || requestedPath === "/signup") {
    return requestedPath;
  }

  return fallbackPath;
}

function getAuthRedirectMessagePath(
  pathname: "/login" | "/signup",
  type: "error" | "message",
  message: string,
) {
  return `${pathname}?${type}=${encodeURIComponent(message)}`;
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headerStore.get("host")?.split(",")[0]?.trim();

  if (!host) {
    return undefined;
  }

  const forwardedProto = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

export async function signInAction(formData: FormData) {
  const authPath = getAuthRedirectPath(formData, "/login");
  const email = getCredential(formData, "email");
  const password = getCredential(formData, "password");

  if (!email || !password) {
    redirect(getAuthRedirectMessagePath(authPath, "error", "Enter both email and password."));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(getAuthRedirectMessagePath(authPath, "error", error.message));
  }

  redirect("/");
}

export async function signUpAction(formData: FormData) {
  const authPath = getAuthRedirectPath(formData, "/signup");
  const email = getCredential(formData, "email");
  const password = getCredential(formData, "password");

  if (!email || !password) {
    redirect(getAuthRedirectMessagePath(authPath, "error", "Enter both email and password."));
  }

  const supabase = await createSupabaseServerClient();
  const origin = await getRequestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin,
    },
  });

  if (error) {
    redirect(getAuthRedirectMessagePath(authPath, "error", error.message));
  }

  if (!data.session) {
    redirect(
      getAuthRedirectMessagePath(
        authPath,
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
