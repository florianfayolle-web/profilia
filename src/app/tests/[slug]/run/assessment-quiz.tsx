"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { submitAssessmentAttempt, submitFreeAttempt } from "@/app/actions/assessments";
import { ProgressBar } from "@/components/progress-bar";
import { LetterBadge } from "@/components/letter-badge";
import { QuizIntro } from "@/components/quiz-intro";
import { AnswerDemo } from "@/components/answer-demo";
import { QuizLoading } from "@/components/quiz-loading";
import { EmailGate } from "@/components/email-gate";
import { QiAgeGate } from "@/components/qi-age-gate";
import { TdahAgeGate, TdahChildNotice } from "@/components/tdah-age-gate";
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
  AdhdScreenerDefinition,
  OrientationDefinition,
  PcmDefinition,
  SituationalJudgmentDefinition,
  SosieDefinition,
} from "@/lib/assessments/types";

const SELECTION_HIGHLIGHT_MS = 300;

// Example shown on the intro screen: the test's own first item, laid out
// exactly like the real answer UI, with one answer highlighted. The logic
// test uses an invented item instead so no real question is given away.
function introDemo(
  format: Format,
  definition: Definition,
  lang: "fr" | "en",
  testSlug: string
): ReactNode {
  const fr = lang === "fr";
  switch (format) {
    case "bipolar_pairs": {
      const d = definition as BipolarPairsDefinition;
      const it = d.items[0];
      return (
        <AnswerDemo
          kind="bipolar"
          left={it.left.text}
          right={it.right.text}
          labels={{ left: d.responseScale[0]?.label ?? "", right: d.responseScale[d.responseScale.length - 1]?.label ?? "" }}
          picked={3}
          caption={
            fr
              ? "Chaque question oppose deux affirmations. Clique sur un cercle : plus il est proche d'un côté, plus tu te reconnais dans cette affirmation ; le cercle du milieu veut dire « ni l'un ni l'autre ». Ici, l'exemple penche « plutôt » vers la droite."
              : "Each question sets two statements against each other. Pick a circle: the closer to a side, the more you agree with it; the middle means neither."
          }
        />
      );
    }
    case "forced_choice_quad": {
      const it = (definition as ForcedChoiceQuadDefinition).items[0];
      return (
        <AnswerDemo
          kind="choice"
          options={it.options.map((o) => o.text)}
          picked={0}
          caption={
            fr
              ? "Quatre phrases te sont proposées : clique sur celle qui te ressemble le plus. Il n'y a pas de bonne réponse, seulement la tienne."
              : "Four statements are shown: click the one that is most like you. There is no right answer, only yours."
          }
        />
      );
    }
    case "forced_choice_pair": {
      const it = (definition as ForcedChoicePairDefinition).items[0];
      return (
        <AnswerDemo
          kind="choice"
          options={[it.statementA.text, it.statementB.text]}
          picked={0}
          caption={
            fr
              ? "Deux phrases te sont proposées : clique sur celle qui te correspond le mieux."
              : "Two statements are shown: click the one that fits you best."
          }
        />
      );
    }
    case "situational_judgment": {
      const it = (definition as SituationalJudgmentDefinition).items[0];
      return (
        <AnswerDemo
          kind="choice"
          lead={it.situation}
          options={it.options.map((o) => o.text)}
          picked={1}
          caption={
            fr
              ? "Une situation professionnelle est décrite : clique sur la réaction que tu aurais réellement, pas celle qui « fait bien »."
              : "A work situation is described: click the reaction you would really have, not the one that looks best."
          }
        />
      );
    }
    case "likert_scale": {
      const d = definition as LikertScaleDefinition;
      const sorted = [...d.scale].sort((a, b) => a.value - b.value);
      if (SLIDER_SCALE_SLUGS.has(testSlug)) {
        return (
          <AnswerDemo
            kind="slider"
            text={d.items[0].text}
            leftLabel={sorted[0]?.label ?? ""}
            rightLabel={sorted[sorted.length - 1]?.label ?? ""}
            value={62}
            caption="Une affirmation s'affiche : place le curseur là où tu te situes, de 0 à 100%, puis valide."
          />
        );
      }
      return (
        <AnswerDemo
          kind="scale"
          text={d.items[0].text}
          labels={sorted.map((x) => x.label)}
          faces={EMOJI_SCALE_SLUGS.has(testSlug) ? FACES : undefined}
          picked={3}
          caption={
            fr
              ? "Une affirmation s'affiche : clique sur le niveau qui indique à quel point elle te ressemble, de « pas du tout » à « tout à fait »."
              : "A statement is shown: click the level showing how much it describes you."
          }
        />
      );
    }
    case "logic_mcq":
      return (
        <AnswerDemo
          kind="choice"
          lead="Quel nombre complète la suite ?  2, 4, 8, 16, ?"
          options={["24", "30", "32", "34"]}
          picked={2}
          caption="Exemple inventé : chaque question a une seule bonne réponse. Prends le temps de repérer la règle, mais garde un œil sur le chronomètre."
        />
      );
    case "adhd_screener": {
      const d = definition as AdhdScreenerDefinition;
      if (SLIDER_SCALE_SLUGS.has(testSlug)) {
        return (
          <AnswerDemo
            kind="slider"
            text={d.items[0].text}
            leftLabel={d.scaleLabels[0] ?? ""}
            rightLabel={d.scaleLabels[d.scaleLabels.length - 1] ?? ""}
            value={45}
            caption="Une question porte sur la fréquence d'une situation dans ta vie quotidienne récente : place le curseur entre « jamais » et « très souvent », puis valide."
          />
        );
      }
      return (
        <AnswerDemo
          kind="scale"
          text={d.items[0].text}
          labels={d.scaleLabels}
          picked={2}
          caption="Une question porte sur la fréquence d'une situation dans ta vie quotidienne récente : clique sur le niveau qui te correspond, de « jamais » à « très souvent »."
        />
      );
    }
    default:
      return undefined;
  }
}


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
  | "orientation_riasec"
  | "adhd_screener";

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
  | OrientationDefinition
  | AdhdScreenerDefinition;

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
    case "adhd_screener": {
      const d = definition as AdhdScreenerDefinition;
      // Context items (yes/no) come after the 18 dimension items (slider) —
      // see the isAdhdContextItem check where items are rendered.
      return [...d.items, ...d.contextItems];
    }
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
        needsEmailGate={needsEmailGate}
        autoStart={autoStart}
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
  // The TDAH screener has no child-appropriate item bank (see
  // tdah-age-gate.tsx): a child/teen answer there blocks the quiz entirely
  // rather than handing a minor an unvalidated ADHD screening result. The
  // QI test does have age-banded item sets — qiAgeChoice is "adult" or a
  // childBands key ("6-8" / "9-11" / "12-14").
  const [qiAgeChoice, setQiAgeChoice] = useState<string | null>(null);
  const [tdahAgeChoice, setTdahAgeChoice] = useState<"adult" | "child" | null>(null);
  const qiChildBand =
    testSlug === "qi" && qiAgeChoice && qiAgeChoice !== "adult" ? qiAgeChoice : null;

  const items = useMemo(() => {
    if (qiChildBand) {
      const band = (definition as LogicMcqDefinition).childBands?.[qiChildBand];
      return band?.items ?? [];
    }
    return getItems(format, definition);
  }, [format, definition, qiChildBand]);
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
  // adhd_screener's items array is [...dimension items, ...contextItems]
  // (see getItems above) — anything at/after that split is a yes/no
  // context question, not a frequency slider.
  const isAdhdContextItem =
    format === "adhd_screener" && step >= (definition as AdhdScreenerDefinition).items.length;

  function choose(value: string | number) {
    if (selectedValue !== null) return;
    setSelectedValue(value);

    const nextAnswers = { ...answers, [String(item.id)]: value };
    setAnswers(nextAnswers);

    setTimeout(() => {
      if (isLast && needsEmailGate) {
        setAnswers(nextAnswers);
        setShowEmailGate(true);
        return;
      }
      if (isLast) {
        setError(null);
        startTransition(async () => {
          const result = await submitAssessmentAttempt(testSlug, nextAnswers, qiChildBand);
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

  if (testSlug === "qi" && qiAgeChoice === null) {
    return <QiAgeGate onChoose={setQiAgeChoice} />;
  }

  if (testSlug === "tdah" && tdahAgeChoice === null) {
    return <TdahAgeGate onChoose={setTdahAgeChoice} />;
  }

  if (testSlug === "tdah" && tdahAgeChoice === "child") {
    return <TdahChildNotice onBack={() => setTdahAgeChoice(null)} />;
  }

  if (!started) {
    return (
      <QuizIntro
        onStart={() => setStarted(true)}
        isPreview={!hasAccess}
        questionCount={items.length}
        demo={introDemo(format, definition, lang, testSlug)}
      />
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
        {format === "likert_scale" && SLIDER_SCALE_SLUGS.has(testSlug) && (
          <SliderQuestion
            item={item as LikertScaleDefinition["items"][number]}
            scale={(definition as LikertScaleDefinition).scale}
            onChoose={choose}
            disabled={disabled}
            selectedValue={selectedValue}
          />
        )}
        {format === "likert_scale" && !SLIDER_SCALE_SLUGS.has(testSlug) && (
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
        {format === "adhd_screener" && isAdhdContextItem && (
          <YesNoQuestion
            item={item as { id: number; text: string }}
            onChoose={choose}
            disabled={disabled}
            selectedValue={selectedValue}
          />
        )}
        {format === "adhd_screener" && !isAdhdContextItem && SLIDER_SCALE_SLUGS.has(testSlug) && (
          <SliderQuestion
            item={item as AdhdScreenerDefinition["items"][number]}
            scale={(definition as AdhdScreenerDefinition).scaleLabels.map((label, i, arr) => ({
              label,
              value: Math.round((i / (arr.length - 1)) * 100),
            }))}
            onChoose={choose}
            disabled={disabled}
            selectedValue={selectedValue}
          />
        )}
        {format === "adhd_screener" && !isAdhdContextItem && !SLIDER_SCALE_SLUGS.has(testSlug) && (
          <LikertQuestion
            item={item as AdhdScreenerDefinition["items"][number]}
            scale={(definition as AdhdScreenerDefinition).scaleLabels.map((label, value) => ({ label, value }))}
            onChoose={choose}
            disabled={disabled}
            selectedValue={selectedValue}
            testSlug={testSlug}
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

// HPI reads better as a continuous 0-100 position on a single track than as
// 5 separate boxes — the traits it explores are a matter of degree, and a
// slider makes that degree the whole point instead of forcing a coarse pick.
const SLIDER_SCALE_SLUGS = new Set(["hpi", "tdah"]);

export function SliderQuestion({
  item,
  scale,
  onChoose,
  disabled,
  selectedValue,
}: {
  item: { id: number; text: string };
  scale: LikertScaleDefinition["scale"];
  onChoose: (value: number) => void;
  disabled: boolean;
  selectedValue: string | number | null;
}) {
  const sorted = [...scale].sort((a, b) => a.value - b.value);
  const min = sorted[0]?.value ?? 0;
  const max = sorted[sorted.length - 1]?.value ?? 100;
  const startingValue = typeof selectedValue === "number" ? selectedValue : Math.round((min + max) / 2);
  const [pos, setPos] = useState(startingValue);
  const [touched, setTouched] = useState(selectedValue !== null);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg font-medium">{item.text}</p>

      <div className="rounded-xl border border-card-border bg-card p-5">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-2xl font-bold tabular-nums text-primary">
            {pos}%
          </span>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={pos}
          disabled={disabled}
          onChange={(e) => {
            setPos(Number(e.target.value));
            setTouched(true);
          }}
          className="mt-4 w-full accent-primary disabled:opacity-50"
        />

        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{sorted[0]?.label}</span>
          <span>{sorted[sorted.length - 1]?.label}</span>
        </div>
      </div>

      {touched && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChoose(pos)}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Valider ma réponse →
        </button>
      )}
    </div>
  );
}

function LikertQuestion({
  item,
  scale,
  onChoose,
  disabled,
  selectedValue,
  testSlug,
}: {
  item: { id: number; text: string };
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span className="hidden w-16 shrink-0 text-xs text-muted-foreground sm:block">
          {scale[0]?.label}
        </span>
        <div className="flex w-full justify-between gap-1 sm:flex-1 sm:gap-3">
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
                className={`h-11 w-11 shrink-0 rounded-full border-2 transition disabled:opacity-40 sm:h-10 sm:w-10 ${
                  selected
                    ? "scale-110 border-foreground shadow-md"
                    : "border-transparent hover:scale-105 hover:border-foreground/40"
                }`}
              />
            );
          })}
        </div>
        <span className="hidden w-16 shrink-0 text-right text-xs text-muted-foreground sm:block">
          {scale[scale.length - 1]?.label}
        </span>
        <div className="flex justify-between gap-4 text-xs text-muted-foreground sm:hidden">
          <span>{scale[0]?.label}</span>
          <span className="text-right">{scale[scale.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  );
}

function YesNoQuestion({
  item,
  onChoose,
  disabled,
  selectedValue,
}: {
  item: { id: number; text: string };
  onChoose: (value: number) => void;
  disabled: boolean;
  selectedValue: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg font-medium">{item.text}</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChoose(1)}
          className={`rounded-xl border px-4 py-3 text-center font-semibold transition disabled:opacity-50 ${
            selectedValue === 1
              ? "border-primary bg-primary text-primary-foreground"
              : "border-card-border hover:border-primary/40"
          }`}
        >
          Oui
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChoose(0)}
          className={`rounded-xl border px-4 py-3 text-center font-semibold transition disabled:opacity-50 ${
            selectedValue === 0
              ? "border-primary bg-primary text-primary-foreground"
              : "border-card-border hover:border-primary/40"
          }`}
        >
          Non
        </button>
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
