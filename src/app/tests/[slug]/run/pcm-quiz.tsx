"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt } from "@/app/actions/assessments";
import { QuizIntro } from "@/components/quiz-intro";
import { AnswerDemo } from "@/components/answer-demo";
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
        questionCount={items.length}
        demo={
          <AnswerDemo
            kind="scale"
            text={items[0].text}
            labels={definition.scale.map((x) => x.label)}
            picked={3}
            caption="Une phrase s'affiche : clique sur le niveau qui indique à quel point elle te ressemble. Une première partie parle de toi depuis toujours, une seconde de cette dernière année."
          />
        }
      />
    );
  }

  if (isPending) {
    return <QuizLoading />;
  }

  if (showInterlude) {
    return (
      <div className="mt-6 overflow-hidden rounded-2xl border p-8 text-center fade-in" style={{ borderColor: "#d9770630", background: "linear-gradient(135deg, #d9770614, transparent)" }}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-sm" style={{ backgroundColor: "#d97706" }}>
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
            <path d="M8 3v4M16 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: "#d9770626", color: "#d97706" }}>
          Étape suivante
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Maintenant, cette année-ci
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          La première partie parlait de toi depuis toujours. Celle-ci parle des douze derniers mois : ne réponds plus « c&apos;est moi en général », réponds « c&apos;est moi en ce moment ».
        </p>
        <button
          type="button"
          onClick={() => {
            setShowInterlude(false);
            setStep((s) => s + 1);
            setShownAt(Date.now());
          }}
          className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
        >
          Continuer →
        </button>
      </div>
    );
  }

  const isBase = item.block === "base";
  const n = isBase ? step + 1 : step + 1 - effectiveSplit;
  const total = isBase ? effectiveSplit : items.length - effectiveSplit;
  const percent = Math.round(((step + 1) / items.length) * 100);

  // The two parts ask fundamentally different questions ("how you've
  // always been" vs. "how you are this year") and answering them with the
  // wrong mindset skews the result — a distinct color + icon per part, not
  // just different label text, makes it hard to miss which one you're in.
  const partColor = isBase ? "#4f46e5" : "#d97706";

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${partColor}1f`, color: partColor }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            {isBase ? (
              <path d="M12 8v4l3 2M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M8 3v4M16 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          {isBase ? "Depuis toujours" : "Cette année"}
        </span>
        <span className="text-sm text-muted">{n} / {total}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card-border/60">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%`, backgroundColor: partColor }}
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
