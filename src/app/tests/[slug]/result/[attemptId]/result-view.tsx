import type { TestFormat } from "@/lib/types";
import type {
  scoreBipolarPairs,
  scoreCareerBalance,
  scoreDisc,
  scoreForcedChoicePair,
  scoreForcedChoiceQuad,
  scoreLikertScale,
  scoreLogicMcq,
  scoreOrientation,
  scorePcm,
  scoreSituationalJudgment,
  scoreSosie,
} from "@/lib/assessments/scoring";
import { OrientationResult } from "./orientation-result";
import {
  ChartLegend,
  ProfileLineChart,
  RadarChart,
  type ChartPoint,
} from "@/components/dimension-charts";
import { DISC_COLORS, DiscWheel } from "@/components/disc-wheel";
import { BalanceScale } from "@/components/balance-scale";
import type { PcmKey } from "@/lib/assessments/types";

type BandedResult = ReturnType<
  typeof scoreForcedChoicePair | typeof scoreForcedChoiceQuad
>;
type JudgmentResult = ReturnType<typeof scoreSituationalJudgment>;
type LikertResult = ReturnType<typeof scoreLikertScale>;
type BipolarResult = ReturnType<typeof scoreBipolarPairs>;
type DiscResult = ReturnType<typeof scoreDisc>;
type PcmResult = ReturnType<typeof scorePcm>;
type LogicMcqResult = ReturnType<typeof scoreLogicMcq>;
type CareerBalanceResult = ReturnType<typeof scoreCareerBalance>;
type SosieResult = ReturnType<typeof scoreSosie>;
type OrientationResultType = ReturnType<typeof scoreOrientation>;
type ReliabilityShape = {
  index: number;
  label: string;
  text: string;
  indicators: { tier: "good" | "warn" | "bad"; title: string; text: string }[];
  contradictions: unknown[];
};

// Matches the source design's own palette (one hue per style), so the
// report stays visually consistent with the widget this content came from.
const PCM_COLORS: Record<PcmKey, string> = {
  emp: "#D9345F",
  tra: "#1F5FCB",
  per: "#6B3FA0",
  rev: "#1F7F78",
  reb: "#B87503",
  pro: "#CE3418",
};

const TIER_COLOR: Record<"good" | "warn" | "bad", string> = {
  good: "bg-green-500",
  warn: "bg-amber-500",
  bad: "bg-red-500",
};
const GAUGE_COLOR: Record<"good" | "warn" | "bad", string> = {
  good: "text-green-600 dark:text-green-400",
  warn: "text-amber-600 dark:text-amber-400",
  bad: "text-red-600 dark:text-red-400",
};

function DiscReliabilityCard({
  reliability,
}: {
  reliability: ReliabilityShape;
}) {
  const tier: "good" | "warn" | "bad" =
    reliability.index >= 70 ? "good" : reliability.index >= 45 ? "warn" : "bad";

  return (
    <div className="mt-10 rounded-xl border border-card-border bg-card p-6">
      <div className="flex items-baseline gap-6">
        <p className={`text-5xl font-extrabold tabular-nums ${GAUGE_COLOR[tier]}`}>
          {reliability.index}
          <span className="text-lg font-medium text-muted-foreground">/100</span>
        </p>
        <div>
          <p className="text-lg font-semibold">Fiabilité : {reliability.label}</p>
          <p className="mt-1 text-sm text-muted">{reliability.text}</p>
        </div>
      </div>
      <div className="mt-6 divide-y divide-card-border">
        {reliability.indicators.map((ind, i) => (
          <div key={i} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${TIER_COLOR[ind.tier]}`} />
            <div>
              <p className="font-semibold">{ind.title}</p>
              <p className="mt-1 text-sm text-muted">{ind.text}</p>
            </div>
          </div>
        ))}
      </div>
      {reliability.contradictions.length > 0 && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium text-muted-foreground">
            Voir les {reliability.contradictions.length} contradiction
            {reliability.contradictions.length > 1 ? "s" : ""}
          </summary>
          <div className="mt-3 space-y-2">
            {(
              reliability.contradictions as { textPlus: string; textMinus: string }[]
            ).map((c, i) => (
              <p key={i} className="text-muted">
                « {c.textPlus} » mais « {c.textMinus} »
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function percent(n: number) {
  return `${Math.round(n * 100)}%`;
}

function ChartsBlock({
  data,
  bandThresholds,
}: {
  data: ChartPoint[];
  bandThresholds?: { lowBelow: number; midUpTo: number };
}) {
  if (data.length < 3) return null;

  return (
    <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
      <div className="flex justify-center">
        <RadarChart data={data} />
      </div>
      <div className="mt-8">
        <p className="mb-3 text-center text-xs font-medium text-muted-foreground">
          Le même profil, lu de gauche à droite
        </p>
        <ProfileLineChart data={data} />
      </div>
      {bandThresholds && <ChartLegend bandThresholds={bandThresholds} />}
    </div>
  );
}

function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-card-border/60">
      <div
        className={color ? "h-full rounded-full" : "h-full rounded-full bg-gradient-to-r from-primary to-accent"}
        style={{
          width: `${Math.max(0, Math.min(1, value)) * 100}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </div>
  );
}

// Faible/Modéré/Fiable maps directly to red/amber/green, matching the same
// thresholds scoring.ts used to pick the label text — so the color is
// never out of sync with the words.
function consistencyColor(consistency: number | null) {
  if (consistency === null) {
    return { text: "text-muted-foreground", bg: "bg-card-border/50", dot: "bg-muted-foreground" };
  }
  if (consistency >= 0.8) {
    return { text: "text-green-700 dark:text-green-400", bg: "bg-green-500/10", dot: "bg-green-500" };
  }
  if (consistency >= 0.6) {
    return { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-500" };
  }
  return { text: "text-red-700 dark:text-red-400", bg: "bg-red-500/10", dot: "bg-red-500" };
}

function ReliabilityCard({
  consistency,
  consistencyLabel,
  flagged,
  flagText,
  lang,
}: {
  consistency: number | null;
  consistencyLabel: string;
  flagged: boolean;
  flagText: string;
  lang: "fr" | "en";
}) {
  const color = consistencyColor(consistency);
  return (
    <div className="mt-10 rounded-lg border border-card-border bg-card p-4 text-sm">
      <p className="font-medium">
        {lang === "en" ? "Response reliability" : "Fiabilité des réponses"}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-muted">
          {lang === "en" ? "Consistency:" : "Cohérence :"}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${color.bg} ${color.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
          {consistencyLabel}
        </span>
      </div>
      {flagged && <p className="mt-2 text-amber-600 dark:text-amber-400">{flagText}</p>}
    </div>
  );
}

function DimensionBars({
  dims,
}: {
  dims: { code: string; label: string; description: string; scorePercent: number }[];
}) {
  return (
  <div className="space-y-5">
    {dims.map((d) => (
      <div key={d.code}>
        <div className="flex items-center justify-between text-sm font-medium">
          <span>{d.label}</span>
          <span className="text-muted-foreground">{percent(d.scorePercent)}</span>
        </div>
        <div className="mt-1">
          <Bar value={d.scorePercent} />
        </div>
        <p className="mt-1 text-xs text-muted">{d.description}</p>
      </div>
    ))}
  </div>
);
}

export function ResultView({
  format,
  result,
  language,
}: {
  format: TestFormat;
  result: unknown;
  language: string;
}) {
  const lang: "fr" | "en" = language === "en" ? "en" : "fr";

  if (format === "forced_choice_pair" || format === "forced_choice_quad") {
    const r = result as BandedResult;
    return (
      <div className="text-left">
        <p className="text-center text-muted">{r.narrativeReport.summary}</p>
        <ChartsBlock
          data={r.dimensionResults.map((d) => ({
            label: d.label,
            value: d.scorePercent,
          }))}
          bandThresholds={r.narrativeReport.bandThresholds}
        />
        <div className="mt-8 space-y-6">
          {r.narrativeReport.dimensions.map((d) => (
            <div key={d.code}>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{d.label}</span>
                <span className="text-muted-foreground">{percent(d.scorePercent)}</span>
              </div>
              <div className="mt-1">
                <Bar value={d.scorePercent} />
              </div>
              <p className="mt-2 text-sm text-muted">{d.text}</p>
            </div>
          ))}
        </div>
        <ReliabilityCard
          consistency={r.consistency}
          consistencyLabel={r.consistencyLabel}
          flagged={
            format === "forced_choice_pair"
              ? (r as ReturnType<typeof scoreForcedChoicePair>).responsePatternFlag
              : (r as ReturnType<typeof scoreForcedChoiceQuad>).positionBiasFlag
          }
          flagText={
            lang === "en"
              ? "Under-differentiated answers detected. Interpret this result with caution."
              : "Réponses peu différenciées détectées. Le résultat est à interpréter avec prudence."
          }
          lang={lang}
        />
      </div>
    );
  }

  if (format === "situational_judgment") {
    const r = result as JudgmentResult;
    return (
      <div className="text-left">
        <p className="text-center text-2xl font-semibold">
          {lang === "en" ? "Overall score: " : "Score global : "}
          {percent(r.overallPercent)}
        </p>
        <p className="mt-2 text-center text-muted">{r.narrativeReport.summary}</p>
        <ChartsBlock
          data={r.dimensionResults.map((d) => ({
            label: d.label,
            value: d.scorePercent,
          }))}
          bandThresholds={r.narrativeReport.bandThresholds}
        />
        <div className="mt-8 space-y-6">
          {r.narrativeReport.dimensions.map((d) => (
            <div key={d.code}>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{d.label}</span>
                <span className="text-muted-foreground">{percent(d.scorePercent)}</span>
              </div>
              <div className="mt-1">
                <Bar value={d.scorePercent} />
              </div>
              <p className="mt-2 text-sm text-muted">{d.text}</p>
            </div>
          ))}
        </div>
        <ReliabilityCard
          consistency={r.consistency}
          consistencyLabel={r.consistencyLabel}
          flagged={r.socialDesirabilityFlag}
          flagText={
            lang === "en"
              ? "A tendency to always pick the \"expected\" answer was detected. Interpret this result with caution."
              : "Tendance à toujours choisir la réponse « attendue » détectée. Le résultat est à interpréter avec prudence."
          }
          lang={lang}
        />
      </div>
    );
  }

  if (format === "likert_scale") {
    const r = result as LikertResult;
    return (
      <div className="text-left">
        {r.dominantProfile && (
          <div className="rounded-lg border border-card-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">Profil dominant</p>
            <p className="mt-1 text-xl font-semibold">{r.dominantProfile.name}</p>
            <p className="mt-2 text-sm text-muted">
              {r.dominantProfile.description}
            </p>
          </div>
        )}
        <ChartsBlock
          data={r.dimensionResults.map((d) => ({
            label: d.name,
            value: d.scorePercent,
          }))}
          bandThresholds={r.narrativeReport?.bandThresholds}
        />
        {r.narrativeReport && (
          <p className="mt-6 text-center text-muted">
            {r.narrativeReport.summary}
          </p>
        )}
        <div className="mt-8 space-y-6">
          {r.dimensionResults.map((d, i) => {
            const nd = r.narrativeReport?.dimensions[i];
            return (
              <div key={d.key}>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{d.name}</span>
                  <span className="text-muted-foreground">{d.level}</span>
                </div>
                <div className="mt-1">
                  <Bar value={d.scorePercent} />
                </div>
                {nd && (
                  <>
                    <p className="mt-2 text-sm text-muted">{nd.text}</p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Points forts : </span>
                      <span className="text-muted">{nd.strengths}</span>
                    </p>
                    <p className="mt-1 text-sm">
                      <span className="font-medium">À travailler : </span>
                      <span className="text-muted">{nd.tips}</span>
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (format === "disc_quad") {
    const r = result as DiscResult;
    const scores = Object.fromEntries(
      r.dimensionResults.map((d) => [d.code, d.scorePercent])
    ) as { D: number; I: number; S: number; C: number };
    return (
      <div className="text-left">
        <div className="rounded-xl border border-card-border bg-card p-6">
          <DiscWheel scores={scores} />
        </div>
        <div className="mt-6 text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {r.tag}
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{r.title}</h2>
          <p className="mt-3 text-muted">{r.summary}</p>
        </div>
        <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
          <p className="text-lg font-semibold">Tes scores par style</p>
          <div className="mt-4 space-y-4">
            {r.dimensionResults.map((d) => (
              <div key={d.code} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-sm font-medium">{d.label}</span>
                <Bar value={d.scorePercent} color={DISC_COLORS[d.code]} />
                <span className="w-12 shrink-0 text-right text-sm font-semibold">
                  {percent(d.scorePercent)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {r.dimensionResults.map((d) => (
            <div key={d.code}>
              <p
                className="text-base font-semibold"
                style={{ color: DISC_COLORS[d.code] }}
              >
                {d.label}
              </p>
              <p className="mt-1 text-sm">
                <span className="font-medium">Points forts : </span>
                <span className="text-muted">{d.strengths}</span>
              </p>
              <p className="mt-1 text-sm">
                <span className="font-medium">Environnements adaptés : </span>
                <span className="text-muted">{d.suitableWork}</span>
              </p>
              <p className="mt-1 text-sm">
                <span className="font-medium">À travailler : </span>
                <span className="text-muted">{d.tips}</span>
              </p>
            </div>
          ))}
        </div>
        <DiscReliabilityCard reliability={r.reliability} />
      </div>
    );
  }

  if (format === "pcm_likert") {
    const r = result as PcmResult;
    const sorted = [...r.dimensionResults].sort(
      (a, b) => b.basePercent - a.basePercent
    );

    return (
      <div className="text-left">
        <p className="text-center text-muted">{r.summary}</p>

        <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
          <p className="text-lg font-semibold">Ton profil, du plus au moins présent</p>
          <div className="mt-4 space-y-4">
            {sorted.map((d, i) => (
              <div key={d.code} className="flex items-center gap-4">
                <span className="w-28 shrink-0 text-sm font-medium">
                  {d.label}
                  {i === 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (base)
                    </span>
                  )}
                  {d.code === r.phaseKey && d.code !== sorted[0].code && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (phase)
                    </span>
                  )}
                </span>
                <Bar value={d.basePercent} color={PCM_COLORS[d.code]} />
                <span className="w-12 shrink-0 text-right text-sm font-semibold">
                  {percent(d.basePercent)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-8 rounded-xl border-t-2 bg-card p-6"
          style={{ borderTopColor: PCM_COLORS[r.baseKey] }}
        >
          <p className="text-sm text-muted-foreground">Ta base</p>
          <h2 className="mt-1 text-2xl font-semibold" style={{ color: PCM_COLORS[r.baseKey] }}>
            {r.baseType.name}
          </h2>
          <p className="mt-2 text-sm italic text-muted">« {r.baseType.citation} »</p>
          <p className="mt-3 text-sm text-muted">{r.baseType.perception}</p>
          <div className="mt-4 space-y-3 text-sm">
            <p>
              <span className="font-medium">Ta vie de tous les jours : </span>
              <span className="text-muted">{r.baseType.quotidien}</span>
            </p>
            <p>
              <span className="font-medium">Ce que tu fais mieux que les autres : </span>
              <span className="text-muted">{r.baseType.talents}</span>
            </p>
            <p>
              <span className="font-medium">Ce qui te recharge : </span>
              <span className="text-muted">{r.baseType.besoin}</span>
            </p>
            <p>
              <span className="font-medium">Ta façon de craquer : </span>
              <span className="text-muted">{r.baseType.stress}</span>
            </p>
            <p>
              <span className="font-medium">Ce qui t&apos;aide : </span>
              <span className="text-muted">{r.baseType.aide}</span>
            </p>
          </div>
        </div>

        <div
          className="mt-8 rounded-xl border-t-2 bg-card p-6"
          style={{ borderTopColor: PCM_COLORS[r.phaseKey] }}
        >
          <p className="text-sm text-muted-foreground">
            {r.same ? "Ta phase — tu restes sur ta base" : "Ta phase — où tu vis en ce moment"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold" style={{ color: PCM_COLORS[r.phaseKey] }}>
            {r.phaseType.name}
          </h2>
          <p className="mt-3 text-sm text-muted">
            {r.same
              ? "Ta phase et ta base coïncident : ce qui te ressemble est aussi ce qui te nourrit en ce moment."
              : `Tu continues de percevoir le monde en ${r.baseType.name}, mais depuis un moment, ce sont les besoins du profil ${r.phaseType.name} qui commandent.`}
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <p>
              <span className="font-medium">Ce dont tu as besoin en ce moment : </span>
              <span className="text-muted">{r.phaseInfo.besoin}</span>
            </p>
            <p>
              <span className="font-medium">Quand ce besoin n&apos;est pas nourri : </span>
              <span className="text-muted">{r.phaseInfo.signal}</span>
            </p>
            <p>
              <span className="font-medium">Ce que tu peux demander : </span>
              <span className="text-muted">{r.phaseInfo.demande}</span>
            </p>
          </div>
        </div>

        <DiscReliabilityCard reliability={r.reliability} />
      </div>
    );
  }

  if (format === "logic_mcq") {
    const r = result as LogicMcqResult;
    return (
      <div className="text-left">
        <p className="text-center text-2xl font-semibold">
          Score global : {r.score}
          <span className="text-lg font-medium text-muted-foreground">/{r.total}</span>
        </p>
        <p className="mt-2 text-center font-medium text-primary">{r.band}</p>
        <p className="mt-1 text-center text-muted">{r.bandText}</p>

        <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
          <p className="text-lg font-semibold">Ton score par domaine</p>
          <div className="mt-4 space-y-4">
            {r.dimensionResults.map((d) => (
              <div key={d.code}>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{d.label}</span>
                  <span className="text-muted-foreground">
                    {d.ok}/{d.total}
                  </span>
                </div>
                <div className="mt-1">
                  <Bar value={d.scorePercent} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">Corrigé détaillé</h2>
          <div className="mt-4 divide-y divide-card-border">
            {r.review.map((item) => (
              <div key={item.id} className="py-5">
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.isCorrect
                        ? "bg-green-500/15 text-green-700 dark:text-green-400"
                        : "bg-red-500/15 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {item.isCorrect ? "Juste" : "Faux"}
                  </span>
                  <span className="text-muted-foreground">
                    Question {item.id}
                  </span>
                </div>
                <p className="mt-2 font-medium">{item.question}</p>
                {item.series && (
                  <p className="mt-1 text-center font-semibold tracking-wide">
                    {item.series}
                  </p>
                )}
                {item.figure && (
                  <div className="flex justify-center py-2 text-foreground [&_svg]:h-24 [&_svg]:w-24">
                    <div dangerouslySetInnerHTML={{ __html: item.figure }} />
                  </div>
                )}
                <div
                  className={
                    item.grid
                      ? "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"
                      : "mt-2 flex flex-col gap-1"
                  }
                >
                  {item.options.map((opt, index) => {
                    const isGiven = item.givenIndex === index;
                    const isCorrectOpt = item.correctIndex === index;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                          item.grid ? "flex-col" : ""
                        } ${
                          isCorrectOpt
                            ? "border-green-500 bg-green-500/10"
                            : isGiven
                              ? "border-red-500 bg-red-500/10"
                              : "border-card-border"
                        }`}
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {opt.svg ? (
                          <div
                            className="text-foreground [&_svg]:h-12 [&_svg]:w-12"
                            dangerouslySetInnerHTML={{ __html: opt.svg }}
                          />
                        ) : (
                          <span>{opt.text}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-muted">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (format === "career_balance") {
    const r = result as CareerBalanceResult;
    const cap = (() => {
      const q = (n: number, a: string, b: string) => `${n} ${n > 1 ? b : a}`;
      const sa = r.balance.towardSalariat.length;
      const sb = r.balance.towardIndependance.length;
      const sm = r.balance.inSuspense.length;
      return (
        `${q(sa, "argument", "arguments")} du côté du salariat, ` +
        `${q(sb, "argument", "arguments")} du côté de l'indépendance` +
        (sm ? `, et ${q(sm, "axe", "axes")} qui ne tranche${sm > 1 ? "nt" : ""} pas.` : ".")
      );
    })();

    return (
      <div className="text-left">
        <div className="flex items-end gap-4">
          <p className="text-5xl font-extrabold tabular-nums">
            {r.total}
            <span className="text-lg font-medium text-muted-foreground">/120</span>
          </p>
          <p className="pb-2 text-xl font-semibold">{r.profile.name}</p>
        </div>

        <div className="mt-4">
          <BalanceScale
            leftWeight={r.balance.leftWeight}
            rightWeight={r.balance.rightWeight}
            leftCount={r.balance.towardSalariat.length}
            rightCount={r.balance.towardIndependance.length}
            leftLabel="Salariat"
            rightLabel="Indépendance"
          />
        </div>
        <p className="text-center text-muted">{cap}</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Vers le salariat
            </p>
            {r.balance.towardSalariat.length === 0 ? (
              <p className="text-sm text-muted">Rien ne vous retient nettement de ce côté.</p>
            ) : (
              <div className="space-y-3">
                {r.balance.towardSalariat.map((a) => (
                  <div key={a.code} className="rounded-lg border border-card-border bg-card p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold">{a.label}</span>
                      <span className="text-sm text-muted-foreground">{a.score}/20</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{a.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Vers l&apos;indépendance
            </p>
            {r.balance.towardIndependance.length === 0 ? (
              <p className="text-sm text-muted">Aucun axe ne vous pousse nettement de ce côté.</p>
            ) : (
              <div className="space-y-3">
                {r.balance.towardIndependance.map((a) => (
                  <div key={a.code} className="rounded-lg border border-card-border bg-card p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold">{a.label}</span>
                      <span className="text-sm text-muted-foreground">{a.score}/20</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{a.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {r.balance.inSuspense.length > 0 && (
          <div className="mt-8 border-t border-card-border pt-6">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              En suspens
            </p>
            <p className="mb-3 text-sm text-muted">
              Ni d&apos;un côté ni de l&apos;autre : ce sont les axes sur lesquels une décision ou un apprentissage ferait basculer la balance.
            </p>
            <div className="space-y-3">
              {r.balance.inSuspense.map((a) => (
                <div key={a.code} className="rounded-lg border border-card-border bg-card p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold">{a.label}</span>
                    <span className="text-sm text-muted-foreground">{a.score}/20</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold uppercase tracking-tight">Ce que ça veut dire</h2>
          <div className="mt-3 space-y-3 text-muted">
            {r.profile.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {r.flags.length > 0 && (
            <ul className="mt-6 space-y-3">
              {r.flags.map((f, i) => (
                <li key={i} className="rounded-lg border border-card-border border-l-4 border-l-gold bg-card p-4 text-sm">
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-8 rounded-lg border border-dashed border-card-border p-4 text-sm text-muted">
          Ce test mesure une appétence, pas une compétence ni une probabilité de réussite. Un score élevé ne dit rien de la viabilité d&apos;un projet. Un score bas n&apos;interdit à personne d&apos;entreprendre : il indique ce qu&apos;il faudra compenser — un associé, un accompagnement, ou un démarrage progressif en parallèle d&apos;un emploi.
        </p>
      </div>
    );
  }

  if (format === "sosie_v2") {
    const r = result as SosieResult;
    return (
      <div className="text-left">
        <div className="rounded-xl border border-card-border bg-card p-6">
          <p className="text-lg font-semibold">Profil de compétences</p>
          <p className="mt-1 text-sm text-muted">
            Huit compétences composites, chacune une moyenne de trois dimensions.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {r.synthesisResults.map((a) => (
              <div key={a.name}>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{a.name}</span>
                  <span className="text-muted-foreground">{percent(a.scorePercent)}</span>
                </div>
                <div className="mt-1">
                  <Bar value={a.scorePercent} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">8 traits de personnalité</h2>
          <div className="mt-4">
            <DimensionBars dims={r.traitResults} />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">6 valeurs personnelles</h2>
          <div className="mt-4">
            <DimensionBars dims={r.personalValueResults} />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">6 valeurs interpersonnelles</h2>
          <div className="mt-4">
            <DimensionBars dims={r.interpersonalValueResults} />
          </div>
        </div>

        <DiscReliabilityCard reliability={r.reliability} />
      </div>
    );
  }

  if (format === "orientation_riasec") {
    return <OrientationResult result={result as OrientationResultType} />;
  }

  if (format !== "bipolar_pairs") {
    return null;
  }

  const r = result as BipolarResult;
  return (
    <div className="text-left">
      {r.typeResult && (
        <div className="rounded-2xl border border-card-border bg-card p-6 text-center shadow-sm">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Ton profil : {r.typeResult.code}
          </span>
          <p className="mt-3 text-2xl font-bold text-foreground">{r.typeResult.name}</p>
          <p className="mt-2 text-sm text-foreground/80">{r.typeResult.description}</p>
          <p className="mt-3 text-sm">
            <span className="font-semibold text-foreground">Points forts : </span>
            <span className="text-foreground/80">{r.typeResult.strengths}</span>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold text-foreground">À surveiller : </span>
            <span className="text-foreground/80">{r.typeResult.watchOut}</span>
          </p>
        </div>
      )}
      {r.mainProfile && (
        <div className="rounded-2xl border border-card-border bg-card p-6 text-center shadow-sm">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Ton profil principal
          </span>
          <p className="mt-3 text-2xl font-bold text-foreground">{r.mainProfile.trait}</p>
          <p className="mt-2 text-sm text-foreground/80">{r.mainProfile.description}</p>
        </div>
      )}
      <p
        className={
          r.typeResult || r.mainProfile
            ? "mt-6 text-center text-foreground/80"
            : "text-center text-foreground/80"
        }
      >
        {r.intro}
      </p>
      <ChartsBlock
        data={r.dimensionResults.map((d) => ({
          label: d.name,
          value: d.percentA,
        }))}
      />
      <div className="mt-8 space-y-6">
        {r.dimensionResults.map((d) => (
          <div key={d.key} className="rounded-xl border border-card-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">{d.name}</p>
            <p className="text-sm font-medium text-primary">{d.tendance}</p>
            <p className="mt-2 text-sm text-foreground/80">{d.commentaire}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-foreground/80">{r.outro}</p>
    </div>
  );
}
