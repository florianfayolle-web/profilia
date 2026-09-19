"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt } from "@/app/actions/assessments";
import { QuizIntro } from "@/components/quiz-intro";
import { QuizLoading } from "@/components/quiz-loading";
import type { PcmAnswer, PcmDefinition } from "@/lib/assessments/types";

export function PcmQuiz({
  testSlug,
  definition,
  hasAccess,
}: {
  testSlug: string;
  definition: PcmDefinition;
  hasAccess: boolean;
}) {
  const router = useRouter();
  const items = definition.items;
  const splitIndex = items.findIndex((it) => it.block === "phase");
  const [started, setStarted] = useState(false);
  const [showInterlude, setShowInterlude] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, PcmAnswer>>({});
  const [shownAt, setShownAt] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const item = items[step];
  const isLast = step === items.length - 1;
  const isEndOfPart1 = splitIndex > 0 && step === splitIndex - 1;
  // A preview slice can contain only "base" items — treat that as one
  // single part instead of showing a bogus "part 2 of length -1".
  const effectiveSplit = splitIndex === -1 ? items.length : splitIndex;

  function choose(value: number) {
    if (!item) return;
    // eslint-disable-next-line react-hooks/purity -- event handler only, never called during render (same pattern as disc-quiz.tsx)
    const timeMs = shownAt ? Math.min(Date.now() - shownAt, 60000) : 0;
    const nextAnswers = { ...answers, [String(item.id)]: { value, timeMs } };
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

    if (isEndOfPart1) {
      setShowInterlude(true);
      return;
    }

    setStep((s) => s + 1);
    // eslint-disable-next-line react-hooks/purity -- event handler only, never called during render
    setShownAt(Date.now());
  }

  function goPrev() {
    if (step === 0) return;
    setStep((s) => s - 1);
    setShownAt(Date.now());
  }

  if (!started) {
    return (
      <QuizIntro
        onStart={() => {
          setStarted(true);
          setShownAt(Date.now());
        }}
        isPreview={!hasAccess}
      />
    );
  }

  if (isPending) {
    return <QuizLoading />;
  }

  if (showInterlude) {
    return (
      <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">
          Partie 2 sur 2
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Maintenant, cette année-ci
        </h2>
        <p className="mt-3 text-muted">
          La première partie parlait de toi depuis toujours. Celle-ci parle
          des douze derniers mois : ne réponds plus « c&apos;est moi en
          général », réponds « c&apos;est moi en ce moment ».
        </p>
        <button
          type="button"
          onClick={() => {
            setShowInterlude(false);
            setStep((s) => s + 1);
            setShownAt(Date.now());
          }}
          className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
        >
          Continuer
        </button>
      </div>
    );
  }

  const part = item.block === "base" ? "Partie 1 · depuis toujours" : "Partie 2 · en ce moment";
  const n = item.block === "base" ? step + 1 : step + 1 - effectiveSplit;
  const total = item.block === "base" ? effectiveSplit : items.length - effectiveSplit;
  const percent = Math.round(((step + 1) / items.length) * 100);

  return (
    <div className="mt-6">
      {!hasAccess && (
        <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
          Aperçu gratuit
        </span>
      )}

      <div className="mt-4 flex items-baseline justify-between text-sm text-muted">
        <span>{part} · {n} / {total}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card-border/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div key={step} className="fade-in mt-6">
        <p className="text-xl font-medium leading-snug">{item.text}</p>

        <div className="mt-6 grid gap-2">
          {definition.scale.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => choose(s.value)}
              className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3 text-left transition hover:border-primary/40 hover:shadow-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-card-border text-xs text-muted-foreground">
                {s.value + 1}
              </span>
              <span className="font-medium">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
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
