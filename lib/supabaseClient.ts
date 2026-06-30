import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // Guard against build-time evaluation with placeholder values
    if (!supabaseUrl.startsWith("http")) {
      // Return a dummy client that will be replaced at runtime
      return createClient("https://placeholder.supabase.co", "placeholder");
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

export const supabase = getSupabaseClient();
