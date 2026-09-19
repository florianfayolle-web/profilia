import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides : comprendre chaque test de personnalité",
  description:
    "Comment se déroule chaque format de test (SOSIE 2, TD12, ADAPT, Big Five/OCEAN, MBTI...), pourquoi il est utilisé en recrutement, et comment t'y préparer.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Comprendre chaque test de personnalité
      </h1>
      <p className="mt-3 text-muted">
        Comment se déroule chaque format, pourquoi il est utilisé en
        recrutement, et comment t&apos;y préparer sans fausser ton profil.
      </p>

      <div className="mt-10 space-y-4">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="block rounded-xl border border-card-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
          >
            <h2 className="text-lg font-medium">{guide.title}</h2>
            <p className="mt-2 text-sm text-muted">{guide.metaDescription}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
