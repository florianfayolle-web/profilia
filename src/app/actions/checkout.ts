"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

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
