// Used by the seo-daily-article scheduled task to see what's already been
// written (draft + published) before picking a new topic, so it never
// repeats itself. Run with: node --env-file=.env.local scripts/list-articles.mjs
import { createClient } from "@supabase/supabase-js";

// Fail fast instead of hanging forever on a stalled connection — this runs
// unattended, nobody is around to notice or interrupt it at 7am.
function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false }, global: { fetch: fetchWithTimeout } }
);

const { data, error } = await supabase
  .from("articles")
  .select("id, slug, title, category, status, created_at, pending_revision")
  .order("created_at", { ascending: false });

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
