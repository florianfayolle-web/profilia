import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/test-category";
import { CategoryIcon } from "@/components/category-icon";

export const metadata: Metadata = {
  title: "Tous les tests",
  description:
    "Tests de personnalité à choix forcé, tests de jugement situationnel et bilans de personnalité. Réponds à toutes les questions gratuitement, seul le rapport complet est payant.",
  alternates: { canonical: "/tests" },
};

export default function TestsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Tous les tests</h1>
      <p className="mt-2 text-muted">
        Réponds à toutes les questions de chaque test gratuitement, sans
        engagement : seul ton rapport complet est payant, à la fin. Choisis une catégorie selon ton objectif :
      </p>

      <div className="mt-10 grid grid-cols-2 gap-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/tests/${category.slug}`}
            className="group relative flex aspect-square flex-col overflow-hidden rounded-2xl border border-card-border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden"
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
                className="relative h-14 w-14 text-white/90 transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16"
              />
            </div>

            <div className="flex flex-col bg-card p-4 sm:p-6">
              <h2 className="text-sm font-semibold sm:text-lg">{category.title}</h2>
              <p className="mt-1 line-clamp-2 text-xs text-muted sm:mt-2 sm:text-sm">
                {category.description}
              </p>
              <span
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold sm:mt-4 sm:text-sm"
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
