import { getGuideBySlug } from "@/lib/guides";
import { OG_SIZE, ogCard } from "@/lib/og-card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Guide Profilia";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  return ogCard({ kicker: "Guide", title: guide?.title ?? "Guides Profilia", accent: "#0d9488" });
}
