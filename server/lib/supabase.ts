import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl) {
  console.error("❌ VITE_SUPABASE_URL not configured");
  throw new Error("VITE_SUPABASE_URL is required");
}

if (!supabaseServiceKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY not configured");
  console.error(
    "   Server-side operations require service role key to bypass RLS policies",
  );
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is required for server operations",
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
