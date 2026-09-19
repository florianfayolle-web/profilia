import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ARTICLE_CATEGORY_LABELS, type ArticleRow } from "@/lib/article-types";
import { SITE_URL } from "@/lib/site";
import type { Test } from "@/lib/types";

async function getPublishedArticle(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<ArticleRow>();
  return data;
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getPublishedArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.meta_description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.meta_description,
      url: `${SITE_URL}/blog/${article.slug}`,
      type: "article",
    },
  };
}

export default async function ArticlePage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const article = await getPublishedArticle(slug);

  if (!article) {
    notFound();
  }

  const supabase = await createClient();
  const { data: relatedTests } = await supabase
    .from("tests")
    .select("slug, title, price_cents")
    .in("slug", article.related_slugs)
    .eq("is_active", true)
    .returns<Pick<Test, "slug" | "title" | "price_cents">[]>();

  const orderedRelatedTests = article.related_slugs
    .map((s) => relatedTests?.find((t) => t.slug === s))
    .filter((t): t is Pick<Test, "slug" | "title" | "price_cents"> => !!t);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta_description,
    datePublished: article.published_at,
    url: `${SITE_URL}/blog/${article.slug}`,
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Link href="/blog" className="text-sm text-muted hover:text-foreground">
        ← Tout le blog
      </Link>

      <p className="mt-4 text-xs font-medium tracking-wide text-primary uppercase">
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

      {orderedRelatedTests.length > 0 && (
        <div className="mt-12 rounded-xl border border-primary/30 bg-card p-6">
          <p className="font-medium">Envie d&apos;essayer par toi-même ?</p>
          <div className="mt-4 flex flex-col gap-3">
            {orderedRelatedTests.map((test) => (
              <Link
                key={test.slug}
                href={`/tests/${test.slug}`}
                className="flex items-center justify-between rounded-lg border border-card-border bg-background px-4 py-3 text-sm transition hover:border-primary/40"
              >
                <span className="font-medium">{test.title}</span>
                <span className="text-muted">
                  {test.price_cents === 0 ? "Gratuit →" : "Découvrir →"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
