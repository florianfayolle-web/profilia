import { createAdminClient } from "@/lib/supabase/admin";
import { OG_SIZE, ogCard } from "@/lib/og-card";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/article-types";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Article du blog Profilia";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await createAdminClient()
    .from("articles")
    .select("title, category")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<{ title: string; category: string }>();
  return ogCard({
    kicker: data ? ARTICLE_CATEGORY_LABELS[data.category as keyof typeof ARTICLE_CATEGORY_LABELS] ?? "Blog" : "Blog",
    title: data?.title ?? "Le blog Profilia",
    accent: data?.category === "fun" ? "#e11d48" : "#4f46e5",
  });
}
