import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { GUIDES } from "@/lib/guides";
import type { ArticleRow } from "@/lib/article-types";
import type { Test } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("slug, created_at")
    .eq("is_active", true)
    .returns<Pick<Test, "slug" | "created_at">[]>();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tests`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/tests/pilote`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/tests/grande-entreprise`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/tests/personnalite`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/guides`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const testRoutes: MetadataRoute.Sitemap = (tests ?? []).map((test) => ({
    url: `${SITE_URL}/tests/${test.slug}`,
    lastModified: test.created_at,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const admin = createAdminClient();
  const { data: articles } = await admin
    .from("articles")
    .select("slug, published_at")
    .eq("status", "published")
    .returns<Pick<ArticleRow, "slug" | "published_at">[]>();

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((article) => ({
    url: `${SITE_URL}/blog/${article.slug}`,
    lastModified: article.published_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...testRoutes, ...guideRoutes, ...articleRoutes];
}
