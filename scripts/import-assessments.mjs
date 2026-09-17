// Imports the FlyUp assessment content (content/flyup/*.json) into Supabase:
// one row in `tests` (metadata) + one row in `test_content` (the full
// definition) per file. Safe to re-run — it upserts by slug.
//
// If STRIPE_SECRET_KEY is also set, each test's stripe_price_id is looked
// up by lookup_key and attached automatically — run scripts/setup-stripe.mjs
// first (in either order, this script just re-checks on every run).
//
// Usage (after filling in .env.local with your real Supabase project):
//   node --env-file=.env.local scripts/import-assessments.mjs

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { DEFAULT_PRICE_CENTS, ENTRIES } from "./assessment-entries.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "..", "content", "flyup");

async function findStripePriceId(lookupKey) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes("placeholder")) return null;

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(secretKey);
  const prices = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  return prices.data[0]?.id ?? null;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || url.includes("placeholder") || serviceKey.includes("placeholder")) {
    console.error(
      "Missing or placeholder Supabase credentials. Fill in .env.local with your " +
        "real project's NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  for (const entry of ENTRIES) {
    const raw = await readFile(path.join(contentDir, entry.file), "utf-8");
    const definition = JSON.parse(raw);
    // Use our own public-facing title (no "FlyUp" branding), not the one
    // baked into the content JSON — that one is internal/dev-facing only.
    const title = entry.title;
    // Surface the "this is a training tool, not a clinical instrument"
    // disclaimer in the PUBLIC description too, not just inside the paid
    // content — a user should see it before paying, not only after.
    const disclaimer = definition.meta?.disclaimer ?? definition.instructions ?? "";
    const description = disclaimer
      ? `${entry.description}\n\n${disclaimer}`
      : entry.description;

    const stripePriceId = await findStripePriceId(entry.lookupKey);

    console.log(
      `Importing ${entry.slug} (${title})${stripePriceId ? ` [Stripe price ${stripePriceId}]` : " [no Stripe price found yet]"}...`
    );

    const { data: test, error: testError } = await supabase
      .from("tests")
      .upsert(
        {
          slug: entry.slug,
          title,
          description,
          price_cents: DEFAULT_PRICE_CENTS,
          currency: "eur",
          stripe_price_id: stripePriceId,
          included_in_subscription: true,
          is_active: true,
          format: entry.format,
          language: entry.language,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (testError) {
      console.error(`  Failed to upsert test row: ${testError.message}`);
      continue;
    }

    const { error: contentError } = await supabase
      .from("test_content")
      .upsert(
        { test_id: test.id, definition },
        { onConflict: "test_id" }
      );

    if (contentError) {
      console.error(`  Failed to upsert test_content: ${contentError.message}`);
      continue;
    }

    console.log(`  OK (test_id ${test.id})`);
  }

  console.log(
    "\nDone. Prices default to 4,99 € for every test (edit `price_cents` in the " +
      "`tests` table to change). If Stripe prices weren't found, run " +
      "`npm run setup:stripe` then re-run this script."
  );
}

main();
