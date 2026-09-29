"use client";

// Shown before the QI test itself starts: asks adult vs. child/teen, and
// gives a short, honest explanation of what a real WAIS/WISC measures so
// visitors don't confuse our indicative test with a clinical one. A child
// answer never starts the quiz — there is no child-appropriate item bank
// here, and handing a minor an unvalidated "IQ number" is the kind of thing
// only a real WISC administered by a professional should ever do.

const INDICES = [
  {
    name: "Compréhension verbale",
    text: "Vocabulaire, raisonnement à partir de mots et de concepts abstraits.",
  },
  {
    name: "Raisonnement visuo-spatial",
    text: "Manipuler des formes, repérer des relations spatiales et des motifs visuels.",
  },
  {
    name: "Mémoire de travail",
    text: "Retenir et manipuler une information brièvement, le temps de s'en servir.",
  },
  {
    name: "Vitesse de traitement",
    text: "Traiter une information simple rapidement et sans erreur, sous pression du temps.",
  },
];

export function QiAgeGate({
  onChoose,
}: {
  onChoose: (age: "adult" | "child") => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
      <p className="text-lg font-semibold tracking-tight">Avant de commencer, une précision</p>
      <p className="mt-3 text-sm text-muted">
        Ce test est un exercice de raisonnement indicatif, pas un vrai test de QI étalonné.
        Pour bien te situer, dis-nous d&apos;abord pour qui il est destiné :
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={() => onChoose("adult")}
          className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-primary/30 bg-primary/5 px-5 py-6 text-center transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl">
            🧑
          </span>
          <span className="text-base font-bold text-foreground">Je suis adulte</span>
        </button>
        <button
          onClick={() => onChoose("child")}
          className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-card-border bg-card px-5 py-6 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card-border/60 text-2xl">
            🧒
          </span>
          <span className="text-base font-bold text-foreground">C&apos;est pour un enfant / ado</span>
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-card-border bg-background p-4 text-sm text-muted">
        <p className="font-medium text-foreground">Ce qu&apos;un vrai test mesure</p>
        <p className="mt-1">
          Un test de QI clinique comme le WAIS (adultes) évalue en général 4 grands indices :
        </p>
        <ul className="mt-3 space-y-2">
          {INDICES.map((i) => (
            <li key={i.name}>
              <span className="font-medium text-foreground">{i.name}</span> — {i.text}
            </li>
          ))}
        </ul>
        <p className="mt-3">
          Sa version pour enfants et adolescents, le WISC, mesure des indices comparables mais
          avec des exercices et un étalonnage adaptés à l&apos;âge — ce n&apos;est jamais le même
          test simplement raccourci. Notre exercice s&apos;inspire librement de cet esprit, sur
          8 familles de raisonnement, mais reste un format d&apos;entraînement, pas un WAIS.
        </p>
      </div>
    </div>
  );
}

export function QiChildNotice({ onBack }: { onBack: () => void }) {
  return (
    <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
      <p className="text-lg font-semibold tracking-tight">Ce test n&apos;est pas adapté</p>
      <p className="mt-3 text-sm text-muted">
        Nos questions sont conçues pour des adultes (vocabulaire, mises en situation, rythme) :
        les faire passer à un enfant ou un adolescent donnerait un chiffre qui ne veut rien dire,
        pas une vraie estimation.
      </p>
      <p className="mt-3 text-sm text-muted">
        La version pour enfants et adolescents d&apos;un test comme celui-ci s&apos;appelle le
        WISC : elle utilise des exercices, des consignes et un étalonnage spécifiques à l&apos;âge,
        et elle doit être passée avec un·e psychologue formé·e à cet outil, pas en ligne sans
        accompagnement.
      </p>
      <p className="mt-3 text-sm text-muted">
        Si tu t&apos;interroges sur le développement ou les apprentissages d&apos;un enfant, le
        bon point de départ est d&apos;en parler à un·e psychologue scolaire ou un·e
        psychologue spécialisé·e dans le bilan psychométrique de l&apos;enfant.
      </p>
      <button
        onClick={onBack}
        className="mt-5 rounded-full border border-card-border px-5 py-2.5 text-sm font-medium transition hover:border-primary/40"
      >
        ← Retour
      </button>
    </div>
  );
}
