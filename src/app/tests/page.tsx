import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { type Test } from "@/lib/types";
import { getTestOrder, getTestThemeStyle, hasTestTheme } from "@/lib/test-theme";

export const metadata: Metadata = {
  title: "Tous les tests",
  description:
    "Tests de personnalité à choix forcé, tests de jugement situationnel et bilans de personnalité, à l'unité ou en illimité avec l'abonnement.",
  alternates: { canonical: "/tests" },
};

const LANGUAGE_LABELS: Record<string, string> = {
  fr: "Tests en français",
  en: "Tests in English",
};

const LANGUAGE_ORDER = ["fr", "en"];

function groupByLanguage(tests: Test[]) {
  const groups = new Map<string, Test[]>();
  for (const test of tests) {
    const key = test.language || "fr";
    groups.set(key, [...(groups.get(key) ?? []), test]);
  }

  for (const group of groups.values()) {
    group.sort((a, b) => getTestOrder(a.slug) - getTestOrder(b.slug));
  }

  return [...groups.entries()].sort(([a], [b]) => {
    const ia = LANGUAGE_ORDER.indexOf(a);
    const ib = LANGUAGE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function TestCard({ test }: { test: Test }) {
  if (hasTestTheme(test.slug)) {
    return (
      <Link
        href={`/tests/${test.slug}`}
        style={getTestThemeStyle(test.slug)}
        className="overflow-hidden rounded-xl border border-primary/30 bg-card transition hover:shadow-md"
      >
        <div className="bg-primary px-6 py-4">
          <h3 className="font-semibold text-primary-foreground">
            {test.title}
          </h3>
        </div>
        <div className="h-1.5 w-full bg-accent" />
        <div className="p-6">
          <p className="line-clamp-3 text-sm text-muted">
            {test.description}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/tests/${test.slug}`}
      className="rounded-xl border border-card-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
    >
      <h3 className="text-lg font-medium">{test.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">
        {test.description}
      </p>
    </Link>
  );
}

export default async function TestsPage() {
  const supabase = await createClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<Test[]>();

  const groups = groupByLanguage(tests ?? []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Tous les tests
      </h1>
      <p className="mt-2 text-muted">
        Essaie gratuitement les premières questions de chaque test, ou
        débloque-les tous avec l&apos;abonnement.
      </p>

      {groups.length === 0 && (
        <p className="mt-10 text-muted">
          Aucun test disponible pour le moment.
        </p>
      )}

      {groups.map(([language, tests]) => (
        <section key={language} className="mt-12">
          <h2 className="text-lg font-medium text-foreground/80">
            {LANGUAGE_LABELS[language] ?? language}
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {tests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
