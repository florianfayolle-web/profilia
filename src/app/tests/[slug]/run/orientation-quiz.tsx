"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt, submitFreeAttempt } from "@/app/actions/assessments";
import { EmailGate } from "@/components/email-gate";
import { QuizIntro } from "@/components/quiz-intro";
import { AnswerDemo } from "@/components/answer-demo";
import { QuizLoading } from "@/components/quiz-loading";
import { SliderQuestion } from "./assessment-quiz";
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
  needsEmailGate = false,
  autoStart = false,
}: {
  testSlug: string;
  definition: OrientationDefinition;
  hasAccess: boolean;
  needsEmailGate?: boolean;
  autoStart?: boolean;
}) {
  const router = useRouter();
  const items = definition.items;
  const [started, setStarted] = useState(autoStart);
  const [showEmailGate, setShowEmailGate] = useState(false);
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

    if (isLast && needsEmailGate) {
      setShowEmailGate(true);
      return;
    }
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

  if (showEmailGate) {
    return (
      <EmailGate
        pending={isPending}
        error={error}
        onSubmit={(email, consent) => {
          setError(null);
          startTransition(async () => {
            const result = await submitFreeAttempt(testSlug, answers, email, consent);
            if ("error" in result) {
              setError(result.error);
            } else {
              router.push(result.redirectTo);
            }
          });
        }}
      />
    );
  }

  if (!started) {
    return (
      <QuizIntro
        onStart={() => setStarted(true)}
        isPreview={!hasAccess}
        questionCount={items.length}
        demo={
          <AnswerDemo
            kind="slider"
            text={items[0].text}
            leftLabel={definition.scaleLabels[PART_INFO[items[0].part].scale][0] ?? ""}
            rightLabel={
              definition.scaleLabels[PART_INFO[items[0].part].scale][
                definition.scaleLabels[PART_INFO[items[0].part].scale].length - 1
              ] ?? ""
            }
            value={68}
            caption="Une activité ou une situation s'affiche : place le curseur là où ça t'attire ou te ressemble, de 0 à 100%, puis valide."
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
        <SliderQuestion
          item={item}
          scale={labels.map((label, index) => ({
            label,
            value: Math.round((index / (labels.length - 1)) * 100),
          }))}
          onChoose={choose}
          disabled={isPending}
          selectedValue={selected}
        />

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
