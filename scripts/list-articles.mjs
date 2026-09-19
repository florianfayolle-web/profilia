// Used by the seo-daily-article scheduled task to see what's already been
// written (draft + published) before picking a new topic, so it never
// repeats itself. Run with: node --env-file=.env.local scripts/list-articles.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data, error } = await supabase
  .from("articles")
  .select("slug, title, category, status, created_at")
  .order("created_at", { ascending: false });

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
