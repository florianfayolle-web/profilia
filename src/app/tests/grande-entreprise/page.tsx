import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { type Test } from "@/lib/types";
import { getCategory, getTestCategory } from "@/lib/test-category";
import { groupTestsByLanguage } from "@/lib/group-tests";
import { TestCard } from "@/components/test-card";
import { CategoryHero } from "@/components/category-hero";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const category = getCategory("grande-entreprise")!;

const FAQ = [
  {
    question:
      "Pourquoi les grandes entreprises utilisent-elles un test de personnalité en recrutement ?",
    answer:
      "En complément de l'entretien, un test de personnalité (souvent modèle DISC, ou un bilan à choix forcé) aide les recruteurs à évaluer des traits comme le leadership, la communication, la rigueur ou l'esprit d'équipe, de façon plus structurée qu'un simple échange oral.",
  },
  {
    question: "Le test DISC de Profilia est-il le test officiel utilisé par les entreprises ?",
    answer:
      "Le modèle DISC (Dominant, Influent, Stable, Conforme) est un cadre de psychologie comportementale largement utilisé et public. Notre test est une création originale inspirée de ce modèle, sans affiliation à une marque commerciale du DISC ni à une entreprise en particulier.",
  },
  {
    question: "Comment bien se préparer à l'entretien après le test ?",
    answer:
      "Relis ton rapport détaillé avant l'entretien : les recruteurs recoupent souvent tes réponses au test avec tes réponses à l'oral. Connaître tes points forts et tes axes de vigilance te permet d'aborder ces questions sans être pris au dépourvu.",
  },
];

export const revalidate = 300;

export const metadata: Metadata = {
  title: category.title,
  description:
    "Tests de personnalité pour préparer un entretien ou un recrutement en grande entreprise : bilan de personnalité complet et test DISC (Dominant, Influent, Stable, Conforme).",
  alternates: { canonical: "/tests/grande-entreprise" },
};

export default async function GrandeEntrepriseTestsPage() {
  const supabase = createPublicClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<Test[]>();

  const filtered = (tests ?? []).filter(
    (t) => getTestCategory(t.slug) === "grande-entreprise"
  );
  const groups = groupTestsByLanguage(filtered);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Tous les tests", path: "/tests" },
          { name: category.title, path: "/tests/grande-entreprise" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />

      <CategoryHero category={category} />

      {groups.length === 0 && (
        <p className="mt-10 text-muted">Aucun test disponible pour le moment.</p>
      )}

      {groups.map(({ language, label, tests }) => (
        <section key={language} className="mt-12">
          <h2 className="text-lg font-medium text-foreground/80">{label}</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {tests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-16 border-t border-card-border/60 pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          Réussir le test de personnalité d&apos;un entretien en grande entreprise
        </h2>
        <div className="mt-6 space-y-6 text-muted">
          <p>
            De nombreux grands groupes (finance, industrie, distribution,
            conseil) intègrent un test de personnalité dans leur processus de
            recrutement, souvent avant l&apos;entretien final. Le modèle DISC
            (Dominant, Influent, Stable, Conforme) est l&apos;un des plus
            répandus : il situe ton profil sur quatre grandes tendances
            comportementales plutôt que de te réduire à un seul trait.
          </p>
          <p>
            Nos tests pour ce contexte couvrent un bilan de personnalité
            complet sur 15 dimensions et un test DISC avec choix forcé
            (« le plus » / « le moins »), roue de positionnement et indice de
            fiabilité détaillé — pour arriver à l&apos;entretien avec une
            vision claire de ton propre profil.
          </p>
          <p>
            Un recrutement précis en tête (LVMH, Société Générale, Thales,
            Airbus...) ? Nos{" "}
            <Link href="/guides" className="text-primary hover:underline">
              guides de préparation
            </Link>{" "}
            détaillent le format utilisé par plusieurs grandes entreprises.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight">
          Questions fréquentes
        </h2>
        <div className="mt-6 space-y-6">
          {FAQ.map((item) => (
            <div key={item.question}>
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-2 text-sm text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
