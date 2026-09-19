import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ARTICLE_CATEGORY_LABELS, type ArticleCategory, type ArticleRow } from "@/lib/article-types";

export const metadata: Metadata = {
  title: "Blog : tests de personnalité, recrutement et jeux entre amis",
  description:
    "Articles sur l'utilisation des tests de personnalité en recrutement, et des idées pour en faire un moment amusant entre amis ou en famille.",
  alternates: { canonical: "/blog" },
};

const CATEGORIES: ArticleCategory[] = ["recrutement", "fun"];

export default async function BlogIndexPage() {
  const supabase = createAdminClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, category, title, meta_description, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<Pick<ArticleRow, "slug" | "category" | "title" | "meta_description" | "published_at">[]>();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Le blog</h1>
      <p className="mt-3 text-muted">
        Tests de personnalité en recrutement, et idées pour en faire un
        moment amusant entre amis ou en famille.
      </p>

      {CATEGORIES.map((category) => {
        const categoryArticles = (articles ?? []).filter((a) => a.category === category);
        if (categoryArticles.length === 0) return null;

        return (
          <section key={category} className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight">
              {ARTICLE_CATEGORY_LABELS[category] ?? category}
            </h2>
            <div className="mt-5 space-y-4">
              {categoryArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="block rounded-xl border border-card-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
                >
                  <h3 className="text-lg font-medium">{article.title}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {article.meta_description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
