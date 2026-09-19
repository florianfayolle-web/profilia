// Creates the Stripe catalog for this site: one Product + one-time Price
// per FlyUp test, plus one Product + recurring Price for the unlimited
// subscription. Idempotent — safe to re-run: each Price carries a stable
// `lookup_key` and is reused (not duplicated) if it already exists.
//
// Usage (after putting your Stripe secret key in .env.local):
//   node --env-file=.env.local scripts/setup-stripe.mjs
//
// Uses whichever key you set — a sk_test_... key creates test-mode
// objects only, a sk_live_... key creates real, billable objects.

import Stripe from "stripe";
import {
  DEFAULT_PRICE_CENTS,
  ENTRIES,
  SUBSCRIPTION_LOOKUP_KEY,
  SUBSCRIPTION_PRICE_CENTS,
  UNLOCK_RESULT_LOOKUP_KEY,
  UNLOCK_RESULT_PRICE_CENTS,
} from "./assessment-entries.mjs";

async function getOrCreatePrice(stripe, { lookupKey, productName, unitAmount, recurring }) {
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  if (existing.data[0]) {
    return { price: existing.data[0], created: false };
  }

  const product = await stripe.products.create({ name: productName });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "eur",
    unit_amount: unitAmount,
    lookup_key: lookupKey,
    ...(recurring ? { recurring: { interval: "month" } } : {}),
  });
  return { price, created: true };
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes("placeholder")) {
    console.error(
      "Missing or placeholder STRIPE_SECRET_KEY. Fill in .env.local with your real " +
        "Stripe secret key first (sk_test_... while developing)."
    );
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  const mode = secretKey.startsWith("sk_live_") ? "LIVE" : "TEST";
  console.log(`Using a ${mode} mode Stripe key.\n`);

  console.log("Subscription plan...");
  const sub = await getOrCreatePrice(stripe, {
    lookupKey: SUBSCRIPTION_LOOKUP_KEY,
    productName: "Abonnement illimité Profilia",
    unitAmount: SUBSCRIPTION_PRICE_CENTS,
    recurring: true,
  });
  console.log(
    `  ${sub.created ? "Created" : "Already existed"}: ${sub.price.id} (${SUBSCRIPTION_PRICE_CENTS / 100} €/mois)`
  );

  console.log("Unlock (guest free-test result)...");
  const unlock = await getOrCreatePrice(stripe, {
    lookupKey: UNLOCK_RESULT_LOOKUP_KEY,
    productName: "Débloquer mon rapport complet",
    unitAmount: UNLOCK_RESULT_PRICE_CENTS,
    recurring: false,
  });
  console.log(
    `  ${unlock.created ? "Created" : "Already existed"}: ${unlock.price.id} (${UNLOCK_RESULT_PRICE_CENTS / 100} €)`
  );

  for (const entry of ENTRIES) {
    console.log(`${entry.slug}...`);
    if (entry.priceCents === 0) {
      console.log("  Free test — no Stripe price needed, skipped.");
      continue;
    }
    const unitAmount = entry.priceCents ?? DEFAULT_PRICE_CENTS;
    const result = await getOrCreatePrice(stripe, {
      lookupKey: entry.lookupKey,
      productName: entry.slug,
      unitAmount,
      recurring: false,
    });
    console.log(
      `  ${result.created ? "Created" : "Already existed"}: ${result.price.id} (${unitAmount / 100} €)`
    );
  }

  console.log(
    `\nDone. Set STRIPE_SUBSCRIPTION_PRICE_ID=${sub.price.id} in .env.local, then run ` +
      "`npm run import:assessments` (or re-run it if you already did) to attach each " +
      "test's price automatically."
  );
}

main();
