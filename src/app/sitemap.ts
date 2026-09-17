import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
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
    { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const testRoutes: MetadataRoute.Sitemap = (tests ?? []).map((test) => ({
    url: `${SITE_URL}/tests/${test.slug}`,
    lastModified: test.created_at,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...testRoutes];
}
