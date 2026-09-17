"use server";

import { createClient } from "@/lib/supabase/server";
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

  if (!user) {
    return { redirectTo: `/login?next=/tests/${testSlug}/run` };
  }

  const { data: test } = await supabase
    .from("tests")
    .select("id, price_cents, included_in_subscription")
    .eq("slug", testSlug)
    .single();

  if (!test) {
    return { error: "Test introuvable." };
  }

  const access = await getTestAccess(
    test.id,
    test.price_cents,
    test.included_in_subscription
  );

  if (!access.hasAccess) {
    return { redirectTo: `/tests/${testSlug}` };
  }

  // Re-fetch the authoritative scoring from the database — never trust
  // point values sent by the client, only which options were picked.
  const optionIds = answers.map((a) => a.optionId);
  const { data: options } = await supabase
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

  const { data: resultProfiles } = await supabase
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

  const { data: attempt, error } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      test_id: test.id,
      answers: answers.map((a) => ({
        question_id: a.questionId,
        option_id: a.optionId,
      })),
      scores,
      result_profile_id: resultProfile?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !attempt) {
    return { error: "Impossible d'enregistrer ta réponse." };
  }

  return { redirectTo: `/tests/${testSlug}/result/${attempt.id}` };
}
