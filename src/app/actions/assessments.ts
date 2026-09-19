"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTestAccess } from "@/lib/access";
import {
  scoreBipolarPairs,
  scoreCareerBalance,
  scoreDisc,
  scoreForcedChoicePair,
  scoreForcedChoiceQuad,
  scoreLikertScale,
  scoreLogicMcq,
  scoreOrientation,
  scorePcm,
  scoreSituationalJudgment,
  scoreSosie,
  type AnswerMap,
} from "@/lib/assessments/scoring";
import type {
  BipolarPairsDefinition,
  CareerBalanceDefinition,
  DiscAnswer,
  DiscDefinition,
  ForcedChoicePairDefinition,
  ForcedChoiceQuadDefinition,
  LikertScaleDefinition,
  LogicMcqDefinition,
  OrientationDefinition,
  PcmAnswer,
  PcmDefinition,
  SituationalJudgmentDefinition,
  SosieAnswer,
  SosieDefinition,
} from "@/lib/assessments/types";

type AnyAssessmentAnswers =
  | AnswerMap
  | Record<string, DiscAnswer>
  | Record<string, PcmAnswer>
  | Record<string, SosieAnswer>;

// Shared by submitAssessmentAttempt (logged-in) and submitFreeAttempt
// (guest, free tests only) so both paths score every format identically.
function scoreByFormat(
  format: string,
  definition: unknown,
  answers: AnyAssessmentAnswers,
  lang: "fr" | "en"
): { result: unknown } | { error: string } {
  switch (format) {
    case "forced_choice_pair":
      return {
        result: scoreForcedChoicePair(
          definition as ForcedChoicePairDefinition,
          answers as AnswerMap,
          lang
        ),
      };
    case "forced_choice_quad":
      return {
        result: scoreForcedChoiceQuad(
          definition as ForcedChoiceQuadDefinition,
          answers as AnswerMap,
          lang
        ),
      };
    case "situational_judgment":
      return {
        result: scoreSituationalJudgment(
          definition as SituationalJudgmentDefinition,
          answers as AnswerMap,
          lang
        ),
      };
    case "likert_scale":
      return {
        result: scoreLikertScale(
          definition as LikertScaleDefinition,
          answers as AnswerMap,
          lang
        ),
      };
    case "bipolar_pairs":
      return {
        result: scoreBipolarPairs(
          definition as BipolarPairsDefinition,
          answers as AnswerMap
        ),
      };
    case "disc_quad":
      return {
        result: scoreDisc(
          definition as DiscDefinition,
          answers as Record<string, DiscAnswer>,
          lang
        ),
      };
    case "pcm_likert":
      return {
        result: scorePcm(
          definition as PcmDefinition,
          answers as Record<string, PcmAnswer>
        ),
      };
    case "logic_mcq":
      return {
        result: scoreLogicMcq(
          definition as LogicMcqDefinition,
          answers as Record<string, number>
        ),
      };
    case "career_balance":
      return {
        result: scoreCareerBalance(
          definition as CareerBalanceDefinition,
          answers as Record<string, number>
        ),
      };
    case "sosie_v2":
      return {
        result: scoreSosie(
          definition as SosieDefinition,
          answers as Record<string, SosieAnswer>
        ),
      };
    case "orientation_riasec":
      return {
        result: scoreOrientation(
          definition as OrientationDefinition,
          answers as Record<string, number>
        ),
      };
    default:
      return { error: `Format de test non pris en charge : ${format}` };
  }
}

// Same "return a destination instead of calling redirect()" reasoning as
// src/app/actions/attempts.ts — this is invoked programmatically, not via a
// <form>.
export async function submitAssessmentAttempt(
  testSlug: string,
  answers: AnyAssessmentAnswers
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

  const scored = scoreByFormat(test.format, content.definition, answers, lang);
  if ("error" in scored) {
    return scored;
  }

  const { data: attempt, error } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      test_id: test.id,
      answers,
      result: scored.result,
    })
    .select("id")
    .single();

  if (error || !attempt) {
    return { error: "Impossible d'enregistrer ta réponse." };
  }

  return { redirectTo: `/tests/${testSlug}/result/${attempt.id}` };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Guest path for fully free tests (price_cents === 0): no account, just an
// email address (and an explicit marketing opt-in) traded for the result.
// Uses the admin client because there is no authenticated session to satisfy
// the normal "insertable by owner" RLS policy — this function is the only
// place that's allowed to write a user_id-less attempt or a marketing lead,
// and it re-validates the test is actually free before doing either.
export async function submitFreeAttempt(
  testSlug: string,
  answers: AnyAssessmentAnswers,
  email: string,
  consent: boolean
): Promise<{ redirectTo: string } | { error: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmedEmail)) {
    return { error: "Adresse email invalide." };
  }

  const supabase = await createClient();
  const { data: test } = await supabase
    .from("tests")
    .select("id, format, language, price_cents")
    .eq("slug", testSlug)
    .single();

  if (!test) {
    return { error: "Test introuvable." };
  }
  if (test.price_cents !== 0) {
    return { error: "Ce test n'est pas gratuit." };
  }

  const lang = test.language === "en" ? "en" : "fr";

  const { data: content } = await supabase
    .from("test_content")
    .select("definition")
    .eq("test_id", test.id)
    .single();

  if (!content) {
    return { error: "Contenu du test introuvable." };
  }

  const scored = scoreByFormat(test.format, content.definition, answers, lang);
  if ("error" in scored) {
    return scored;
  }

  const admin = createAdminClient();

  const { data: attempt, error } = await admin
    .from("attempts")
    .insert({
      user_id: null,
      test_id: test.id,
      answers,
      result: scored.result,
      guest_email: trimmedEmail,
      // Blurred teaser until the visitor pays the unlock micro-payment —
      // see createUnlockCheckoutSession / the Stripe webhook.
      unlocked: false,
    })
    .select("id")
    .single();

  if (error || !attempt) {
    return { error: "Impossible d'enregistrer ta réponse." };
  }

  const { error: leadError } = await admin.from("marketing_leads").insert({
    email: trimmedEmail,
    test_slug: testSlug,
    consent,
    attempt_id: attempt.id,
  });
  if (leadError) {
    // The result is already saved — don't block the visitor over a lead-
    // tracking failure, just leave a trace server-side to investigate later.
    console.error("Failed to record marketing lead:", leadError.message);
  }

  return { redirectTo: `/tests/${testSlug}/result/${attempt.id}` };
}
