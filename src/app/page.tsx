import Link from "next/link";

const AIRLINES = [
  "Air France",
  "HOP",
  "Transavia",
  "Ryanair",
  "easyJet",
  "Eurowings",
  "ENAC",
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
      <section className="sky-gradient border-b border-card-border/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
          <span className="rounded-full border border-card-border bg-card px-3 py-1 text-xs font-medium text-muted">
            Tests sérieux, rapport détaillé, 100% en ligne
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Apprends à te connaître,{" "}
            <span className="text-primary">prépare ta sélection ou ton entretien</span>
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Des tests de personnalité et de jugement situationnel construits
            avec rigueur : choix forcés, contrôles de cohérence, rapport par
            dimension. Utiles pour toi, et pour t&apos;entraîner avant une
            sélection en compagnie aérienne, dans l&apos;armée, ou pour un
            recrutement en grande entreprise.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/tests"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
            >
              Voir les tests
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-card-border px-6 py-3 text-sm font-medium transition hover:border-primary/40"
            >
              Découvrir l&apos;abonnement
            </Link>
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
            <p className="font-medium">Rapport détaillé</p>
            <p className="mt-2 text-sm text-muted">
              Un score par dimension, une tendance, un commentaire, pas
              juste un résultat unique.
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
                href="/tests"
                className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
              >
                Voir les tests orientés aéronautique
              </Link>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-6">
              <p className="text-sm font-medium text-foreground/80">
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
              <p className="text-sm font-medium text-foreground/80">
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
                href="/tests"
                className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
              >
                Voir les tests
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
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
            <p className="mt-1 font-medium">Choisis un test</p>
            <p className="mt-2 text-sm text-muted">
              À l&apos;unité (4,99&nbsp;€) ou en illimité avec
              l&apos;abonnement (9,99&nbsp;€/mois).
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
    </div>
  );
}
