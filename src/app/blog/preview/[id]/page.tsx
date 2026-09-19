import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ARTICLE_CATEGORY_LABELS, type ArticleRow } from "@/lib/article-types";
import { publishArticle } from "@/app/actions/articles";

export const metadata: Metadata = {
  title: "Prévisualisation d'article (brouillon)",
  robots: { index: false, follow: false },
};

export default async function ArticlePreviewPage(
  props: PageProps<"/blog/preview/[id]">
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  const supabase = createAdminClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle<ArticleRow>();

  if (!article || article.publish_token !== token) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 rounded-xl border border-primary/30 bg-card p-5">
        <p className="text-sm font-medium">
          {article.status === "published"
            ? "Cet article est déjà publié."
            : "Brouillon — pas encore visible publiquement."}
        </p>
        {article.status !== "published" && (
          <form action={publishArticle} className="mt-4">
            <input type="hidden" name="id" value={article.id} />
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Publier cet article
            </button>
          </form>
        )}
      </div>

      <p className="text-xs font-medium tracking-wide text-primary uppercase">
        {ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {article.title}
      </h1>
      <p className="mt-4 text-muted">{article.intro}</p>

      <div className="mt-10 space-y-10">
        {article.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-xl font-semibold tracking-tight">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
