import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { type Test } from "@/lib/types";
import { getCategory, getTestCategory } from "@/lib/test-category";
import { groupTestsByLanguage } from "@/lib/group-tests";
import { TestCard } from "@/components/test-card";
import { CategoryHero } from "@/components/category-hero";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const category = getCategory("pilote")!;

const FAQ = [
  {
    question:
      "Pourquoi les sélections de pilote et de personnel navigant incluent-elles un test de personnalité ?",
    answer:
      "Les compagnies aériennes et l'armée évaluent des traits difficiles à mesurer en entretien seul : gestion du stress, rigueur procédurale, esprit d'équipe (CRM), prise de décision sous pression. Le test de personnalité complète l'entretien, et un test de jugement situationnel évalue directement tes réactions face à des scénarios réalistes.",
  },
  {
    question: "Ces tests sont-ils identiques aux tests officiels (SOSIE 2, TD12, PSY2, ADAPT) ?",
    answer:
      "Non. Profilia est indépendant et n'est affilié à aucune compagnie aérienne, école ou organisme de sélection. Nos tests sont des créations originales inspirées de ces formats connus, pour t'entraîner sur leur structure (choix forcé, jugement situationnel, contrôle de cohérence), pas des reproductions des épreuves propriétaires.",
  },
  {
    question: "Comment se préparer efficacement à ces tests ?",
    answer:
      "En t'entraînant sur le format avant le jour J pour ne pas être déstabilisé par sa structure, et en connaissant ton profil pour préparer un entretien cohérent avec tes réponses écrites — les recruteurs recoupent souvent les deux.",
  },
];

export const revalidate = 300;

export const metadata: Metadata = {
  title: category.title,
  description:
    "Tests de personnalité et de jugement situationnel pour préparer une sélection de pilote de ligne, pilote militaire ou personnel naviguant commercial : formats SOSIE 2, TD12, ADAPT, OCEAN.",
  alternates: { canonical: "/tests/pilote" },
};

export default async function PiloteTestsPage() {
  const supabase = createPublicClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<Test[]>();

  const filtered = (tests ?? []).filter((t) => getTestCategory(t.slug) === "pilote");
  const groups = groupTestsByLanguage(filtered);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Tous les tests", path: "/tests" },
          { name: category.title, path: "/tests/pilote" },
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
          Se préparer aux tests de personnalité pilote et PNC
        </h2>
        <div className="mt-6 space-y-6 text-muted">
          <p>
            Les processus de sélection pour devenir pilote de ligne, pilote
            militaire (EOPN, ALAT, AOPAN) ou personnel navigant commercial
            reposent presque toujours sur un inventaire de personnalité, et
            souvent sur un test de jugement situationnel évaluant tes
            réactions face à des scénarios réalistes (gestion d&apos;un
            conflit d&apos;équipage, décision en situation d&apos;urgence,
            communication sous pression).
          </p>
          <p>
            Nos tests reprennent les formats les plus utilisés dans ce type
            de sélection : choix forcé par paires ou quadruplets, jugement
            situationnel noté, échelle d&apos;accord de type Big Five (OCEAN).
            Chacun intègre des questions de contrôle qui vérifient la
            cohérence de tes réponses, exactement comme un vrai processus
            d&apos;évaluation.
          </p>
          <p>
            Envie de détails sur le déroulement d&apos;une sélection précise
            (Air France, ENAC EPL, Ryanair, easyJet, sélection militaire) ?
            Consulte nos{" "}
            <Link href="/guides" className="text-primary hover:underline">
              guides de préparation
            </Link>
            , qui détaillent le format attendu compagnie par compagnie.
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
