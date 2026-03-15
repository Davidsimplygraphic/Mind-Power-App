import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { appEnv } from "@/lib/env";

let publicClient: SupabaseClient | undefined;

export function getSupabasePublicClient() {
  if (!publicClient) {
    publicClient = createClient(appEnv.supabaseUrl, appEnv.supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return publicClient;
}
