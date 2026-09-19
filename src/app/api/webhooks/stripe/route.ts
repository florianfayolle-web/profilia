import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;

      if (session.mode === "payment") {
        const testId = session.metadata?.test_id;
        const attemptId = session.metadata?.attempt_id;
        if (userId && testId) {
          await supabase.from("purchases").upsert(
            {
              user_id: userId,
              test_id: testId,
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
              amount_cents: session.amount_total ?? undefined,
              currency: session.currency ?? undefined,
              status: "paid",
            },
            { onConflict: "user_id,test_id" }
          );
        } else if (attemptId) {
          // Guest micro-payment to unblur a free test's result — no
          // user_id, the attempt's own id is the only key we have.
          await supabase
            .from("attempts")
            .update({ unlocked: true })
            .eq("id", attemptId);
        }
      }
      // Subscription checkouts are handled by the subscription.* events below,
      // which fire right after this one and carry the full subscription state.
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (profile) {
        const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
        await supabase.from("subscriptions").upsert(
          {
            user_id: profile.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_end: currentPeriodEnd
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_subscription_id" }
        );
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
