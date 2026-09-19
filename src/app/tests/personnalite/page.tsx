import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { type Test } from "@/lib/types";
import { getCategory, getTestCategory } from "@/lib/test-category";
import { groupTestsByLanguage } from "@/lib/group-tests";
import { TestCard } from "@/components/test-card";
import { CategoryHero } from "@/components/category-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const category = getCategory("personnalite")!;

const FAQ = [
  {
    question: "Qu'est-ce qu'un test de personnalité ?",
    answer:
      "Un test de personnalité est un questionnaire structuré qui dresse un profil psychologique sur plusieurs dimensions (mode relationnel, prise de décision, gestion du stress, rapport à l'organisation...), à partir de tes réponses spontanées à des affirmations ou des mises en situation. Il n'évalue pas des connaissances : il n'y a pas de bonne ou de mauvaise réponse, seulement un profil plus ou moins marqué sur chaque dimension.",
  },
  {
    question: "À quoi sert un test de personnalité en ligne ?",
    answer:
      "Deux usages principaux : mieux te connaître (comprendre ton mode de fonctionnement, tes points forts, tes axes de progression), ou t'entraîner avant un entretien de sélection où ce type de test intervient. Nos tests de personnalité en ligne sont conçus pour les deux usages, avec un rapport détaillé par dimension.",
  },
  {
    question: "Le test de personnalité est-il fiable ?",
    answer:
      "Chaque test intègre des contrôles de cohérence internes (questions qui se recoupent sous des formulations différentes) pour repérer des réponses trop hâtives ou incohérentes. Un indice de fiabilité accompagne ton résultat pour t'indiquer à quel point ton profil peut être interprété avec confiance.",
  },
  {
    question: "Combien de temps prend un test de personnalité ?",
    answer:
      "Entre 10 et 30 minutes selon le format et le nombre de questions, indiqué avant de commencer. Réponds de façon spontanée plutôt qu'en réfléchissant trop longtemps à chaque item : c'est ce qui donne le profil le plus fidèle.",
  },
];

export const revalidate = 300;

export const metadata: Metadata = {
  title: category.title,
  description:
    "Passe un test de personnalité en ligne complet et détaillé, pour mieux te connaître : profil psychologique, points forts, axes de progression, rapport par dimension téléchargeable en PDF.",
  alternates: { canonical: "/tests/personnalite" },
};

export default async function PersonnaliteTestsPage() {
  const supabase = createPublicClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .returns<Test[]>();

  const filtered = (tests ?? []).filter(
    (t) => getTestCategory(t.slug) === "personnalite"
  );
  const groups = groupTestsByLanguage(filtered);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Tous les tests", path: "/tests" },
          { name: category.title, path: "/tests/personnalite" },
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
          Faire un test de personnalité pour mieux se connaître
        </h2>
        <div className="mt-6 space-y-6 text-muted">
          <p>
            Un test de personnalité en ligne t&apos;aide à mettre des mots sur
            ton propre fonctionnement : comment tu prends tes décisions,
            comment tu interagis avec les autres, ce qui te motive, ce qui te
            coûte de l&apos;énergie. Contrairement à un test de connaissances,
            il n&apos;y a pas de résultat « bon » ou « mauvais » : chaque
            profil a ses forces et ses points de vigilance.
          </p>
          <p>
            Nos tests de personnalité gratuits (premières questions
            accessibles sans engagement) couvrent plusieurs approches : un
            bilan complet sur 15 dimensions, un test en paires
            d&apos;affirmations opposées pour un profil synthétique, ou une
            typologie en 16 profils cognitifs. Chaque approche éclaire ta
            personnalité sous un angle différent.
          </p>
          <p>
            Le rapport que tu reçois à la fin détaille chaque dimension
            mesurée, avec ton niveau, une explication concrète, tes points
            forts et des pistes pour progresser — téléchargeable en PDF pour
            le garder ou le relire quand tu veux.
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
