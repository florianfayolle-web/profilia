import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTestAccess } from "@/lib/access";
import { GROUP_TEST_SLUGS, summarizeResult } from "@/lib/groups";

// Shared by create/join: the attempt must be the caller's, belong to an
// eligible test and be viewable by them (a locked result must not be
// shareable around the paywall). Returns the summary to store.
export async function loadShareableAttempt(attemptId: string) {
  const admin = createAdminClient();
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, user_id, test_id, result, result_profile_id, unlocked")
    .eq("id", attemptId)
    .maybeSingle();
  if (!attempt) return { error: "Résultat introuvable." } as const;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (attempt.user_id && attempt.user_id !== userData.user?.id) {
    return { error: "Ce résultat n'est pas le tien." } as const;
  }

  const { data: test } = await admin
    .from("tests")
    .select("id, slug, format, title, price_cents, included_in_subscription")
    .eq("id", attempt.test_id)
    .single();
  if (!test || !GROUP_TEST_SLUGS.has(test.slug)) {
    return { error: "Ce test ne peut pas être comparé en groupe." } as const;
  }

  if (test.price_cents === 0) {
    if (!attempt.unlocked) return { error: "Débloque d'abord ton résultat." } as const;
  } else {
    const access = await getTestAccess(test.id, test.price_cents, test.included_in_subscription);
    if (!access.hasAccess) return { error: "Débloque d'abord ton résultat." } as const;
  }

  let profileTitle: string | null = null;
  if (attempt.result_profile_id) {
    const { data: rp } = await admin
      .from("result_profiles")
      .select("title")
      .eq("id", attempt.result_profile_id)
      .maybeSingle();
    profileTitle = rp?.title ?? null;
  }
  const summary = summarizeResult(test.format, attempt.result, profileTitle);
  if (!summary.headline && summary.bars.length === 0 && summary.notes.length === 0) {
    return { error: "Impossible de résumer ce résultat." } as const;
  }
  return { attempt, test, summary } as const;
}

