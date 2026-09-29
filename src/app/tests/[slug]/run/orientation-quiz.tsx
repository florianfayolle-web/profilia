"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt } from "@/app/actions/assessments";
import { QuizIntro } from "@/components/quiz-intro";
import { AnswerDemo } from "@/components/answer-demo";
import { QuizLoading } from "@/components/quiz-loading";
import type { OrientationDefinition } from "@/lib/assessments/types";

const PART_INFO: Record<
  "interest" | "taste" | "value" | "skill",
  { title: string; subtitle: string; scale: "int" | "gou" | "val" | "com" }
> = {
  interest: {
    title: "Les activités qui vous attirent",
    subtitle: "Sans penser à votre niveau ni à vos notes : est-ce que cette activité vous donne envie ?",
    scale: "int",
  },
  taste: {
    title: "Les sujets qui vous intéressent",
    subtitle: "Indépendamment des métiers : à quel point ce domaine vous attire-t-il ?",
    scale: "gou",
  },
  value: {
    title: "Ce qui compte pour vous",
    subtitle: "Dans un travail, quelle importance donnez-vous à chacun de ces éléments ?",
    scale: "val",
  },
  skill: {
    title: "Ce que vous savez faire",
    subtitle: "Aujourd'hui, honnêtement : à quel point savez-vous faire cela ?",
    scale: "com",
  },
};

export function OrientationQuiz({
  testSlug,
  definition,
  hasAccess,
}: {
  testSlug: string;
  definition: OrientationDefinition;
  hasAccess: boolean;
}) {
  const router = useRouter();
  const items = definition.items;
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const item = items[step];
  const isLast = step === items.length - 1;
  const isFirstOfPart = step === 0 || items[step - 1].part !== item.part;
  const info = PART_INFO[item.part];
  const labels = definition.scaleLabels[info.scale];

  function choose(value: number) {
    if (!item) return;
    const nextAnswers = { ...answers, [String(item.id)]: value };
    setAnswers(nextAnswers);

    if (isLast) {
      setError(null);
      startTransition(async () => {
        const result = await submitAssessmentAttempt(testSlug, nextAnswers);
        if ("error" in result) {
          setError(result.error);
        } else {
          router.push(result.redirectTo);
        }
      });
      return;
    }
    setStep((s) => s + 1);
  }

  function goPrev() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  if (!started) {
    return (
      <QuizIntro
        onStart={() => setStarted(true)}
        isPreview={!hasAccess}
        demo={
          <AnswerDemo
            kind="scale"
            text={items[0].text}
            labels={definition.scaleLabels[PART_INFO[items[0].part].scale]}
            picked={3}
            caption="Une activité ou une situation s'affiche : clique sur le niveau qui dit à quel point elle t'attire ou te ressemble."
          />
        }
      />
    );
  }

  if (isPending) {
    return <QuizLoading />;
  }

  const selected = answers[String(item.id)] ?? null;
  const percent = Math.round(((step + 1) / items.length) * 100);

  return (
    <div className="mt-6">
      {!hasAccess && (
        <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
          Réponses gratuites, résultat payant
        </span>
      )}

      <div className="mt-4 flex items-baseline justify-between text-sm text-muted">
        <span>Question {step + 1} / {items.length}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card-border/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {isFirstOfPart && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-4 fade-in">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Nouvelle partie</p>
            <p className="mt-0.5 text-sm font-semibold">{info.title}</p>
            <p className="mt-1 text-sm text-muted">{info.subtitle}</p>
          </div>
        </div>
      )}

      <div key={step} className="fade-in mt-6">
        <p className="text-xl font-medium leading-snug">{item.text}</p>
        <div className="mt-6 flex items-end justify-between gap-2">
          {labels.map((label, index) => (
            <button
              key={index}
              type="button"
              onClick={() => choose(index + 1)}
              className={`flex flex-1 flex-col items-center gap-2 rounded-xl border px-2 py-3 transition ${
                selected === index + 1
                  ? "border-green-500 bg-green-500/15"
                  : "border-card-border hover:border-primary/40"
              }`}
            >
              <span
                className="rounded-full border-2 border-foreground/70"
                style={{ width: 14 + index * 7, height: 14 + index * 7 }}
              />
              <span className="text-center text-xs leading-tight text-muted">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={goPrev}
            className={`text-sm font-medium text-muted-foreground hover:text-foreground ${step === 0 ? "invisible" : ""}`}
          >
            ← Question précédente
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
