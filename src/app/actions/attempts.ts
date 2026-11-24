"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTestAccess } from "@/lib/access";

type SubmittedAnswer = { questionId: string; optionId: string };

// Returns a destination path instead of calling redirect() directly: this
// action is invoked programmatically (not via a <form>), and redirect()'s
// thrown control-flow signal is awkward to distinguish from a real error
// in that case. The caller performs the navigation with next/navigation's
// useRouter instead.
export async function submitAttempt(
  testSlug: string,
  answers: SubmittedAnswer[]
): Promise<{ redirectTo: string } | { error: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: test } = await supabase
    .from("tests")
    .select("id, price_cents, included_in_subscription")
    .eq("slug", testSlug)
    .single();

  if (!test) {
    return { error: "Test introuvable." };
  }

  // Visitors without an account used to be sent to /login and lost every
  // answer. They now get a locked guest attempt (see assessments.ts for the
  // same reasoning); the unlock checkout flips `unlocked` after payment.
  const isGuest = !user;
  if (isGuest && test.price_cents <= 0) {
    return { redirectTo: `/login?next=/tests/${testSlug}/run` };
  }

  const access = isGuest
    ? { hasAccess: false }
    : await getTestAccess(test.id, test.price_cents, test.included_in_subscription);

  // Payment only gates the *result*, not the questions. Re-fetch the
  // authoritative scoring from the database — never trust point values
  // sent by the client, only which options were picked. Without access,
  // question_options is blocked by RLS (it's the paid content), so read it
  // with the admin client instead.
  const optionIds = answers.map((a) => a.optionId);
  const { data: options } = await (access.hasAccess ? supabase : createAdminClient())
    .from("question_options")
    .select("id, question_id, scores")
    .in("id", optionIds);

  const optionById = new Map((options ?? []).map((o) => [o.id, o]));

  const scores: Record<string, number> = {};
  for (const answer of answers) {
    const option = optionById.get(answer.optionId);
    if (!option || option.question_id !== answer.questionId) continue;
    for (const [trait, points] of Object.entries(
      option.scores as Record<string, number>
    )) {
      scores[trait] = (scores[trait] ?? 0) + Number(points);
    }
  }

  // Same RLS gate as question_options above: result_profiles is paid
  // content too, so a non-purchaser's own client can't read it — without
  // the admin fallback here, winningTrait would resolve but never find a
  // matching row, silently leaving result_profile_id null forever.
  const { data: resultProfiles } = await (access.hasAccess ? supabase : createAdminClient())
    .from("result_profiles")
    .select("id, trait_key")
    .eq("test_id", test.id);

  let winningTrait: string | null = null;
  let winningScore = -Infinity;
  for (const [trait, score] of Object.entries(scores)) {
    if (score > winningScore) {
      winningScore = score;
      winningTrait = trait;
    }
  }

  const resultProfile = resultProfiles?.find(
    (profile) => profile.trait_key === winningTrait
  );

  const row = {
    test_id: test.id,
    answers: answers.map((a) => ({
      question_id: a.questionId,
      option_id: a.optionId,
    })),
    scores,
    result_profile_id: resultProfile?.id ?? null,
  };

  let attemptRes;
  if (user) {
    attemptRes = await supabase
      .from("attempts")
      .insert({ ...row, user_id: user.id })
      .select("id")
      .single();
  } else {
    const admin = createAdminClient();
    const hourAgo = new Date(Date.now() - 3600_000).toISOString();
    const { count: hourCount } = await admin
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .is("user_id", null)
      .gte("completed_at", hourAgo);
    if ((hourCount ?? 0) >= 300) {
      return { error: "Beaucoup de monde en ce moment. Réessaie dans quelques minutes." };
    }
    attemptRes = await admin
      .from("attempts")
      .insert({ ...row, user_id: null, unlocked: false })
      .select("id")
      .single();
  }
  const { data: attempt, error } = attemptRes;

  if (error || !attempt) {
    return { error: "Impossible d'enregistrer ta réponse." };
  }

  return { redirectTo: `/tests/${testSlug}/result/${attempt.id}` };
}
