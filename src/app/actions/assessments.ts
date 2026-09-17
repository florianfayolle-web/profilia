"use server";

import { createClient } from "@/lib/supabase/server";
import { getTestAccess } from "@/lib/access";
import {
  scoreBipolarPairs,
  scoreForcedChoicePair,
  scoreForcedChoiceQuad,
  scoreLikertScale,
  scoreSituationalJudgment,
  type AnswerMap,
} from "@/lib/assessments/scoring";
import type {
  BipolarPairsDefinition,
  ForcedChoicePairDefinition,
  ForcedChoiceQuadDefinition,
  LikertScaleDefinition,
  SituationalJudgmentDefinition,
} from "@/lib/assessments/types";

// Same "return a destination instead of calling redirect()" reasoning as
// src/app/actions/attempts.ts — this is invoked programmatically, not via a
// <form>.
export async function submitAssessmentAttempt(
  testSlug: string,
  answers: AnswerMap
): Promise<{ redirectTo: string } | { error: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return { redirectTo: `/login?next=/tests/${testSlug}/run` };
  }

  const { data: test } = await supabase
    .from("tests")
    .select("id, format, language, price_cents, included_in_subscription")
    .eq("slug", testSlug)
    .single();

  if (!test) {
    return { error: "Test introuvable." };
  }

  const lang = test.language === "en" ? "en" : "fr";

  const access = await getTestAccess(
    test.id,
    test.price_cents,
    test.included_in_subscription
  );

  if (!access.hasAccess) {
    return { redirectTo: `/tests/${testSlug}` };
  }

  const { data: content } = await supabase
    .from("test_content")
    .select("definition")
    .eq("test_id", test.id)
    .single();

  if (!content) {
    return { error: "Contenu du test introuvable." };
  }

  let result: unknown;
  switch (test.format) {
    case "forced_choice_pair":
      result = scoreForcedChoicePair(
        content.definition as ForcedChoicePairDefinition,
        answers,
        lang
      );
      break;
    case "forced_choice_quad":
      result = scoreForcedChoiceQuad(
        content.definition as ForcedChoiceQuadDefinition,
        answers,
        lang
      );
      break;
    case "situational_judgment":
      result = scoreSituationalJudgment(
        content.definition as SituationalJudgmentDefinition,
        answers,
        lang
      );
      break;
    case "likert_scale":
      result = scoreLikertScale(
        content.definition as LikertScaleDefinition,
        answers,
        lang
      );
      break;
    case "bipolar_pairs":
      result = scoreBipolarPairs(
        content.definition as BipolarPairsDefinition,
        answers
      );
      break;
    default:
      return { error: `Format de test non pris en charge : ${test.format}` };
  }

  const { data: attempt, error } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      test_id: test.id,
      answers,
      result,
    })
    .select("id")
    .single();

  if (error || !attempt) {
    return { error: "Impossible d'enregistrer ta réponse." };
  }

  return { redirectTo: `/tests/${testSlug}/result/${attempt.id}` };
}
