// Used by the seo-daily-article scheduled task to fetch an article's full
// content (list-articles.mjs only returns summary fields) — needed before
// rewriting one flagged with pending_revision.
// Run with: node --env-file=.env.local scripts/get-article.mjs <id>
import { createClient } from "@supabase/supabase-js";

const id = process.argv[2];
if (!id) {
  console.error("Usage: get-article.mjs <id>");
  process.exit(1);
}

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

const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
