// Used by the seo-daily-article scheduled task to rewrite a draft that has
// a pending_revision request (see requestRevision in src/app/actions/articles.ts).
// Applies the rewritten fields, clears pending_revision, and prints
// {id, token} so notify-draft.mjs can re-send the review email.
// Run with:
//   node --env-file=.env.local scripts/apply-revision.mjs <id> '<json>'
// where <json> is: { slug?, category?, title?, metaDescription?, intro?, sections?, relatedSlugs? }
// (only include fields that changed — the rest are left as-is).
import { createClient } from "@supabase/supabase-js";

const [, , id, raw] = process.argv;
if (!id || !raw) {
  console.error("Usage: apply-revision.mjs <id> '<json>'");
  process.exit(1);
}

const a = JSON.parse(raw);
const update = {};
if (a.slug) update.slug = a.slug;
if (a.category) update.category = a.category;
if (a.title) update.title = a.title;
if (a.metaDescription) update.meta_description = a.metaDescription;
if (a.intro) update.intro = a.intro;
if (a.sections) update.sections = a.sections;
if (a.relatedSlugs) update.related_slugs = a.relatedSlugs;
update.pending_revision = null;

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
  .update(update)
  .eq("id", id)
  .select("id, publish_token")
  .single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(JSON.stringify({ id: data.id, token: data.publish_token }));
