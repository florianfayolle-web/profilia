import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { type Test } from "@/lib/types";
import { getCategory, getTestCategory } from "@/lib/test-category";
import { groupTestsByLanguage } from "@/lib/group-tests";
import { TestCard } from "@/components/test-card";
import { CategoryHero } from "@/components/category-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const category = getCategory("qi-sante-mentale")!;

const FAQ = [
  {
    question: "Le test de QI de Profilia donne-t-il un vrai quotient intellectuel ?",
    answer:
      "Non. Un quotient intellectuel certifié suppose un étalonnage sur un large échantillon de population, réalisé par un psychologue avec un outil validé (WAIS, par exemple). Notre test est une création originale de raisonnement (logique, numérique, verbal, spatial) qui donne un score indicatif, pas un QI clinique.",
  },
  {
    question: "Le questionnaire TDAH est-il un diagnostic ?",
    answer:
      "Non, en aucun cas. C'est un questionnaire de repérage inspiré de l'ASRS-6, l'outil que les médecins utilisent eux-mêmes en première intention pour savoir si une évaluation plus poussée est utile. Seul un médecin ou un psychiatre peut poser un diagnostic de TDAH, après un entretien clinique complet.",
  },
  {
    question: "Que faire si mon résultat au repérage TDAH est positif ?",
    answer:
      "En parler à un médecin généraliste ou à un psychiatre : c'est la seule façon d'aller plus loin. Un résultat positif à un questionnaire en ligne ne remplace jamais un avis médical, et un résultat négatif n'exclut rien à lui seul si tu as des doutes.",
  },
];

export const revalidate = 300;

export const metadata: Metadata = {
  title: category.title,
  description:
    "Un test de raisonnement façon QI et un questionnaire de repérage du TDAH inspiré de l'ASRS-6, des outils indicatifs et d'auto-réflexion, jamais un diagnostic médical.",
  alternates: { canonical: "/tests/qi-sante-mentale" },
};

export default async function QiSanteMentalePage() {
  const supabase = createPublicClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<Test[]>();

  const filtered = (tests ?? []).filter((t) => getTestCategory(t.slug) === "qi-sante-mentale");
  const groups = groupTestsByLanguage(filtered);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Tous les tests", path: "/tests" },
          { name: category.title, path: "/tests/qi-sante-mentale" },
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

      <div className="mt-8 rounded-xl border border-card-border bg-card p-5 text-sm text-muted">
        Les tests de cet espace donnent des résultats indicatifs, à visée d&apos;auto-réflexion ou
        d&apos;entraînement. Ils ne remplacent jamais l&apos;avis d&apos;un professionnel de santé
        ou d&apos;un psychologue.
      </div>

      {groups.length === 0 && (
        <p className="mt-10 text-muted">Aucun test disponible pour le moment.</p>
      )}

      {groups.map(({ language, label, tests }) => (
        <section key={language} className="mt-10">
          <h2 className="text-lg font-medium text-foreground/80">{label}</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {tests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-16 border-t border-card-border/60 pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">Questions fréquentes</h2>
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
