"use server";

import {
  GUEST_UNLOCK_PRICE_CENTS,
  PACK_BASE_PRICE_CENTS,
  PACK_PRICE_CENTS,
  SUBSCRIPTION_PRICE_CENTS,
} from "@/lib/pricing";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";


// The Stripe account is shared by several sites and named "4F": show this
// site's name on the hosted payment page instead.
const CHECKOUT_BRANDING = {
  display_name: "Profilia",
} as const;
const CHECKOUT_SUBMIT_TEXT = {
  submit: {
    message:
      "Paiement sécurisé pour Profilia. Ton rapport s'affiche tout de suite après le paiement.",
  },
} as const;

async function getOrCreateStripeCustomer(
  userId: string,
  email: string | undefined
) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  // stripe_customer_id is deliberately not in the authenticated role's
  // column grants (see supabase/schema.sql) — it's later trusted to open a
  // Stripe billing portal for this user, so only the service-role client
  // may write it, never the caller's own session client.
  await createAdminClient()
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

// One-off purchase of a single test. `returnPath` lets a caller (e.g. a
// locked result page) send the buyer back to exactly where they were
// instead of the generic test page, once payment succeeds.
export async function createTestCheckoutSession(
  testSlug: string,
  returnPath?: string
) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect(`/login?next=/tests/${testSlug}`);
  }

  const { data: test } = await supabase
    .from("tests")
    .select("id, slug, title, price_cents, currency")
    .eq("slug", testSlug)
    .single();

  if (!test) {
    throw new Error("Test introuvable.");
  }

  if (!test.price_cents || test.price_cents <= 0) {
    throw new Error(`Le test "${test.title}" n'est pas payant.`);
  }

  const customerId = await getOrCreateStripeCustomer(user.id, user.email);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    branding_settings: CHECKOUT_BRANDING,
    custom_text: CHECKOUT_SUBMIT_TEXT,
    customer: customerId,
    // The amount comes straight from tests.price_cents (the same number every
    // page displays), not from a pre-created Stripe Price, so a price change is
    // one DB update and the page and the charge can never drift apart.
    line_items: [
      {
        price_data: {
          currency: test.currency,
          unit_amount: test.price_cents,
          product_data: { name: test.title },
        },
        quantity: 1,
      },
    ],
    metadata: { supabase_user_id: user.id, test_id: test.id },
    success_url: `${siteUrl}${returnPath ?? `/tests/${test.slug}`}?checkout=success`,
    cancel_url: `${siteUrl}${returnPath ?? `/tests/${test.slug}`}?checkout=cancelled`,
  });

  if (!session.url) {
    throw new Error("Impossible de créer la session de paiement Stripe.");
  }

  redirect(session.url);
}

// One-off purchase of the full report for a GUEST attempt on a paid test: no
// account, the attempt's own id is the only key (the webhook flips
// `attempts.unlocked` from metadata.attempt_id, see api/webhooks/stripe).
// The amount comes from tests.price_cents like every other checkout; Stripe
// collects the buyer's email itself.
export async function createGuestPaidUnlockSession(
  testSlug: string,
  attemptId: string
) {
  const admin = createAdminClient();
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, unlocked, test_id")
    .eq("id", attemptId)
    .is("user_id", null)
    .maybeSingle();

  if (!attempt || attempt.unlocked) {
    redirect(`/tests/${testSlug}/result/${attemptId}`);
  }

  const { data: test } = await admin
    .from("tests")
    .select("id, slug, title, price_cents, currency")
    .eq("id", attempt.test_id)
    .single();

  if (!test || test.slug !== testSlug || !test.price_cents || test.price_cents <= 0) {
    throw new Error("Test introuvable ou non payant.");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const returnPath = `/tests/${test.slug}/result/${attempt.id}`;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    branding_settings: CHECKOUT_BRANDING,
    custom_text: CHECKOUT_SUBMIT_TEXT,
    line_items: [
      {
        price_data: {
          currency: test.currency,
          unit_amount: test.price_cents,
          product_data: { name: test.title },
        },
        quantity: 1,
      },
    ],
    // Only attempt_id: no supabase_user_id / test_id, which would route the
    // webhook to the account-purchase branch instead of the attempt unlock.
    metadata: { attempt_id: attempt.id },
    success_url: `${siteUrl}${returnPath}?unlock=success`,
    cancel_url: `${siteUrl}${returnPath}?unlock=cancelled`,
  });

  if (!session.url) {
    throw new Error("Impossible de créer la session de paiement Stripe.");
  }

  redirect(session.url);
}

// Recurring subscription giving unlimited access to included tests.
export async function createSubscriptionCheckoutSession() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/pricing");
  }

  const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_SUBSCRIPTION_PRICE_ID n'est pas configuré.");
  }
  // The existing price only tells us which Stripe product the subscription
  // belongs to; the amount charged is SUBSCRIPTION_PRICE_CENTS (a Stripe
  // Price can't be edited, and this keeps the page and the charge in sync).
  const existing = await stripe.prices.retrieve(priceId);
  const productId = typeof existing.product === "string" ? existing.product : existing.product.id;

  const customerId = await getOrCreateStripeCustomer(user.id, user.email);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    branding_settings: CHECKOUT_BRANDING,
    custom_text: CHECKOUT_SUBMIT_TEXT,
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: existing.currency,
          unit_amount: SUBSCRIPTION_PRICE_CENTS,
          recurring: { interval: "month" },
          product: productId,
        },
        quantity: 1,
      },
    ],
    metadata: { supabase_user_id: user.id },
    success_url: `${siteUrl}/account?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
  });

  if (!session.url) {
    throw new Error("Impossible de créer la session de paiement Stripe.");
  }

  redirect(session.url);
}

// Lets a logged-in user manage or cancel their subscription / see invoices.
export async function createBillingPortalSession() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    redirect("/account");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${siteUrl}/account`,
  });

  redirect(session.url);
}

// Unblurs a guest attempt's result on the free test for a small one-time
// fee — no account needed, the attempt's own id is what the webhook uses to
// flip `unlocked` to true afterward. Reads the attempt with the admin
// client since a guest has no session and relies on the "user_id is null"
// RLS policy that only applies to normal (cookie-bearing) reads anyway.
export async function createUnlockCheckoutSession(
  testSlug: string,
  attemptId: string
) {
  const admin = createAdminClient();
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, guest_email, unlocked, test_id")
    .eq("id", attemptId)
    .is("user_id", null)
    .maybeSingle();

  if (!attempt) {
    redirect(`/tests/${testSlug}/result/${attemptId}`);
  }
  if (attempt.unlocked) {
    redirect(`/tests/${testSlug}/result/${attemptId}`);
  }

  const { data: unlockTest } = await admin
    .from("tests")
    .select("title, currency")
    .eq("id", attempt.test_id)
    .single();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    branding_settings: CHECKOUT_BRANDING,
    custom_text: CHECKOUT_SUBMIT_TEXT,
    customer_email: attempt.guest_email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: unlockTest?.currency ?? "eur",
          unit_amount: GUEST_UNLOCK_PRICE_CENTS,
          product_data: { name: unlockTest?.title ?? "Rapport complet" },
        },
        quantity: 1,
      },
    ],
    metadata: { attempt_id: attempt.id },
    success_url: `${siteUrl}/tests/${testSlug}/result/${attemptId}?unlock=success`,
    cancel_url: `${siteUrl}/tests/${testSlug}/result/${attemptId}?unlock=cancelled`,
  });

  if (!session.url) {
    throw new Error("Impossible de créer la session de paiement Stripe.");
  }

  redirect(session.url);
}


// Pack of two reports in one payment (2,99 EUR instead of 3,98): the test
// the buyer is looking at + a second one chosen on the locked result page.
// Logged-in buyers only (the access lives in `purchases`, one row per test:
// the webhook writes both). Both tests must be paid at the standard price.
export async function createPackCheckoutSession(
  testSlug: string,
  returnPath: string,
  formData: FormData
) {
  const secondSlug = String(formData.get("second") ?? "");
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect(`/login?next=/tests/${testSlug}`);
  if (!secondSlug || secondSlug === testSlug) throw new Error("Choisis un deuxième rapport.");

  const admin = createAdminClient();
  const { data: tests } = await admin
    .from("tests")
    .select("id, slug, title, price_cents, currency, is_active")
    .in("slug", [testSlug, secondSlug]);
  const first = tests?.find((t) => t.slug === testSlug);
  const second = tests?.find((t) => t.slug === secondSlug);
  if (!first || !second || !first.is_active || !second.is_active) throw new Error("Test introuvable.");
  if (
    first.price_cents !== PACK_BASE_PRICE_CENTS ||
    second.price_cents !== PACK_BASE_PRICE_CENTS ||
    first.currency !== second.currency
  ) {
    throw new Error("Ce pack n'est pas disponible pour ces tests.");
  }
  // Never charge for a report the buyer already owns.
  const { data: owned } = await admin
    .from("purchases")
    .select("test_id")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .in("test_id", [first.id, second.id]);
  if ((owned?.length ?? 0) > 0) throw new Error("Tu possèdes déjà l'un de ces rapports.");

  const customerId = await getOrCreateStripeCustomer(user.id, user.email);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    branding_settings: CHECKOUT_BRANDING,
    custom_text: CHECKOUT_SUBMIT_TEXT,
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: first.currency,
          unit_amount: PACK_PRICE_CENTS,
          product_data: { name: `Pack 2 rapports : ${first.title} + ${second.title}` },
        },
        quantity: 1,
      },
    ],
    metadata: {
      supabase_user_id: user.id,
      test_id: first.id,
      pack_test_id: second.id,
      pack_second_cents: String(PACK_PRICE_CENTS - PACK_BASE_PRICE_CENTS),
    },
    success_url: `${siteUrl}${returnPath}?checkout=success`,
    cancel_url: `${siteUrl}${returnPath}?checkout=cancelled`,
  });
  if (!session.url) throw new Error("Impossible de créer la session de paiement Stripe.");
  redirect(session.url);
}
