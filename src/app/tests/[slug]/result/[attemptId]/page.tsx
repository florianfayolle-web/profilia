import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Attempt, ResultProfile, Test } from "@/lib/types";
import { ResultView } from "./result-view";
import { getTestThemeStyle } from "@/lib/test-theme";

// Personal result pages: never indexed, never shared publicly.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ResultPage(
  props: PageProps<"/tests/[slug]/result/[attemptId]">
) {
  const { slug, attemptId } = await props.params;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    notFound();
  }

  const { data: attempt } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .maybeSingle<Attempt>();

  if (!attempt) {
    notFound();
  }

  const { data: test } = await supabase
    .from("tests")
    .select("format, title, language")
    .eq("id", attempt.test_id)
    .single<Pick<Test, "format" | "title" | "language">>();

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

  return (
    <div
      className="mx-auto max-w-2xl px-6 py-16"
      style={getTestThemeStyle(slug)}
    >
      <div className="text-center">
        <p className="text-sm text-muted">{test?.title ?? "Ton résultat"}</p>
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

      {isRichFormat && test && (
        <div className="mt-6">
          <ResultView format={test.format} result={attempt.result} language={test.language} />
        </div>
      )}

      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/tests"
          className="rounded-full border border-card-border px-6 py-2.5 text-sm font-medium transition hover:border-primary/40"
        >
          Voir d&apos;autres tests
        </Link>
        <Link
          href="/account"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
        >
          Mon compte
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Test : {slug}
      </p>
    </div>
  );
}
