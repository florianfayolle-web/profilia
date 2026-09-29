"use client";

// Same idea as QiAgeGate: our repérage TDAH questionnaire is built from the
// DSM-5 adult ADHD criteria (self-report) — it was never validated for
// children. The children/teen equivalent (SNAP-IV) uses different items,
// different subscales (inattention, hyperactivité/impulsivité, opposition)
// and a different threshold, and — more importantly — a child's ADHD
// screening should involve a parent/caregiver observation and a
// professional, not a solo online quiz. So a child/teen answer here blocks
// the quiz rather than attempting to reproduce SNAP-IV from a paraphrase.

export function TdahAgeGate({
  onChoose,
}: {
  onChoose: (age: "adult" | "child") => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
      <p className="text-lg font-semibold tracking-tight">Avant de commencer, une précision</p>
      <p className="mt-3 text-sm text-muted">
        Ce questionnaire de repérage s&apos;appuie sur les critères du TDAH de l&apos;adulte
        décrits dans le DSM-5, le manuel de référence en psychiatrie. Dis-nous d&apos;abord pour
        qui il est destiné :
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
        <p className="font-medium text-foreground">Adulte ou enfant : pas le même outil</p>
        <p className="mt-1">
          Chez l&apos;adulte, le repérage s&apos;appuie sur les 18 critères du DSM-5 (attention,
          agitation et impulsivité) complétés de trois critères de contexte. Chez l&apos;enfant et
          l&apos;adolescent, l&apos;échelle de référence est la SNAP-IV : 26 items répartis en
          trois dimensions (inattention, hyperactivité/impulsivité, opposition), notés de 0
          (jamais) à 3 (très souvent), et remplie le plus souvent par un parent ou un enseignant,
          pas par l&apos;enfant lui-même.
        </p>
      </div>
    </div>
  );
}

export function TdahChildNotice({ onBack }: { onBack: () => void }) {
  return (
    <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
      <p className="text-lg font-semibold tracking-tight">Ce questionnaire n&apos;est pas adapté</p>
      <p className="mt-3 text-sm text-muted">
        Notre questionnaire est conçu pour être rempli par un adulte, sur son propre ressenti.
        Chez l&apos;enfant et l&apos;adolescent, le repérage du TDAH utilise un autre outil, la
        SNAP-IV, qui n&apos;est ni le même questionnaire ni la même façon de le remplir :
        c&apos;est en général un parent ou un enseignant qui observe et note le comportement de
        l&apos;enfant au quotidien, pas l&apos;enfant qui répond seul en ligne.
      </p>
      <p className="mt-3 text-sm text-muted">
        Si le comportement ou la concentration d&apos;un enfant t&apos;inquiète, le bon point de
        départ est d&apos;en parler à son pédiatre, au médecin scolaire, ou à un·e
        psychologue/pédopsychiatre : eux seuls peuvent utiliser un outil comme la SNAP-IV dans de
        bonnes conditions et l&apos;interpréter correctement.
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
