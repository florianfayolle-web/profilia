"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt } from "@/app/actions/assessments";
import { QuizIntro } from "@/components/quiz-intro";
import { QuizLoading } from "@/components/quiz-loading";
import type { DiscAnswer, DiscDefinition } from "@/lib/assessments/types";

type Key = "A" | "B" | "C" | "D";

function fmtMin(ms: number) {
  const m = Math.round(ms / 60000);
  return m <= 1 ? "moins d'une minute" : `environ ${m} min`;
}

export function DiscQuiz({
  testSlug,
  definition,
  hasAccess,
}: {
  testSlug: string;
  definition: DiscDefinition;
  hasAccess: boolean;
}) {
  const router = useRouter();
  const items = definition.items;
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DiscAnswer>>({});
  const [plus, setPlus] = useState<Key | null>(null);
  const [minus, setMinus] = useState<Key | null>(null);
  const [shownAt, setShownAt] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const item = items[step];
  const isLast = step === items.length - 1;

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.plus && a.minus).length,
    [answers]
  );
  const avgTime = useMemo(() => {
    const timed = Object.values(answers).filter((a) => a.plus && a.minus && a.timeMs > 0);
    if (timed.length < 5) return 22000;
    return timed.reduce((s, a) => s + a.timeMs, 0) / timed.length;
  }, [answers]);

  function pick(key: Key, type: "plus" | "minus") {
    if (type === "plus") {
      setPlus((p) => (p === key ? null : key));
      if (minus === key) setMinus(null);
    } else {
      setMinus((m) => (m === key ? null : key));
      if (plus === key) setPlus(null);
    }
  }

  function goNext() {
    if (!plus || !minus) return;
    const timeMs = shownAt ? Math.min(Date.now() - shownAt, 120000) : 0;
    const nextAnswers = { ...answers, [String(item.id)]: { plus, minus, timeMs } };
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
    setPlus(null);
    setMinus(null);
    setShownAt(Date.now());
  }

  function goPrev() {
    if (step === 0) return;
    const prevItem = items[step - 1];
    const prevAnswer = answers[String(prevItem.id)];
    setStep((s) => s - 1);
    setPlus(prevAnswer?.plus ?? null);
    setMinus(prevAnswer?.minus ?? null);
    setShownAt(Date.now());
  }

  if (!started) {
    return (
      <QuizIntro onStart={() => { setStarted(true); setShownAt(Date.now()); }} isPreview={!hasAccess} />
    );
  }

  if (isPending) {
    return <QuizLoading />;
  }

  const remainingMs = avgTime * (items.length - answeredCount);
  const percent = Math.round((answeredCount / items.length) * 100);

  return (
    <div className="mt-6">
      {!hasAccess && (
        <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
          Aperçu gratuit
        </span>
      )}

      <div className="mt-4 flex items-baseline justify-between text-sm text-muted">
        <span>Groupe {step + 1} sur {items.length}</span>
        <span>{answeredCount === items.length ? "Terminé" : `Reste ${fmtMin(remainingMs)}`}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card-border/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div key={step} className="fade-in mt-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Laquelle te ressemble le plus, et le moins ?
        </h2>
        <p className="mt-1 text-muted">
          Un choix « + » et un choix « − », sur deux affirmations différentes.
        </p>

        <div className="mt-6 flex items-center justify-between px-1 text-sm font-medium text-muted-foreground">
          <span>Affirmation</span>
          <span className="flex gap-6 pr-1">
            <span className="w-14 text-center">Le plus</span>
            <span className="w-14 text-center">Le moins</span>
          </span>
        </div>

        <div className="mt-2 space-y-3">
          {item.options.map((opt) => {
            const isPlus = plus === opt.key;
            const isMinus = minus === opt.key;
            return (
              <div
                key={opt.key}
                className={`flex items-center justify-between gap-4 rounded-xl border-2 bg-card p-4 transition ${
                  isPlus
                    ? "border-green-500"
                    : isMinus
                      ? "border-red-500"
                      : "border-card-border"
                }`}
              >
                <span className="font-medium">{opt.text}</span>
                <span className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    aria-pressed={isPlus}
                    onClick={() => pick(opt.key, "plus")}
                    className={`flex h-12 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold transition ${
                      isPlus
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-card-border text-muted-foreground hover:border-green-500/50"
                    }`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    aria-pressed={isMinus}
                    onClick={() => pick(opt.key, "minus")}
                    className={`flex h-12 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold transition ${
                      isMinus
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-card-border text-muted-foreground hover:border-red-500/50"
                    }`}
                  >
                    −
                  </button>
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            className={`text-sm font-medium text-muted-foreground hover:text-foreground ${step === 0 ? "invisible" : ""}`}
          >
            ← Précédent
          </button>
          <button
            type="button"
            disabled={!plus || !minus}
            onClick={goNext}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLast ? "Voir mon résultat" : "Suivant"}
          </button>
        </div>
        {!plus && !minus && (
          <p className="mt-2 text-xs text-muted-foreground">
            Choisis l&apos;affirmation qui te ressemble le plus (+), puis celle qui te ressemble le moins (−).
          </p>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
