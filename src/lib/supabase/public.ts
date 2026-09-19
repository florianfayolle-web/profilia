import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cookie-free client for public, non-personalized reads (the test catalog,
// which is readable by anyone per RLS). Using this instead of the
// cookie-bound server client lets Next.js cache these pages (ISR) instead
// of marking every request dynamic just because a cookie store was touched —
// the catalog barely changes, so serving it from cache avoids hitting
// Supabase on every visit once traffic grows.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
