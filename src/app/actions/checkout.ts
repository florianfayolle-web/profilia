"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

// Kept in sync with scripts/assessment-entries.mjs's UNLOCK_RESULT_LOOKUP_KEY
// (that file is a standalone Node script, not part of the app bundle, so the
// key is duplicated here rather than imported across that boundary).
const UNLOCK_RESULT_LOOKUP_KEY = "unlock_guest_result";

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

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

// One-off purchase of a single test.
export async function createTestCheckoutSession(testSlug: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect(`/login?next=/tests/${testSlug}`);
  }

  const { data: test } = await supabase
    .from("tests")
    .select("id, slug, title, price_cents, currency, stripe_price_id")
    .eq("slug", testSlug)
    .single();

  if (!test) {
    throw new Error("Test introuvable.");
  }

  if (!test.stripe_price_id) {
    throw new Error(
      `Le test "${test.title}" n'a pas de stripe_price_id configuré.`
    );
  }

  const customerId = await getOrCreateStripeCustomer(user.id, user.email);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: test.stripe_price_id, quantity: 1 }],
    metadata: { supabase_user_id: user.id, test_id: test.id },
    success_url: `${siteUrl}/tests/${test.slug}?checkout=success`,
    cancel_url: `${siteUrl}/tests/${test.slug}?checkout=cancelled`,
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

  const customerId = await getOrCreateStripeCustomer(user.id, user.email);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
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
    .select("id, guest_email, unlocked")
    .eq("id", attemptId)
    .is("user_id", null)
    .maybeSingle();

  if (!attempt) {
    redirect(`/tests/${testSlug}/result/${attemptId}`);
  }
  if (attempt.unlocked) {
    redirect(`/tests/${testSlug}/result/${attemptId}`);
  }

  const prices = await stripe.prices.list({
    lookup_keys: [UNLOCK_RESULT_LOOKUP_KEY],
    limit: 1,
  });
  const priceId = prices.data[0]?.id;
  if (!priceId) {
    throw new Error(
      `Aucun prix Stripe trouvé pour "${UNLOCK_RESULT_LOOKUP_KEY}". Lance scripts/setup-stripe.mjs.`
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: attempt.guest_email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { attempt_id: attempt.id },
    success_url: `${siteUrl}/tests/${testSlug}/result/${attemptId}?unlock=success`,
    cancel_url: `${siteUrl}/tests/${testSlug}/result/${attemptId}?unlock=cancelled`,
  });

  if (!session.url) {
    throw new Error("Impossible de créer la session de paiement Stripe.");
  }

  redirect(session.url);
}
