"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/types";
import { submitAttempt } from "@/app/actions/attempts";
import { ProgressBar } from "@/components/progress-bar";
import { LetterBadge } from "@/components/letter-badge";
import { QuizIntro } from "@/components/quiz-intro";
import { QuizLoading } from "@/components/quiz-loading";

const SELECTION_HIGHLIGHT_MS = 300;

export function Quiz({
  testSlug,
  questions,
  hasAccess,
}: {
  testSlug: string;
  questions: Question[];
  hasAccess: boolean;
}) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; optionId: string }[]
  >([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const question = questions[step];
  const isLast = step === questions.length - 1;

  function selectOption(optionId: string) {
    if (selectedOptionId) return;
    setSelectedOptionId(optionId);

    const nextAnswers = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, optionId },
    ];
    setAnswers(nextAnswers);

    setTimeout(() => {
      if (isLast && !hasAccess) {
        router.push(`/tests/${testSlug}?preview=done`);
        return;
      }
      if (isLast) {
        setError(null);
        startTransition(async () => {
          const result = await submitAttempt(testSlug, nextAnswers);
          if ("error" in result) {
            setError(result.error);
            setSelectedOptionId(null);
          } else {
            router.push(result.redirectTo);
          }
        });
      } else {
        setStep((s) => s + 1);
        setSelectedOptionId(null);
      }
    }, SELECTION_HIGHLIGHT_MS);
  }

  if (!started) {
    return <QuizIntro onStart={() => setStarted(true)} isPreview={!hasAccess} />;
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
      <ProgressBar step={step} total={questions.length} />

      <div key={step} className="fade-in mt-6">
        <h2 className="text-lg font-medium">{question.text}</h2>

        <div className="mt-6 flex flex-col gap-3">
          {question.question_options
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((option, index) => (
              <button
                key={option.id}
                disabled={selectedOptionId !== null}
                onClick={() => selectOption(option.id)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  selectedOptionId === option.id
                    ? "border-green-500 bg-green-500/15"
                    : "border-card-border hover:border-primary/40 hover:shadow-sm disabled:opacity-50"
                }`}
              >
                <LetterBadge index={index}>
                  {String.fromCharCode(65 + index)}
                </LetterBadge>
                {option.text}
              </button>
            ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
