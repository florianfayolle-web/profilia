import type { Metadata } from "next";
import Link from "next/link";
import { ThreeCirclesTest } from "@/components/three-circles-test";
import { SITE_URL } from "@/lib/site";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

const FAQ = [
  {
    question: "Que mesure ce test ?",
    answer:
      "Il montre comment ton énergie se répartit entre trois cercles : ce que tu contrôles (tes choix, tes efforts, tes réactions), ce que tu peux influencer (dialoguer, écouter, proposer, aider) et ce qui t'échappe (les autres, le passé, les imprévus).",
  },
  {
    question: "Combien de temps dure-t-il et est-il gratuit ?",
    answer:
      "Environ 3 minutes pour 10 scènes du quotidien. Il est entièrement gratuit, sans compte et sans carte bancaire.",
  },
  {
    question: "Mes réponses sont-elles enregistrées ?",
    answer:
      "Non. Le test se déroule dans ton navigateur et rien n'est conservé : tu peux le refaire autant de fois que tu veux.",
  },
  {
    question: "Est-ce un diagnostic psychologique ?",
    answer:
      "Non, c'est un outil de réflexion personnelle. Il ne remplace pas l'avis d'un professionnel de santé ou de l'accompagnement.",
  },
];

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Tous les tests", path: "/tests" },
          { name: "Agir, influencer, accepter", path: "/trois-cercles" },
        ]}
      />
      <ThreeCirclesTest />

      <section className="mx-auto mt-12 max-w-[640px]">
        <h2 className="text-xl font-semibold tracking-tight">
          Les trois cercles : agir, influencer, accepter
        </h2>
        <p className="mt-3 text-muted">
          Beaucoup de fatigue vient d&apos;une énergie dépensée au mauvais endroit. Ce test, fondé sur
          l&apos;idée des trois cercles (contrôle, influence, acceptation), t&apos;aide à repérer où
          part la tienne, au travail, à la maison, en famille ou face à l&apos;actualité.
        </p>
        <h2 className="mt-8 text-xl font-semibold tracking-tight">Questions fréquentes</h2>
        <div className="mt-4 space-y-5">
          {FAQ.map((f) => (
            <div key={f.question}>
              <h3 className="font-medium">{f.question}</h3>
              <p className="mt-1 text-sm text-muted">{f.answer}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          Pour aller plus loin :{" "}
          <Link href="/tests/big-five-express" className="text-primary hover:underline">
            test de personnalité express
          </Link>
          ,{" "}
          <Link href="/tests/disc" className="text-primary hover:underline">
            test DISC
          </Link>{" "}
          ou{" "}
          <Link href="/tests/orientation" className="text-primary hover:underline">
            test d&apos;orientation
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
