import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/test-category";
import { CategoryIcon } from "@/components/category-icon";

export const metadata: Metadata = {
  title: "Tous les tests",
  description:
    "Tests de personnalité à choix forcé, tests de jugement situationnel et bilans de personnalité. Essaie gratuitement les premières questions de chaque test.",
  alternates: { canonical: "/tests" },
};

export default function TestsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Tous les tests</h1>
      <p className="mt-2 text-muted">
        Essaie gratuitement les premières questions de chaque test, sans
        engagement. Choisis une catégorie selon ton objectif :
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/tests/${category.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-card-border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              className="relative flex h-36 items-center justify-center overflow-hidden"
              style={{ background: category.gradient }}
            >
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 20%, #fff 0%, transparent 35%), radial-gradient(circle at 85% 75%, #fff 0%, transparent 30%)",
                }}
              />
              <CategoryIcon
                category={category.slug}
                className="relative h-14 w-14 text-white/90 transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            <div className="flex flex-1 flex-col bg-card p-6">
              <h2 className="text-lg font-semibold">{category.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted">
                {category.description}
              </p>
              <span
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: category.accent }}
              >
                Voir les tests
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>

            <div
              className="h-1 w-full"
              style={{ background: category.gradient }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
