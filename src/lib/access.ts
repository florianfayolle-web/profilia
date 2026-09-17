import "server-only";
import { createClient } from "@/lib/supabase/server";

// Number of questions/items anyone can try for free before hitting the
// paywall, regardless of login state.
export const PREVIEW_ITEM_LIMIT = 5;

export type AccessStatus = {
  hasAccess: boolean;
  isFree: boolean;
  hasActiveSubscription: boolean;
  hasPurchased: boolean;
};

// Central place that decides whether the current user can take a given test.
// Mirrors the `has_test_access` SQL function used in Row Level Security,
// so the UI and the database enforce the same rule.
export async function getTestAccess(
  testId: string,
  priceCents: number,
  includedInSubscription: boolean
): Promise<AccessStatus> {
  if (priceCents === 0) {
    return {
      hasAccess: true,
      isFree: true,
      hasActiveSubscription: false,
      hasPurchased: false,
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return {
      hasAccess: false,
      isFree: false,
      hasActiveSubscription: false,
      hasPurchased: false,
    };
  }

  const [{ data: purchase }, { data: subscription }] = await Promise.all([
    supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("test_id", testId)
      .eq("status", "paid")
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .maybeSingle(),
  ]);

  const hasPurchased = Boolean(purchase);
  const hasActiveSubscription = Boolean(subscription) && includedInSubscription;

  return {
    hasAccess: hasPurchased || hasActiveSubscription,
    isFree: false,
    hasActiveSubscription,
    hasPurchased,
  };
}
