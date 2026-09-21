import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES, getGuideBySlug } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ArticleRow } from "@/lib/article-types";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata(
  props: PageProps<"/guides/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url: `${SITE_URL}/guides/${guide.slug}`,
      type: "article",
    },
  };
}

export default async function GuidePage(props: PageProps<"/guides/[slug]">) {
  const { slug } = await props.params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    url: `${SITE_URL}/guides/${guide.slug}`,
  };

  // Reverse of the blog→guide cross-link: surface any published article
  // that references this guide's test, so the two content types keep
  // pointing traffic (and crawl paths) at each other both ways.
  const { data: relatedArticles } = await createAdminClient()
    .from("articles")
    .select("slug, title")
    .eq("status", "published")
    .contains("related_slugs", [guide.testSlug])
    .returns<Pick<ArticleRow, "slug" | "title">[]>();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Link href="/guides" className="text-sm text-muted hover:text-foreground">
        ← Tous les guides
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {guide.title}
      </h1>
      <p className="mt-4 text-muted">{guide.intro}</p>

      <div className="mt-10 rounded-xl border border-primary/30 bg-card p-6">
        <p className="font-medium">Envie de t&apos;entraîner directement ?</p>
        <p className="mt-1 text-sm text-muted">
          5 premières questions gratuites, sans engagement.
        </p>
        <Link
          href={`/tests/${guide.testSlug}`}
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
        >
          Essayer ce test
        </Link>
      </div>

      <div className="mt-10 space-y-10">
        {guide.sections.map((section) => (
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

      <div className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">
          Questions fréquentes
        </h2>
        <div className="mt-6 space-y-6">
          {guide.faq.map((item) => (
            <div key={item.question}>
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-2 text-sm text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {relatedArticles && relatedArticles.length > 0 && (
        <div className="mt-12">
          <p className="text-sm font-medium text-foreground/80">
            À lire aussi sur le blog
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {relatedArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="text-sm text-primary hover:underline"
              >
                {article.title} →
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 rounded-xl border border-card-border bg-card p-6 text-center">
        <p className="font-medium">Prêt à essayer ?</p>
        <Link
          href={`/tests/${guide.testSlug}`}
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
        >
          Commencer l&apos;aperçu gratuit
        </Link>
      </div>
    </div>
  );
}
