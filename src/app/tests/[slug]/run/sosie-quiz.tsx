"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt } from "@/app/actions/assessments";
import { QuizIntro } from "@/components/quiz-intro";
import { QuizLoading } from "@/components/quiz-loading";
import type { SosieAnswer, SosieDefinition, SosieOptionKey } from "@/lib/assessments/types";

function fmtMin(ms: number) {
  const m = Math.round(ms / 60000);
  return m <= 1 ? "moins d'une minute" : `environ ${m} min`;
}

export function SosieQuiz({
  testSlug,
  definition,
  hasAccess,
}: {
  testSlug: string;
  definition: SosieDefinition;
  hasAccess: boolean;
}) {
  const router = useRouter();
  const items = definition.items;
  const splitIndex = items.findIndex((it) => it.block === "value");
  const effectiveSplit = splitIndex === -1 ? items.length : splitIndex;

  const [started, setStarted] = useState(false);
  const [showInterlude, setShowInterlude] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SosieAnswer>>({});
  const [most, setMost] = useState<SosieOptionKey | null>(null);
  const [least, setLeast] = useState<SosieOptionKey | null>(null);
  const [shownAt, setShownAt] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const item = items[step];
  const isLast = step === items.length - 1;
  const isEndOfPart1 = splitIndex > 0 && step === splitIndex - 1;

  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.most && a.least).length,
    [answers]
  );
  const avgTime = useMemo(() => {
    const timed = Object.values(answers).filter((a) => a.most && a.least && a.timeMs > 0);
    if (timed.length < 5) return 18000;
    return timed.reduce((s, a) => s + a.timeMs, 0) / timed.length;
  }, [answers]);

  function pick(key: SosieOptionKey, type: "most" | "least") {
    if (type === "most") {
      setMost((p) => (p === key ? null : key));
      if (least === key) setLeast(null);
    } else {
      setLeast((m) => (m === key ? null : key));
      if (most === key) setMost(null);
    }
  }

  function goNext() {
    if (!most || !least || !item) return;
    const timeMs = shownAt ? Math.min(Date.now() - shownAt, 120000) : 0;
    const nextAnswers = { ...answers, [String(item.id)]: { most, least, timeMs } };
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
    setMost(null);
    setLeast(null);
    setShownAt(Date.now());
  }

  function goPrev() {
    if (step === 0) return;
    const prevItem = items[step - 1];
    const prevAnswer = answers[String(prevItem.id)];
    setStep((s) => s - 1);
    setMost(prevAnswer?.most ?? null);
    setLeast(prevAnswer?.least ?? null);
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
        <p className="text-sm font-medium text-muted-foreground">Partie 2 sur 2</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Ce qui compte pour toi
        </h2>
        <p className="mt-3 text-muted">
          La première partie explorait ta façon de te comporter. Celle-ci
          explore tes valeurs : pour chaque groupe de trois propositions,
          désigne celle qui est la plus importante pour toi, et celle qui
          l&apos;est le moins.
        </p>
        <button
          type="button"
          onClick={() => {
            setShowInterlude(false);
            setStep((s) => s + 1);
            setMost(null);
            setLeast(null);
            setShownAt(Date.now());
          }}
          className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
        >
          Continuer
        </button>
      </div>
    );
  }

  const remainingMs = avgTime * (items.length - answeredCount);
  const percent = Math.round((answeredCount / items.length) * 100);
  const part =
    item.block === "trait"
      ? `Partie 1 · comportement`
      : "Partie 2 · valeurs";
  const n = item.block === "trait" ? step + 1 : step + 1 - effectiveSplit;
  const total = item.block === "trait" ? effectiveSplit : items.length - effectiveSplit;

  return (
    <div className="mt-6">
      {!hasAccess && (
        <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
          Aperçu gratuit
        </span>
      )}

      <div className="mt-4 flex items-baseline justify-between text-sm text-muted">
        <span>{part} · {n} / {total}</span>
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
          {item.block === "trait"
            ? "Laquelle te correspond le plus, et le moins ?"
            : "Laquelle est la plus importante pour toi, et la moins ?"}
        </h2>
        <p className="mt-1 text-muted">
          Un choix « + » et un choix « − », sur deux propositions différentes.
        </p>

        <div className="mt-6 flex items-center justify-between px-1 text-sm font-medium text-muted-foreground">
          <span>{item.block === "trait" ? "Affirmation" : "Proposition"}</span>
          <span className="flex gap-6 pr-1">
            <span className="w-14 text-center">Le plus</span>
            <span className="w-14 text-center">Le moins</span>
          </span>
        </div>

        <div className="mt-2 space-y-3">
          {item.options.map((opt) => {
            const isMost = most === opt.key;
            const isLeast = least === opt.key;
            return (
              <div
                key={opt.key}
                className={`flex items-center justify-between gap-4 rounded-xl border-2 bg-card p-4 transition ${
                  isMost
                    ? "border-green-500"
                    : isLeast
                      ? "border-red-500"
                      : "border-card-border"
                }`}
              >
                <span className="font-medium">{opt.text}</span>
                <span className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    aria-pressed={isMost}
                    onClick={() => pick(opt.key, "most")}
                    className={`flex h-12 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold transition ${
                      isMost
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-card-border text-muted-foreground hover:border-green-500/50"
                    }`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    aria-pressed={isLeast}
                    onClick={() => pick(opt.key, "least")}
                    className={`flex h-12 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold transition ${
                      isLeast
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
            disabled={!most || !least}
            onClick={goNext}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLast ? "Voir mon résultat" : "Suivant"}
          </button>
        </div>
        {!most && !least && (
          <p className="mt-2 text-xs text-muted-foreground">
            {item.block === "trait"
              ? "Choisis l'affirmation qui te correspond le plus (+), puis celle qui te correspond le moins (−)."
              : "Choisis la proposition la plus importante pour toi (+), puis la moins importante (−)."}
          </p>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
