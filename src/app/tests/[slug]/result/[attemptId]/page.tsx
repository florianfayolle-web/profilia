import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Attempt, ResultProfile, Test } from "@/lib/types";
import { ResultView } from "./result-view";
import { UpsellSection } from "./upsell-section";
import { TeaserResult, type TeaserData } from "./teaser-result";
import type { scoreBipolarPairs } from "@/lib/assessments/scoring";
import { getTestThemeStyle } from "@/lib/test-theme";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { PaidLockedResult } from "./paid-locked-result";
import { getTestAccess } from "@/lib/access";
import { SITE_NAME } from "@/lib/site";

// Personal result pages: never indexed, never shared publicly.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Strips a bipolar_pairs result down to only what the locked teaser is
// allowed to show: the headline trait (the deliberate free hook) and the
// dimension *names*, never the real per-dimension scores/tendency/prose —
// those must stay server-side until the attempt is actually unlocked, since
// anything sent to the client (even under a CSS blur) is readable from the
// page source.
function redactBipolarResult(
  result: ReturnType<typeof scoreBipolarPairs>
): TeaserData {
  return {
    mainProfile: result.mainProfile,
    dimensions: result.dimensionResults.map((d) => ({ key: d.key, name: d.name })),
  };
}

export default async function ResultPage(
  props: PageProps<"/tests/[slug]/result/[attemptId]">
) {
  const { slug, attemptId } = await props.params;
  const searchParams = await props.searchParams;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  // RLS only lets this query through for a row the caller owns (auth.uid()
  // = user_id) — there is deliberately no public SELECT policy for guest
  // (user_id null) rows, since that would let anyone enumerate every free
  // test taker's email/answers/result, not just the one whose URL they
  // hold. A guest attempt is instead fetched below via the admin client,
  // scoped to this exact id from the URL — never a public listing.
  const { data: ownedAttempt } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .maybeSingle<Attempt>();

  let attempt = ownedAttempt;
  if (!attempt) {
    const { data: guestAttempt } = await createAdminClient()
      .from("attempts")
      .select("*")
      .eq("id", attemptId)
      .is("user_id", null)
      .maybeSingle<Attempt>();
    attempt = guestAttempt;
  }

  if (!attempt) {
    notFound();
  }

  let candidateName = attempt.guest_email ?? "";
  if (userData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userData.user.id)
      .maybeSingle<{ full_name: string | null }>();
    candidateName = profile?.full_name?.trim() || userData.user.email || "";
  }

  const { data: test } = await supabase
    .from("tests")
    .select("id, format, title, language, price_cents, currency, included_in_subscription")
    .eq("id", attempt.test_id)
    .single<
      Pick<
        Test,
        | "id"
        | "format"
        | "title"
        | "language"
        | "price_cents"
        | "currency"
        | "included_in_subscription"
      >
    >();

  let resultProfile: ResultProfile | null = null;
  if (attempt.result_profile_id) {
    const { data } = await supabase
      .from("result_profiles")
      .select("*")
      .eq("id", attempt.result_profile_id)
      .maybeSingle<ResultProfile>();
    resultProfile = data;
  }

  const isRichFormat = test && test.format !== "single_choice";
  const isFreeTest = test?.price_cents === 0;

  // A guest attempt on the fully free test is unlocked by a one-off micro-
  // payment tied to that exact attempt (attempts.unlocked, flipped by the
  // Stripe webhook — see submitFreeAttempt). Every other, paid test never
  // gates the questions, only the result: access is the buyer's normal
  // test/subscription access, re-checked live on every load, so paying
  // *after* answering unlocks this same page automatically on return.
  const access =
    !isFreeTest && test
      ? await getTestAccess(test.id, test.price_cents, test.included_in_subscription)
      : null;

  const isLocked = isFreeTest ? !attempt.unlocked : !(access?.hasAccess ?? false);
  const pendingUnlock =
    isLocked && (searchParams.unlock === "success" || searchParams.checkout === "success");

  return (
    <div
      className="sky-gradient mx-auto max-w-2xl px-6 py-16"
      style={getTestThemeStyle(slug)}
    >
      <div className="print-report-header">
        <div className="mx-auto flex h-full max-w-2xl items-center justify-between px-6">
          <span className="flex items-center gap-2 text-base font-semibold tracking-tight text-primary">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            />
            {SITE_NAME}
          </span>
          <span className="text-right text-[11px] leading-tight text-muted-foreground">
            <span className="block font-medium text-foreground">
              {test?.title ?? "Rapport de personnalité"}
            </span>
            <span className="block">
              {candidateName ? `${candidateName} · ` : ""}
              {new Date().toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </span>
        </div>
      </div>

      <div className="print-report-footer">
        <div className="mx-auto flex h-full max-w-2xl items-center justify-between px-6 text-[10px] text-muted-foreground">
          <span>
            {SITE_NAME}, Rapport confidentiel, à usage strictement personnel.
          </span>
          <span>
            Page <span className="print-page-number" />
          </span>
        </div>
      </div>

      {!isLocked && (
        <div className="mb-6 flex justify-end print:hidden">
          <DownloadPdfButton />
        </div>
      )}

      <div className="text-center">
        <p className="text-sm font-medium text-foreground/70">
          {test?.title ?? "Ton résultat"}
        </p>
        {!isRichFormat && (
          <>
            {resultProfile ? (
              <>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  {resultProfile.title}
                </h1>
                <p className="mt-4 text-muted">{resultProfile.description}</p>
              </>
            ) : (
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Résultat non disponible
              </h1>
            )}
          </>
        )}
      </div>

      {isRichFormat && test && isLocked && isFreeTest && (
        <div className="mt-6">
          <TeaserResult
            result={redactBipolarResult(
              attempt.result as ReturnType<typeof scoreBipolarPairs>
            )}
            testSlug={slug}
            attemptId={attemptId}
            pendingUnlock={pendingUnlock}
          />
        </div>
      )}

      {isRichFormat && test && isLocked && !isFreeTest && (
        <div className="mt-6">
          <PaidLockedResult
            testSlug={slug}
            attemptId={attemptId}
            testTitle={test.title}
            priceCents={test.price_cents}
            currency={test.currency}
            includedInSubscription={test.included_in_subscription}
            pendingUnlock={pendingUnlock}
          />
        </div>
      )}

      {isRichFormat && test && !isLocked && (
        <div className="mt-6">
          <ResultView
            format={test.format}
            result={attempt.result}
            language={test.language}
          />
        </div>
      )}

      {test?.price_cents === 0 && !isLocked && (
        <div className="print:hidden">
          <UpsellSection />
        </div>
      )}

      <div className="mt-10 flex justify-center gap-4 print:hidden">
        <Link
          href="/tests"
          className="rounded-full border border-card-border px-6 py-2.5 text-sm font-medium transition hover:border-primary/40"
        >
          Voir d&apos;autres tests
        </Link>
        {userData.user ? (
          <Link
            href="/account"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
          >
            Mon compte
          </Link>
        ) : (
          <Link
            href="/signup"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
          >
            Créer un compte
          </Link>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground print:hidden">
        Test : {slug}
      </p>
    </div>
  );
}
