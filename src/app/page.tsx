import Link from "next/link";
import Image from "next/image";
import { RadarChart } from "@/components/dimension-charts";
import { DiscWheel8Profiles } from "@/components/disc-wheel-8-profiles";
import { IqScale } from "@/components/iq-scale";
import { Illustration, motifForArticle, motifForTest } from "@/components/illustration";
import { createAdminClient } from "@/lib/supabase/admin";
import { GUIDES } from "@/lib/guides";
import type { ArticleRow } from "@/lib/article-types";
import type { Test } from "@/lib/types";
import { CATEGORIES } from "@/lib/test-category";
import { CategoryIcon } from "@/components/category-icon";
import { TestCard } from "@/components/test-card";

// Hourly refresh: keeps the "latest articles" block current without making
// the homepage fully dynamic.
export const revalidate = 3600;

const HOME_GUIDE_SLUGS = [
  "test-personnalite-gratuit",
  "test-hpi",
  "test-reperage-tdah",
  "test-animal-totem",
  "test-qi",
  "test-disc",
];

const SAMPLE_PROFILE = [
  { label: "Leadership", value: 0.82 },
  { label: "Communication", value: 0.68 },
  { label: "Rigueur", value: 0.55 },
  { label: "Gestion du stress", value: 0.74 },
  { label: "Esprit d'équipe", value: 0.9 },
  { label: "Adaptabilité", value: 0.61 },
];

const FLAGSHIP_TEST_SLUGS = ["disc", "qi", "orientation", "tdah", "hpi", "animal-totem"];

const FAQ = [
  {
    question: "Qu'est-ce qu'un test de personnalité en ligne ?",
    answer:
      "C'est un questionnaire structuré (choix forcés, mises en situation, échelles d'accord) qui dresse un profil sur plusieurs dimensions psychologiques : mode relationnel, prise de décision, rapport à l'organisation, etc. Il n'y a pas de bonne ou de mauvaise réponse : l'objectif est un profil fidèle, pas une note.",
  },
  {
    question: "Les tests sont-ils gratuits ?",
    answer:
      "Tu réponds à toutes les questions gratuitement, sans engagement ni carte bancaire. Seul ton rapport complet est payant, à la fin.",
  },
  {
    question: "Combien de temps dure un test ?",
    answer:
      "Entre 5 et 45 minutes selon le format : chaque test indique son nombre de questions avant de commencer, pour que tu saches à quoi t'attendre.",
  },
  {
    question: "Le test de QI de Profilia donne-t-il un vrai quotient intellectuel ?",
    answer:
      "Non. Un quotient intellectuel certifié suppose un étalonnage sur une large population, réalisé par un psychologue avec un outil validé (WAIS). Notre test donne un score indicatif façon QI, sur la même échelle (moyenne 100, écart-type 15), mais ce n'est pas un chiffre clinique.",
  },
  {
    question: "Les questionnaires de repérage (TDAH, HPI) remplacent-ils un diagnostic ?",
    answer:
      "Non, jamais. Ce sont des outils d'auto-réflexion inspirés de critères utilisés par les professionnels de santé (DSM-5 pour le TDAH), pas des instruments diagnostiques. Seul un médecin, un psychiatre ou un psychologue formé peut poser un diagnostic.",
  },
];

export default async function Home() {
  let latest: Pick<ArticleRow, "slug" | "title" | "category" | "meta_description">[] = [];
  try {
    const { data } = await createAdminClient()
      .from("articles")
      .select("slug, title, category, meta_description")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3)
      .returns<Pick<ArticleRow, "slug" | "title" | "category" | "meta_description">[]>();
    latest = data ?? [];
  } catch {
    latest = [];
  }
  const homeGuides = HOME_GUIDE_SLUGS.map((slug) => GUIDES.find((g) => g.slug === slug)).filter(
    (g): g is (typeof GUIDES)[number] => !!g
  );

  let flagshipTests: Test[] = [];
  try {
    const { data } = await createAdminClient()
      .from("tests")
      .select("*")
      .in("slug", FLAGSHIP_TEST_SLUGS)
      .eq("is_active", true)
      .returns<Test[]>();
    const bySlug = new Map((data ?? []).map((t) => [t.slug, t]));
    flagshipTests = FLAGSHIP_TEST_SLUGS.map((slug) => bySlug.get(slug)).filter(
      (t): t is Test => !!t
    );
  } catch {
    flagshipTests = [];
  }

  return (
    <div>
      <section className="sky-gradient relative overflow-hidden border-b border-card-border/60">
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-10 right-[-10%] h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[-15%] left-1/3 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold), transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-40 pt-20 lg:grid-cols-2 lg:pb-48 lg:pt-28">
          <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Découvre{" "}
              <span className="text-primary">qui tu es vraiment</span>, avec
              un vrai rapport détaillé
            </h1>
            <p className="max-w-xl text-lg text-muted">
              Des tests de personnalité sérieux, construits par des
              professionnels du recrutement (psychologues, RH, chasseurs de
              tête de groupes du CAC40) : choix forcés, contrôles de
              cohérence, profil visuel par dimension. Commence par notre
              test express gratuit, puis va plus loin si tu veux.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/tests/big-five-express"
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
              >
                Faire le test de personnalité →
              </Link>
              <Link
                href="/tests"
                className="rounded-full border border-card-border px-6 py-3 text-sm font-medium transition hover:border-primary/40"
              >
                Voir tous les tests
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              *Aucune connexion requise, résultat immédiat.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-card-border bg-card/90 p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Exemple de rapport
                </p>
                <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-700 dark:text-green-400">
                  Fiabilité 92/100
                </span>
              </div>
              <div className="mt-2 flex justify-center">
                <RadarChart data={SAMPLE_PROFILE} size={300} />
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted">
                  4 à 20 dimensions
                </span>
                <span className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted">
                  Rapport PDF
                </span>
                <span className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted">
                  5-45 min
                </span>
              </div>
            </div>

            {/* Two more test formats peeking out from behind the main
                report card, so the hero communicates breadth (DISC, QI…)
                without turning into a carousel or a wall of logos. */}
            <div
              className="absolute -left-12 -top-12 hidden w-52 -rotate-6 rounded-xl border border-card-border bg-card p-3 shadow-lg transition hover:rotate-0 sm:block"
              aria-hidden="true"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Test DISC — 8 profils
              </p>
              <DiscWheel8Profiles className="mt-1 w-full" />
            </div>

            <div
              className="absolute -bottom-32 -right-8 hidden w-64 rotate-6 rounded-xl border border-card-border bg-card p-3 shadow-lg transition hover:rotate-0 sm:block"
              aria-hidden="true"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Test de QI — échelle de Wechsler
              </p>
              <IqScale iqScore={118} compact />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          4 espaces, un objectif à chaque fois différent
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted">
          Raisonnement et repérage, personnalité au sens large, ou préparation ciblée à un
          recrutement (aérien ou grande entreprise) : choisis ton point de départ.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/tests/${cat.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-card-border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="relative flex h-32 items-center justify-center overflow-hidden"
                style={{ background: cat.gradient }}
              >
                <CategoryIcon category={cat.slug} className="h-14 w-14 text-white/90" />
              </div>
              <div className="bg-card p-5">
                <p className="font-semibold">{cat.title}</p>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted">{cat.description}</p>
                <span className="mt-3 inline-block text-sm font-medium text-primary">
                  Voir les tests →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {flagshipTests.length > 0 && (
        <section className="border-t border-card-border/60 bg-card/40">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              Nos tests les plus complets
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted">
              Modèle DISC sur la roue des 8 profils, test de QI sur l&apos;échelle de Wechsler,
              boussole d&apos;orientation RIASEC, repérage TDAH et HPI : un aperçu de ce que
              couvrent nos rapports.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {flagshipTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-6 py-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-pink-600 px-6 py-12 text-center text-white shadow-lg sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-300/20" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-sky-300/20" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            Viens défier tes amis et ta famille
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
            Passe un test, crée un groupe, envoie le lien par WhatsApp, SMS ou email et comparez vos profils côte à
            côte. Qui est le plus Dominant ? Le plus Créatif ? Les contraires s&apos;attirent-ils vraiment ?
            Partage aussi ton résultat sur Instagram.
          </p>
          <Link
            href="/tests"
            className="relative mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow transition hover:bg-white/90"
          >
            Choisir un test à faire ensemble
          </Link>
        </div>
      </section>

      <section id="comment-ca-marche" className="mx-auto max-w-5xl px-6 py-16 scroll-mt-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Comment ça marche
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-primary">1</p>
            <p className="mt-1 font-medium">Crée ton compte</p>
            <p className="mt-2 text-sm text-muted">
              Inscription gratuite en quelques secondes.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-primary">2</p>
            <p className="mt-1 font-medium">Essaie un test gratuitement</p>
            <p className="mt-2 text-sm text-muted">
              Toutes les questions sont gratuites, sans engagement ni
              carte bancaire.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-primary">3</p>
            <p className="mt-1 font-medium">Découvre ton résultat</p>
            <p className="mt-2 text-sm text-muted">
              Un résultat détaillé, à retrouver à tout moment dans ton
              compte.
            </p>
          </div>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Derniers articles</h2>
            <Link href="/blog" className="inline-block py-2.5 text-sm font-medium text-primary hover:underline">
              Tout le blog →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {latest.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="flex flex-col overflow-hidden rounded-xl border border-card-border bg-card transition hover:border-primary/40 hover:shadow-sm"
              >
                <Illustration motif={motifForArticle(article.category, article.slug)} seed={article.slug} className="aspect-[2/1]" />
                <div className="p-5">
                  <h3 className="font-medium leading-snug">{article.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{article.meta_description}</p>
                </div>
              </Link>
            ))}
          </div>

          <h3 className="mt-14 text-lg font-semibold tracking-tight">Guides pour bien se préparer</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="overflow-hidden rounded-xl border border-card-border bg-card transition hover:border-primary/40 hover:shadow-sm"
              >
                <Illustration motif={motifForTest(guide.testSlug)} seed={guide.slug} className="aspect-[2/1]" />
                <p className="p-4 text-sm font-medium leading-snug">{guide.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-card-border/60 bg-card/40">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Questions fréquentes
          </h2>
          <div className="mt-10 space-y-8">
            {FAQ.map((item) => (
              <div key={item.question}>
                <h3 className="font-medium">{item.question}</h3>
                <p className="mt-2 text-sm text-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />

    </div>
  );
}
