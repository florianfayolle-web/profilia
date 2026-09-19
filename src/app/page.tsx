import Link from "next/link";
import Image from "next/image";
import { RadarChart } from "@/components/dimension-charts";

const SAMPLE_PROFILE = [
  { label: "Leadership", value: 0.82 },
  { label: "Communication", value: 0.68 },
  { label: "Rigueur", value: 0.55 },
  { label: "Gestion du stress", value: 0.74 },
  { label: "Esprit d'équipe", value: 0.9 },
  { label: "Adaptabilité", value: 0.61 },
];

const AIRLINES = [
  "Air France",
  "HOP",
  "Transavia",
  "Ryanair",
  "easyJet",
  "Eurowings",
  "ENAC",
];

const FAQ = [
  {
    question: "Qu'est-ce qu'un test de personnalité en ligne ?",
    answer:
      "C'est un questionnaire structuré (choix forcés, mises en situation, échelles d'accord) qui dresse un profil sur plusieurs dimensions psychologiques : mode relationnel, prise de décision, rapport à l'organisation, etc. Il n'y a pas de bonne ou de mauvaise réponse : l'objectif est un profil fidèle, pas une note.",
  },
  {
    question:
      "Les tests SOSIE 2, TD12 ou PSY2 sont-ils les tests officiels utilisés par Air France, HOP ou Transavia ?",
    answer:
      "Non. Profilia est un site indépendant, non affilié à ces compagnies. Nos tests sont des créations originales inspirées des formats connus utilisés dans ce type de sélection (choix forcé, jugement situationnel), pas des reproductions des épreuves propriétaires réelles.",
  },
  {
    question:
      "Comment se préparer à un test de personnalité pour devenir pilote de ligne ?",
    answer:
      "En t'entraînant sur des formats similaires avant le jour J, pour ne pas être surpris par la structure de l'épreuve (choix forcés, contrôles de cohérence, mises en situation), et en connaissant ton propre profil pour préparer un entretien RH cohérent avec tes réponses écrites.",
  },
  {
    question: "Les tests sont-ils gratuits ?",
    answer:
      "Tu peux essayer gratuitement les premières questions de chaque test, sans engagement et sans carte bancaire. Si tu veux aller plus loin, tu débloques ton rapport complet directement depuis le test.",
  },
  {
    question: "Combien de temps dure un test de personnalité ?",
    answer:
      "Selon le format, entre 10 et 30 minutes pour un test complet. Chaque test indique son nombre de questions et son format avant de commencer.",
  },
];

const COMPANIES = [
  "LVMH",
  "Airbus",
  "Thales",
  "Société Générale",
  "TotalEnergies",
  "BNP Paribas",
  "Danone",
  "Sanofi",
  "Orange",
  "L'Oréal",
  "Decathlon",
  "Leclerc",
  "Barilla",
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
      aria-hidden="true"
    >
      <path
        d="M4 10.5l3.5 3.5L16 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
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

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
              5 minutes, gratuit, sans compte
            </span>
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
                  6 à 15 dimensions
                </span>
                <span className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted">
                  Rapport PDF
                </span>
                <span className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted">
                  5-30 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Des tests pensés comme de vrais outils d&apos;évaluation
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted">
          Conçus par des professionnels du recrutement (RH, psychologues et
          chasseurs de tête spécialisés dans le transport aérien et
          travaillant pour de grands groupes du CAC40), pas par une équipe
          marketing : chaque test suit une vraie méthodologie
          d&apos;évaluation.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-card-border bg-card p-6">
            <p className="font-medium">Formats variés</p>
            <p className="mt-2 text-sm text-muted">
              Choix forcé par paires ou quadruplets, jugement situationnel,
              échelle de Likert : chaque format mesure autrement.
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-card p-6">
            <p className="font-medium">Contrôles de cohérence</p>
            <p className="mt-2 text-sm text-muted">
              Des questions de contrôle vérifient la stabilité de tes
              réponses, comme dans un vrai processus d&apos;évaluation.
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-card p-6">
            <p className="font-medium">Rapport détaillé, en PDF</p>
            <p className="mt-2 text-sm text-muted">
              Un score par dimension, une tendance, un commentaire, pas
              juste un résultat unique — téléchargeable en PDF pour le
              relire avant ton entretien.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-primary/30 bg-card p-8 sm:p-10">
          <span className="text-sm font-medium text-primary">
            Pourquoi ce n&apos;est pas qu&apos;un test
          </span>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Connais ton profil avant l&apos;entretien, pas pendant
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Dans un vrai processus de recrutement, l&apos;entretien RH
            s&apos;appuie souvent sur les résultats de ton test de
            personnalité. Si tes réponses à l&apos;oral contredisent
            nettement ton profil écrit, le recruteur le remarque, et ta
            crédibilité en pâtit. Connaître ton profil en amont te permet
            d&apos;arriver préparé, avec des réponses cohérentes, sans te
            laisser piéger par une question qui recoupe le test.
          </p>
          <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>
                Anticipe les questions qui recoupent ton profil écrit
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>Reste cohérent entre le test et l&apos;entretien</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>
                Prépare tes points de vigilance au lieu d&apos;être pris au
                dépourvu
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="border-t border-card-border/60 bg-card/40">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-2 sm:items-center">
            <div>
              <span className="text-sm font-medium text-primary">
                Aéronautique
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Tu prépares une sélection dans l&apos;aérien ?
              </h2>
              <p className="mt-4 text-muted">
                Les entretiens de pilote de ligne, pilote militaire ou
                personnel naviguant commercial (EOPN, ALAT, AOPAN,
                compagnies civiles...) s&apos;appuient souvent sur des tests
                de personnalité et de jugement situationnel. Nos tests
                s&apos;entraînent sur les mêmes formats (choix forcé, mises
                en situation, contrôle de cohérence) pour que le jour J
                n&apos;ait rien d&apos;inconnu.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  <span>
                    Format « choix forcé » identique à celui utilisé pour les
                    sélections pilotes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  <span>
                    Test de jugement situationnel type CRM (communication,
                    décision, gestion de l&apos;urgence)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  <span>
                    Rapport par dimension pour préparer tes entretiens de
                    sélection
                  </span>
                </li>
              </ul>
              <Link
                href="/tests/pilote"
                className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
              >
                Voir les tests pour pilote et personnel navigant
              </Link>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-6">
              <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-lg">
                <div className="relative h-28">
                  <Image
                    src="/images/af-equipage.jpg"
                    alt="Équipage se dirigeant vers l'avion sur le tarmac"
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 200px, 45vw"
                  />
                </div>
                <div className="relative h-28">
                  <Image
                    src="/images/af-avion-vol.jpg"
                    alt="Avion long-courrier en vol"
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 200px, 45vw"
                  />
                </div>
                <div className="relative h-28">
                  <Image
                    src="/images/af-avion-sol.jpg"
                    alt="Avion long-courrier au sol"
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 200px, 45vw"
                  />
                </div>
                <div className="relative h-28">
                  <Image
                    src="/images/transavia-avion.jpg"
                    alt="Avion au décollage"
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 200px, 45vw"
                  />
                </div>
              </div>
              <p className="mt-5 text-sm font-medium text-foreground/80">
                Que tu vises...
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {AIRLINES.map((airline) => (
                  <span
                    key={airline}
                    className="rounded-full border border-card-border px-3 py-1 text-sm text-muted"
                  >
                    {airline}
                  </span>
                ))}
                <span className="rounded-full border border-card-border px-3 py-1 text-sm text-muted">
                  ou une autre compagnie
                </span>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Ce site est indépendant et n&apos;est affilié à aucune de ces
                compagnies ou écoles. Nos tests sont des créations
                originales inspirées de formats connus (SOSIE 2, TD12,
                ADAPT...), pas des reproductions d&apos;épreuves
                propriétaires.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-card-border/60 bg-card/40">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-2 sm:items-center">
            <div className="order-2 rounded-xl border border-card-border bg-card p-6 sm:order-1">
              <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-lg">
                <div className="relative col-span-2 h-40">
                  <Image
                    src="/images/grande-arche.jpg"
                    alt="Quartier d'affaires de la Défense, à Paris"
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 400px, 90vw"
                  />
                </div>
                <div className="relative col-span-2 h-28">
                  <Image
                    src="/images/salle-reunion.jpg"
                    alt="Salle de réunion en entreprise"
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 400px, 90vw"
                  />
                </div>
              </div>
              <p className="mt-5 text-sm font-medium text-foreground/80">
                Que tu vises...
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {COMPANIES.map((company) => (
                  <span
                    key={company}
                    className="rounded-full border border-card-border px-3 py-1 text-sm text-muted"
                  >
                    {company}
                  </span>
                ))}
                <span className="rounded-full border border-card-border px-3 py-1 text-sm text-muted">
                  ou une autre grande entreprise
                </span>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Ce site est indépendant et n&apos;est affilié à aucune de ces
                entreprises. Ces noms ne sont cités qu&apos;à titre
                d&apos;exemple des contextes de recrutement où ce type de
                test est fréquemment utilisé.
              </p>
            </div>
            <div className="order-1 sm:order-2">
              <span className="text-sm font-medium text-primary">
                Grandes entreprises
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Tu prépares un recrutement en grande entreprise ou en
                grand groupe ?
              </h2>
              <p className="mt-4 text-muted">
                De nombreux grands groupes intègrent un test de
                personnalité dans leur processus de recrutement, en
                complément des entretiens. S&apos;entraîner sur un format
                comparable permet d&apos;aborder cette étape sans surprise
                et de mieux te connaître avant l&apos;entretien.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  <span>
                    Formats variés (choix forcé, échelle de Likert) utilisés
                    dans de nombreux processus de recrutement
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  <span>
                    Rapport détaillé par dimension, à revoir avant ton
                    entretien
                  </span>
                </li>
              </ul>
              <Link
                href="/tests/grande-entreprise"
                className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
              >
                Voir les tests pour l&apos;entretien en grande entreprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-card-border/60">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <span className="text-sm font-medium text-primary">
            Juste pour toi
          </span>
          <h2 className="mx-auto mt-2 max-w-2xl text-2xl font-semibold tracking-tight">
            Tu veux simplement passer un test de personnalité pour mieux te
            connaître ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Pas de sélection ni d&apos;entretien en vue : nos tests de
            personnalité fonctionnent aussi comme un outil d&apos;introspection,
            pour comprendre ton mode de fonctionnement, tes points forts et
            tes axes de progression, avec un rapport détaillé par dimension.
          </p>
          <Link
            href="/tests/personnalite"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
          >
            Faire un test de personnalité
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
              Les premières questions sont gratuites, sans engagement ni
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
