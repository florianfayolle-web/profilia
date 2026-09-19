// Used by the seo-daily-article scheduled task to insert a freshly written
// article as a draft. Takes the article as a single JSON string argument:
// { slug, category, title, metaDescription, intro, sections, relatedSlugs }
// Run with:
//   node --env-file=.env.local scripts/add-draft-article.mjs '<json>'
// Prints { id, token } on success — the token goes into the preview link
// sent by notify-draft.mjs.
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const raw = process.argv[2];
if (!raw) {
  console.error("Usage: add-draft-article.mjs '<article json>'");
  process.exit(1);
}

const a = JSON.parse(raw);
for (const field of ["slug", "category", "title", "metaDescription", "intro", "sections"]) {
  if (!a[field]) {
    console.error(`Missing field: ${field}`);
    process.exit(1);
  }
}

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

const token = crypto.randomUUID();

const { data, error } = await supabase
  .from("articles")
  .insert({
    slug: a.slug,
    category: a.category,
    title: a.title,
    meta_description: a.metaDescription,
    intro: a.intro,
    sections: a.sections,
    related_slugs: a.relatedSlugs ?? [],
    status: "draft",
    publish_token: token,
  })
  .select("id")
  .single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(JSON.stringify({ id: data.id, token }));
