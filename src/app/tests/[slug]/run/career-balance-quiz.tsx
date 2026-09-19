"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt } from "@/app/actions/assessments";
import { QuizIntro } from "@/components/quiz-intro";
import { QuizLoading } from "@/components/quiz-loading";
import type { CareerBalanceDefinition } from "@/lib/assessments/types";

const LIKERT_LABELS = ["Pas du tout", "Plutôt non", "Mitigé", "Plutôt oui", "Tout à fait"];
const PAIR_LABELS: [string, string][] = [
  ["A", "Surtout"],
  ["A", "Plutôt"],
  ["B", "Plutôt"],
  ["B", "Surtout"],
];

export function CareerBalanceQuiz({
  testSlug,
  definition,
  hasAccess,
}: {
  testSlug: string;
  definition: CareerBalanceDefinition;
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
  const selected = answers[String(item?.id)] ?? null;

  function choose(value: number) {
    if (!item) return;
    const nextAnswers = { ...answers, [String(item.id)]: value };
    setAnswers(nextAnswers);

    if (isLast && !hasAccess) {
      router.push(`/tests/${testSlug}?preview=done`);
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

  if (!started) {
    return (
      <QuizIntro onStart={() => setStarted(true)} isPreview={!hasAccess} />
    );
  }

  if (isPending) {
    return <QuizLoading />;
  }

  return (
    <div className="mt-6">
      {!hasAccess && (
        <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
          Aperçu gratuit
        </span>
      )}

      <div className="mt-4 flex items-baseline justify-between text-sm text-muted">
        <span>Question {step + 1} / {items.length}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card-border/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-300"
          style={{ width: `${Math.round(((step + 1) / items.length) * 100)}%` }}
        />
      </div>

      <div key={step} className="fade-in mt-6">
        {item.kind === "likert" ? (
          <>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              À quel point est-ce vous ?
            </p>
            <p className="text-xl font-medium leading-snug">{item.text}</p>
            <div className="mt-6 flex items-end justify-between gap-2">
              {LIKERT_LABELS.map((label, index) => (
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
                    style={{ width: 18 + index * 8, height: 18 + index * 8 }}
                  />
                  <span className="text-center text-xs leading-tight text-muted">
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
              <span>Pas du tout moi</span>
              <span>Tout à fait moi</span>
            </div>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              De quel côté penchez-vous ?
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className={`rounded-xl border-2 p-4 transition ${
                  selected === 1
                    ? "border-primary bg-primary/10"
                    : selected === 2
                      ? "border-primary/40"
                      : "border-card-border"
                }`}
              >
                <span className="mb-2 inline-block rounded bg-foreground px-2 py-0.5 text-xs font-bold text-background">
                  A
                </span>
                <p>{item.textA}</p>
              </div>
              <div
                className={`rounded-xl border-2 p-4 transition ${
                  selected === 4
                    ? "border-primary bg-primary/10"
                    : selected === 3
                      ? "border-primary/40"
                      : "border-card-border"
                }`}
              >
                <span className="mb-2 inline-block rounded bg-foreground px-2 py-0.5 text-xs font-bold text-background">
                  B
                </span>
                <p>{item.textB}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 overflow-hidden rounded-xl border border-card-border">
              {PAIR_LABELS.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => choose(index + 1)}
                  className={`flex flex-col items-center gap-1 border-r border-card-border px-2 py-3 text-xs font-medium last:border-r-0 transition ${
                    selected === index + 1
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-card-border/40"
                  }`}
                >
                  <span className="text-base font-bold">{label[0]}</span>
                  {label[1]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Pas de position neutre : les deux se défendent, il faut pencher.
            </p>
          </>
        )}

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
