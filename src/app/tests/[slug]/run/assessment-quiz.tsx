"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt } from "@/app/actions/assessments";
import { ProgressBar } from "@/components/progress-bar";
import { LetterBadge } from "@/components/letter-badge";
import { QuizIntro } from "@/components/quiz-intro";
import { QuizLoading } from "@/components/quiz-loading";
import type {
  BipolarPairsDefinition,
  ForcedChoicePairDefinition,
  ForcedChoiceQuadDefinition,
  LikertScaleDefinition,
  SituationalJudgmentDefinition,
} from "@/lib/assessments/types";

const SELECTION_HIGHLIGHT_MS = 300;

type Format =
  | "forced_choice_pair"
  | "forced_choice_quad"
  | "situational_judgment"
  | "likert_scale"
  | "bipolar_pairs";

type Definition =
  | ForcedChoicePairDefinition
  | ForcedChoiceQuadDefinition
  | SituationalJudgmentDefinition
  | LikertScaleDefinition
  | BipolarPairsDefinition;

function getItems(format: Format, definition: Definition) {
  switch (format) {
    case "forced_choice_pair":
      return (definition as ForcedChoicePairDefinition).items;
    case "forced_choice_quad":
      return (definition as ForcedChoiceQuadDefinition).items;
    case "situational_judgment":
      return (definition as SituationalJudgmentDefinition).items;
    case "likert_scale":
      return (definition as LikertScaleDefinition).items;
    case "bipolar_pairs":
      return (definition as BipolarPairsDefinition).items;
  }
}

export function AssessmentQuiz({
  testSlug,
  format,
  definition,
  language,
  hasAccess,
}: {
  testSlug: string;
  format: Format;
  definition: Definition;
  language: string;
  hasAccess: boolean;
}) {
  const lang: "fr" | "en" = language === "en" ? "en" : "fr";
  const router = useRouter();
  const items = useMemo(() => getItems(format, definition), [format, definition]);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [selectedValue, setSelectedValue] = useState<string | number | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const item = items[step] as { id: number };
  const isLast = step === items.length - 1;

  function choose(value: string | number) {
    if (selectedValue !== null) return;
    setSelectedValue(value);

    const nextAnswers = { ...answers, [String(item.id)]: value };
    setAnswers(nextAnswers);

    setTimeout(() => {
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
            setSelectedValue(null);
          } else {
            router.push(result.redirectTo);
          }
        });
      } else {
        setStep((s) => s + 1);
        setSelectedValue(null);
      }
    }, SELECTION_HIGHLIGHT_MS);
  }

  const disabled = isPending || selectedValue !== null;

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
      <ProgressBar step={step} total={items.length} />

      <div key={step} className="fade-in mt-6">
        {format === "forced_choice_pair" && (
          <PairQuestion
            item={item as ForcedChoicePairDefinition["items"][number]}
            onChoose={choose}
            disabled={disabled}
            selectedValue={selectedValue}
            lang={lang}
          />
        )}
        {format === "forced_choice_quad" && (
          <QuadQuestion
            item={item as ForcedChoiceQuadDefinition["items"][number]}
            onChoose={choose}
            disabled={disabled}
            selectedValue={selectedValue}
            lang={lang}
          />
        )}
        {format === "situational_judgment" && (
          <JudgmentQuestion
            item={item as SituationalJudgmentDefinition["items"][number]}
            onChoose={choose}
            disabled={disabled}
            selectedValue={selectedValue}
          />
        )}
        {format === "likert_scale" && (
          <LikertQuestion
            item={item as LikertScaleDefinition["items"][number]}
            scale={(definition as LikertScaleDefinition).scale}
            onChoose={choose}
            disabled={disabled}
            selectedValue={selectedValue}
          />
        )}
        {format === "bipolar_pairs" && (
          <BipolarQuestion
            item={item as BipolarPairsDefinition["items"][number]}
            scale={(definition as BipolarPairsDefinition).responseScale}
            onChoose={choose}
            disabled={disabled}
            selectedValue={selectedValue}
          />
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function OptionButton({
  onClick,
  disabled,
  selected,
  index,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  selected: boolean;
  index: number;
  children: ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
        selected
          ? "border-green-500 bg-green-500/15"
          : "border-card-border hover:border-primary/40 hover:shadow-sm disabled:opacity-50"
      }`}
    >
      <LetterBadge index={index}>{String.fromCharCode(65 + index)}</LetterBadge>
      {children}
    </button>
  );
}

function PairQuestion({
  item,
  onChoose,
  disabled,
  selectedValue,
  lang,
}: {
  item: ForcedChoicePairDefinition["items"][number];
  onChoose: (value: string) => void;
  disabled: boolean;
  selectedValue: string | number | null;
  lang: "fr" | "en";
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        {lang === "en"
          ? "Which of these two statements fits you best?"
          : "Laquelle de ces deux phrases te correspond le mieux ?"}
      </p>
      <OptionButton
        index={0}
        disabled={disabled}
        selected={selectedValue === "A"}
        onClick={() => onChoose("A")}
      >
        {item.statementA.text}
      </OptionButton>
      <OptionButton
        index={1}
        disabled={disabled}
        selected={selectedValue === "B"}
        onClick={() => onChoose("B")}
      >
        {item.statementB.text}
      </OptionButton>
    </div>
  );
}

function QuadQuestion({
  item,
  onChoose,
  disabled,
  selectedValue,
  lang,
}: {
  item: ForcedChoiceQuadDefinition["items"][number];
  onChoose: (value: string) => void;
  disabled: boolean;
  selectedValue: string | number | null;
  lang: "fr" | "en";
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        {lang === "en"
          ? "Which of these four statements is most like you?"
          : "Parmi ces quatre phrases, laquelle te ressemble le plus ?"}
      </p>
      {item.options.map((opt, index) => (
        <OptionButton
          key={opt.key}
          index={index}
          disabled={disabled}
          selected={selectedValue === opt.key}
          onClick={() => onChoose(opt.key)}
        >
          {opt.text}
        </OptionButton>
      ))}
    </div>
  );
}

function JudgmentQuestion({
  item,
  onChoose,
  disabled,
  selectedValue,
}: {
  item: SituationalJudgmentDefinition["items"][number];
  onChoose: (value: string) => void;
  disabled: boolean;
  selectedValue: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-xl bg-card-border/30 p-4 font-medium">
        {item.situation}
      </p>
      {item.options.map((opt, index) => (
        <OptionButton
          key={opt.key}
          index={index}
          disabled={disabled}
          selected={selectedValue === opt.key}
          onClick={() => onChoose(opt.key)}
        >
          {opt.text}
        </OptionButton>
      ))}
    </div>
  );
}

const FACES = ["😞", "🙁", "😐", "🙂", "😄"];

function LikertQuestion({
  item,
  scale,
  onChoose,
  disabled,
  selectedValue,
}: {
  item: LikertScaleDefinition["items"][number];
  scale: LikertScaleDefinition["scale"];
  onChoose: (value: number) => void;
  disabled: boolean;
  selectedValue: string | number | null;
}) {
  const sorted = [...scale].sort((a, b) => a.value - b.value);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg font-medium">{item.text}</p>
      <div className="flex items-end justify-between gap-2">
        {sorted.map((step, index) => (
          <button
            key={step.value}
            disabled={disabled}
            onClick={() => onChoose(step.value)}
            className={`flex flex-1 flex-col items-center gap-2 rounded-xl border px-2 py-3 transition ${
              selectedValue === step.value
                ? "border-green-500 bg-green-500/15"
                : "border-card-border hover:border-primary/40 disabled:opacity-50"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {FACES[index] ?? "🙂"}
            </span>
            <span className="text-center text-xs leading-tight text-muted">
              {step.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function BipolarQuestion({
  item,
  scale,
  onChoose,
  disabled,
  selectedValue,
}: {
  item: BipolarPairsDefinition["items"][number];
  scale: BipolarPairsDefinition["responseScale"];
  onChoose: (value: number) => void;
  disabled: boolean;
  selectedValue: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 text-sm">
        <p className="flex-1 rounded-xl bg-card-border/30 p-3">
          {item.left.text}
        </p>
        <p className="flex-1 rounded-xl bg-card-border/30 p-3 text-right">
          {item.right.text}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {scale[0]?.label}
        </span>
        <div className="flex flex-1 justify-between gap-2">
          {scale.map((step) => (
            <button
              key={step.value}
              disabled={disabled}
              title={step.label}
              onClick={() => onChoose(step.value)}
              className={`h-9 w-9 rounded-full border-2 transition ${
                selectedValue === step.value
                  ? "border-green-500 bg-green-500/20"
                  : step.anchor === "neutral"
                    ? "border-card-border bg-card-border/40 hover:border-primary/40 disabled:opacity-50"
                    : "border-card-border bg-gradient-to-r from-primary/20 to-accent/20 hover:border-primary/40 disabled:opacity-50"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {scale[scale.length - 1]?.label}
        </span>
      </div>
    </div>
  );
}
