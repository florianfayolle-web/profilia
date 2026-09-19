"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt, submitFreeAttempt } from "@/app/actions/assessments";
import { ProgressBar } from "@/components/progress-bar";
import { LetterBadge } from "@/components/letter-badge";
import { QuizIntro } from "@/components/quiz-intro";
import { QuizLoading } from "@/components/quiz-loading";
import { EmailGate } from "@/components/email-gate";
import { DiscQuiz } from "./disc-quiz";
import { PcmQuiz } from "./pcm-quiz";
import { CareerBalanceQuiz } from "./career-balance-quiz";
import { SosieQuiz } from "./sosie-quiz";
import { OrientationQuiz } from "./orientation-quiz";
import type {
  BipolarPairsDefinition,
  CareerBalanceDefinition,
  DiscDefinition,
  ForcedChoicePairDefinition,
  ForcedChoiceQuadDefinition,
  LikertScaleDefinition,
  LogicMcqDefinition,
  OrientationDefinition,
  PcmDefinition,
  SituationalJudgmentDefinition,
  SosieDefinition,
} from "@/lib/assessments/types";

const SELECTION_HIGHLIGHT_MS = 300;

type Format =
  | "forced_choice_pair"
  | "forced_choice_quad"
  | "situational_judgment"
  | "likert_scale"
  | "bipolar_pairs"
  | "disc_quad"
  | "pcm_likert"
  | "logic_mcq"
  | "career_balance"
  | "sosie_v2"
  | "orientation_riasec";

type Definition =
  | ForcedChoicePairDefinition
  | ForcedChoiceQuadDefinition
  | SituationalJudgmentDefinition
  | LikertScaleDefinition
  | BipolarPairsDefinition
  | DiscDefinition
  | PcmDefinition
  | LogicMcqDefinition
  | CareerBalanceDefinition
  | SosieDefinition
  | OrientationDefinition;

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
    case "disc_quad":
      return (definition as DiscDefinition).items;
    case "pcm_likert":
      return (definition as PcmDefinition).items;
    case "logic_mcq":
      return (definition as LogicMcqDefinition).items;
    case "career_balance":
      return (definition as CareerBalanceDefinition).items;
    case "sosie_v2":
      return (definition as SosieDefinition).items;
    case "orientation_riasec":
      return (definition as OrientationDefinition).items;
  }
}

export function AssessmentQuiz({
  testSlug,
  format,
  definition,
  language,
  hasAccess,
  needsEmailGate = false,
  autoStart = false,
}: {
  testSlug: string;
  format: Format;
  definition: Definition;
  language: string;
  hasAccess: boolean;
  needsEmailGate?: boolean;
  autoStart?: boolean;
}) {
  if (format === "disc_quad") {
    return (
      <DiscQuiz
        testSlug={testSlug}
        definition={definition as DiscDefinition}
        hasAccess={hasAccess}
      />
    );
  }

  if (format === "pcm_likert") {
    return (
      <PcmQuiz
        testSlug={testSlug}
        definition={definition as PcmDefinition}
        hasAccess={hasAccess}
      />
    );
  }

  if (format === "career_balance") {
    return (
      <CareerBalanceQuiz
        testSlug={testSlug}
        definition={definition as CareerBalanceDefinition}
        hasAccess={hasAccess}
      />
    );
  }

  if (format === "sosie_v2") {
    return (
      <SosieQuiz
        testSlug={testSlug}
        definition={definition as SosieDefinition}
        hasAccess={hasAccess}
      />
    );
  }

  if (format === "orientation_riasec") {
    return (
      <OrientationQuiz
        testSlug={testSlug}
        definition={definition as OrientationDefinition}
        hasAccess={hasAccess}
      />
    );
  }

  return (
    <GenericAssessmentQuiz
      testSlug={testSlug}
      format={format}
      definition={definition}
      language={language}
      hasAccess={hasAccess}
      needsEmailGate={needsEmailGate}
      autoStart={autoStart}
    />
  );
}

function GenericAssessmentQuiz({
  testSlug,
  format,
  definition,
  language,
  hasAccess,
  needsEmailGate,
  autoStart,
}: {
  testSlug: string;
  format: Exclude<Format, "disc_quad" | "pcm_likert" | "career_balance" | "sosie_v2" | "orientation_riasec">;
  definition: Definition;
  language: string;
  hasAccess: boolean;
  needsEmailGate: boolean;
  autoStart: boolean;
}) {
  const lang: "fr" | "en" = language === "en" ? "en" : "fr";
  const router = useRouter();
  const items = useMemo(() => getItems(format, definition), [format, definition]);
  const [started, setStarted] = useState(autoStart);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [selectedValue, setSelectedValue] = useState<string | number | null>(
    null
  );
  const [showEmailGate, setShowEmailGate] = useState(false);
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
      if (isLast && needsEmailGate) {
        setAnswers(nextAnswers);
        setShowEmailGate(true);
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
            testSlug={testSlug}
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
        {format === "logic_mcq" && (
          <LogicQuestion
            item={item as LogicMcqDefinition["items"][number]}
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

// A neutral, theme-aware intensity indicator (fills left to right) instead
// of mood emoji — a "smiling face" reads oddly on a serious assessment
// (e.g. the militaire-ocean test), and this adapts to each test's own
// primary color automatically instead of needing a per-test icon set.
function IntensityDots({ level, total }: { level: number; total: number }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < level ? "bg-primary" : "bg-card-border"
          }`}
        />
      ))}
    </div>
  );
}

// bp360 is a general, lighter-touch self-assessment — the mood emoji fit
// there. Other likert tests (e.g. militaire-ocean) keep the neutral dots,
// since a smiling face reads oddly on a more serious assessment.
const FACES = ["😞", "🙁", "😐", "🙂", "😄"];
const EMOJI_SCALE_SLUGS = new Set(["bp360"]);

function LikertQuestion({
  item,
  scale,
  onChoose,
  disabled,
  selectedValue,
  testSlug,
}: {
  item: LikertScaleDefinition["items"][number];
  scale: LikertScaleDefinition["scale"];
  onChoose: (value: number) => void;
  disabled: boolean;
  selectedValue: string | number | null;
  testSlug: string;
}) {
  const sorted = [...scale].sort((a, b) => a.value - b.value);
  const useEmoji = EMOJI_SCALE_SLUGS.has(testSlug);

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
            {useEmoji ? (
              <span className="text-2xl">{FACES[index] ?? "🙂"}</span>
            ) : (
              <IntensityDots level={index + 1} total={sorted.length} />
            )}
            <span className="text-center text-xs leading-tight text-muted">
              {step.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// One vivid, fully-opaque color per scale step — indigo for the left pole,
// amber for the right pole, gray for neutral — so the scale reads at a
// glance instead of relying on a pale tinted border to carry the meaning.
// This is a polarity encoding (two poles + a neutral midpoint), not a
// good/bad judgment, so it deliberately avoids a green-to-red ramp: neither
// side of a bipolar_pairs item is the "wrong" answer.
const STEP_COLORS: Record<"left" | "neutral" | "right", string[]> = {
  left: ["#3730a3", "#6366f1", "#a5b4fc"],
  neutral: ["#9ca3af"],
  right: ["#fdba74", "#f97316", "#c2410c"],
};

function stepColor(
  step: BipolarPairsDefinition["responseScale"][number],
  indexInPole: number
): string {
  const palette = STEP_COLORS[step.anchor];
  return palette[Math.min(indexInPole, palette.length - 1)];
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
  // Steps on the same pole are colored from strongest (closest to the
  // extreme) to lightest (closest to neutral), so build the palette
  // left-to-right regardless of how the scale itself is ordered.
  const leftSteps = scale.filter((s) => s.anchor === "left");
  const rightSteps = scale.filter((s) => s.anchor === "right");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 text-sm">
        <p className="flex-1 rounded-xl border border-card-border bg-card p-3 font-medium">
          {item.left.text}
        </p>
        <p className="flex-1 rounded-xl border border-card-border bg-card p-3 text-right font-medium">
          {item.right.text}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="w-16 shrink-0 text-xs text-muted-foreground">
          {scale[0]?.label}
        </span>
        <div className="flex flex-1 justify-between gap-2 sm:gap-3">
          {scale.map((step) => {
            const indexInPole =
              step.anchor === "left"
                ? leftSteps.findIndex((s) => s.value === step.value)
                : step.anchor === "right"
                  ? rightSteps.findIndex((s) => s.value === step.value)
                  : 0;
            const color = stepColor(step, indexInPole);
            const selected = selectedValue === step.value;

            return (
              <button
                key={step.value}
                type="button"
                disabled={disabled}
                title={step.label}
                aria-label={step.label}
                aria-pressed={selected}
                onClick={() => onChoose(step.value)}
                style={{ backgroundColor: color }}
                className={`h-10 w-10 shrink-0 rounded-full border-2 transition disabled:opacity-40 ${
                  selected
                    ? "scale-110 border-foreground shadow-md"
                    : "border-transparent hover:scale-105 hover:border-foreground/40"
                }`}
              />
            );
          })}
        </div>
        <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
          {scale[scale.length - 1]?.label}
        </span>
      </div>
    </div>
  );
}

function LogicQuestion({
  item,
  onChoose,
  disabled,
  selectedValue,
}: {
  item: LogicMcqDefinition["items"][number];
  onChoose: (value: number) => void;
  disabled: boolean;
  selectedValue: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium leading-snug">{item.question}</p>
      {item.series && (
        <p className="text-center text-xl font-semibold tracking-wide">
          {item.series}
        </p>
      )}
      {item.figure && (
        <div className="flex justify-center py-2 text-foreground [&_svg]:h-28 [&_svg]:w-28">
          <div dangerouslySetInnerHTML={{ __html: item.figure }} />
        </div>
      )}
      <ul
        className={
          item.grid
            ? "grid grid-cols-2 gap-3 sm:grid-cols-4"
            : "flex flex-col gap-2"
        }
      >
        {item.options.map((opt, index) => {
          const selected = selectedValue === index;
          return (
            <li key={index}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChoose(index)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  item.grid ? "flex-col items-center gap-2" : ""
                } ${
                  selected
                    ? "border-green-500 bg-green-500/15"
                    : "border-card-border hover:border-primary/40 hover:shadow-sm disabled:opacity-50"
                }`}
              >
                <LetterBadge index={index}>
                  {String.fromCharCode(65 + index)}
                </LetterBadge>
                {opt.svg ? (
                  <div
                    className="text-foreground [&_svg]:h-20 [&_svg]:w-20"
                    dangerouslySetInnerHTML={{ __html: opt.svg }}
                  />
                ) : (
                  <span className="font-medium">{opt.text}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
