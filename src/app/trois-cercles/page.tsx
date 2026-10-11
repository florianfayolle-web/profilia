import type { Metadata } from "next";
import Link from "next/link";
import { ThreeCirclesTest } from "@/components/three-circles-test";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agir, influencer, accepter : test gratuit des 3 cercles",
  description:
    "Test gratuit en dix scènes du quotidien : où te situes-tu entre agir, influencer et accepter ? Résultat immédiat, sans compte.",
  alternates: { canonical: "/trois-cercles" },
  openGraph: {
    title: "Agir, influencer, accepter : où est-ce que je me situe ?",
    description:
      "Test gratuit en dix scènes du quotidien : où te situes-tu entre agir, influencer et accepter ?",
    url: `${SITE_URL}/trois-cercles`,
    type: "website",
  },
};

export default function ThreeCirclesPage() {
  return (
    <div className="px-4 py-10">
      <p className="mx-auto mb-4 max-w-[640px] text-sm text-muted">
        <Link href="/tests" className="hover:text-foreground">
          Tous les tests
        </Link>
      </p>
      <ThreeCirclesTest />
    </div>
  );
}
