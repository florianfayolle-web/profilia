import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTestAccess, PREVIEW_ITEM_LIMIT } from "@/lib/access";
import type { Question, Test } from "@/lib/types";
import { Quiz } from "./quiz";
import { AssessmentQuiz } from "./assessment-quiz";
import { getTestThemeStyle } from "@/lib/test-theme";

export default async function RunTestPage(
  props: PageProps<"/tests/[slug]/run">
) {
  const { slug } = await props.params;

  const supabase = await createClient();
  const { data: test } = await supabase
    .from("tests")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<Test>();

  if (!test) {
    notFound();
  }

  const access = await getTestAccess(
    test.id,
    test.price_cents,
    test.included_in_subscription
  );

  if (test.format !== "single_choice") {
    // Without full access, test_content is blocked by RLS (it's the paid
    // content) — read it with the admin client instead, and only ever send
    // the client a preview-sized slice of `items`, never the whole bank.
    const { data: content } = access.hasAccess
      ? await supabase
          .from("test_content")
          .select("definition")
          .eq("test_id", test.id)
          .single()
      : await createAdminClient()
          .from("test_content")
          .select("definition")
          .eq("test_id", test.id)
          .single();

    if (!content) {
      return (
        <div className="mx-auto max-w-2xl px-6 py-16">
          <p>Le contenu de ce test n&apos;est pas encore disponible.</p>
        </div>
      );
    }

    const definition = access.hasAccess
      ? content.definition
      : {
          ...content.definition,
          items: content.definition.items.slice(0, PREVIEW_ITEM_LIMIT),
        };

    return (
      <div
        className="sky-gradient min-h-[calc(100vh-4rem)] px-6 py-12"
        style={getTestThemeStyle(test.slug)}
      >
        <div className="mx-auto max-w-2xl rounded-2xl border border-card-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">
            {test.title}
          </h1>
          <AssessmentQuiz
            testSlug={test.slug}
            format={test.format}
            definition={definition}
            language={test.language}
            hasAccess={access.hasAccess}
          />
        </div>
      </div>
    );
  }

  const questionsQuery = (
    access.hasAccess ? supabase : createAdminClient()
  )
    .from("questions")
    .select("*, question_options(*)")
    .eq("test_id", test.id)
    .order("position", { ascending: true })
    .order("position", { referencedTable: "question_options", ascending: true });

  const { data: allQuestions } = await (access.hasAccess
    ? questionsQuery
    : questionsQuery.limit(PREVIEW_ITEM_LIMIT)
  ).returns<Question[]>();

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p>Ce test n&apos;a pas encore de questions.</p>
      </div>
    );
  }

  return (
    <div
      className="sky-gradient min-h-[calc(100vh-4rem)] px-6 py-12"
      style={getTestThemeStyle(test.slug)}
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-card-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight">{test.title}</h1>
        <Quiz
          testSlug={test.slug}
          questions={allQuestions}
          hasAccess={access.hasAccess}
        />
      </div>
    </div>
  );
}
