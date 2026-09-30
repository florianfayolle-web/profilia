"use client";

import { useState } from "react";

// Shown before the QI test itself starts: asks adult vs. child/teen, and
// gives a short, honest explanation of what a real WAIS/WISC measures so
// visitors don't confuse our indicative test with a clinical one. Choosing
// "enfant / ado" opens a second screen to pick an age band, each backed by
// its own age-appropriate item bank (childBands in the QI test's
// definition) — never the adult questions, and never turned into an
// IQ-style number (see scoreLogicMcq's childMode / logicBandChild).

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

const CHILD_BANDS: { id: string; label: string; text: string }[] = [
  { id: "6-8", label: "6 à 8 ans", text: "CP, CE1, CE2" },
  { id: "9-11", label: "9 à 11 ans", text: "CM1, CM2, 6e" },
  { id: "12-14", label: "12 à 14 ans", text: "5e, 4e, 3e" },
];

export function QiAgeGate({
  onChoose,
}: {
  onChoose: (choice: string) => void;
}) {
  const [askingBand, setAskingBand] = useState(false);

  if (askingBand) {
    return (
      <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
        <p className="text-lg font-semibold tracking-tight">Quel âge ?</p>
        <p className="mt-3 text-sm text-muted">
          Les questions changent selon l&apos;âge, pour rester à la portée de l&apos;enfant. Le
          résultat est un niveau de raisonnement, pas un chiffre de QI : seul un vrai WISC,
          passé avec un·e psychologue, peut donner un score cliniquement valable pour un enfant.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CHILD_BANDS.map((b) => (
            <button
              key={b.id}
              onClick={() => onChoose(b.id)}
              className="group flex flex-col items-center gap-1 rounded-2xl border-2 border-card-border bg-card px-4 py-5 text-center transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:shadow-md"
            >
              <span className="text-base font-bold text-foreground">{b.label}</span>
              <span className="text-xs text-muted">{b.text}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setAskingBand(false)}
          className="mt-5 rounded-full border border-card-border px-5 py-2.5 text-sm font-medium transition hover:border-primary/40"
        >
          ← Retour
        </button>
      </div>
    );
  }

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
          onClick={() => setAskingBand(true)}
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
          test simplement raccourci. Notre version enfant/ado s&apos;inspire librement de cet
          esprit, avec des questions pensées pour chaque tranche d&apos;âge, mais reste un format
          d&apos;entraînement : le résultat est un niveau de raisonnement, pas un QI.
        </p>
      </div>
    </div>
  );
}
