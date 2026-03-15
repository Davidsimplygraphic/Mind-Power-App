function normalizeSupabaseUrl(value: string | undefined) {
  if (!value) {
    throw new Error(
      "Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL in the project root .env.local file.",
    );
  }

  if (value.startsWith("https://") || value.startsWith("http://")) {
    return value.replace(/\/$/, "");
  }

  return `https://${value}.supabase.co`;
}

function getSupabasePublishableKey() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error(
      "Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  return key;
}

export const appEnv = {
  supabaseUrl: normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: getSupabasePublishableKey(),
  programTitle: "Mind Power",
  audioBucket: "mind-power-audio",
  appTimezone: process.env.APP_TIMEZONE ?? "UTC",
};
