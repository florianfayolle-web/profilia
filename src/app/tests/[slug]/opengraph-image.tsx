import { createAdminClient } from "@/lib/supabase/admin";
import { OG_SIZE, ogCard } from "@/lib/og-card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Test de personnalité Profilia";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await createAdminClient()
    .from("tests")
    .select("title, price_cents")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<{ title: string; price_cents: number }>();
  return ogCard({
    kicker: data?.price_cents === 0 ? "Test gratuit" : "Test de personnalité",
    title: data?.title ?? "Tests de personnalité",
    accent: "#4f46e5",
  });
}
