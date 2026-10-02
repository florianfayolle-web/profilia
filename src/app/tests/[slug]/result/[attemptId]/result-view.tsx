import type { TestFormat } from "@/lib/types";
import type {
  scoreBipolarPairs,
  scoreCareerBalance,
  scoreDisc,
  scoreForcedChoicePair,
  scoreForcedChoiceQuad,
  scoreLikertScale,
  scoreLogicMcq,
  scoreAdhdScreener,
  scoreOrientation,
  scorePcm,
  scoreSituationalJudgment,
  scoreSosie,
} from "@/lib/assessments/scoring";
import { IqScale } from "@/components/iq-scale";
import { IQ_BAND_INFO, IQ_BAND_PEOPLE_NOTE, weakestDomains } from "@/lib/assessments/iq-insights";
import { OrientationResult } from "./orientation-result";
import {
  ChartLegend,
  ProfileLineChart,
  RadarChart,
  type ChartPoint,
} from "@/components/dimension-charts";
import { DISC_COLORS } from "@/components/disc-wheel";
import { DiscWheel8Profiles } from "@/components/disc-wheel-8-profiles";
import { DISC_ARCHETYPE_INFO } from "@/lib/assessments/disc-archetypes";
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
type AdhdScreenerResult = ReturnType<typeof scoreAdhdScreener>;
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
  testSlug,
}: {
  format: TestFormat;
  result: unknown;
  language: string;
  testSlug?: string;
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
    const percents = r.dimensionResults.map((d) => d.scorePercent);
    const spread = percents.length > 0 ? Math.max(...percents) - Math.min(...percents) : 0;
    const isHomogene = spread < 0.25;
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
        {testSlug === "hpi" && (
          <div className="mt-4 rounded-lg border border-card-border bg-card p-5 text-sm text-muted">
            <p className="font-medium text-foreground">
              {isHomogene ? "Un profil plutôt homogène" : "Un profil plutôt hétérogène"}
            </p>
            <p className="mt-1">
              {isHomogene
                ? "Tes six traits sont assez proches les uns des autres : ce type de répartition régulière se rapproche du profil dit « homogène » évoqué dans la littérature sur le haut potentiel, plutôt associé à une pensée linéaire et à un mode de fonctionnement qui s'accorde en général assez facilement aux attentes scolaires ou professionnelles."
                : "Tes réponses montrent un net écart entre certains traits et d'autres : ce type de répartition inégale se rapproche du profil dit « hétérogène » (ou « complexe ») évoqué dans la littérature sur le haut potentiel, souvent associé à une pensée plus intuitive et associative, et à une hypersensibilité plus marquée."}
              {" "}Ce n&apos;est qu&apos;une tendance lue dans tes propres réponses, pas une classification établie par un professionnel.
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
    return (
      <div className="text-left">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Ton profil sur la roue des 8 profils DISC
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{r.archetype}</h1>
        </div>
        <div className="mx-auto mt-6 max-w-md">
          <DiscWheel8Profiles className="w-full" highlight={r.archetype} />
        </div>
        {DISC_ARCHETYPE_INFO[r.archetype] && (
          <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {DISC_ARCHETYPE_INFO[r.archetype].styles}
            </p>
            <p className="mt-2">{DISC_ARCHETYPE_INFO[r.archetype].summary}</p>
            <p className="mt-4 text-sm">
              <span className="font-medium">Tes points forts : </span>
              <span className="text-muted">
                {DISC_ARCHETYPE_INFO[r.archetype].strengths.join(" · ")}
              </span>
            </p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Point de vigilance : </span>
              <span className="text-muted">{DISC_ARCHETYPE_INFO[r.archetype].watch}</span>
            </p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Pour progresser : </span>
              <span className="text-muted">{DISC_ARCHETYPE_INFO[r.archetype].tip}</span>
            </p>
          </div>
        )}
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
            {r.same ? "Ta phase, tu restes sur ta base" : "Ta phase, où tu vis en ce moment"}
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
        {r.iqScore != null && (
          <div className="mx-auto mb-6 w-fit rounded-2xl border-2 border-primary/40 bg-primary/5 px-8 py-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Score indicatif
            </p>
            <p className="mt-1 text-5xl font-bold text-primary tabular-nums">{r.iqScore}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.childMode
                ? "Échelle indicative Profilia — moyenne 100 (pas une échelle clinique)"
                : "Échelle de Wechsler — moyenne 100, écart-type 15"}
            </p>
            {r.percentile != null && (
              <p className="mt-2 text-sm font-medium text-foreground">
                {r.childMode
                  ? `Plus élevé que ${r.percentile} % des scores possibles sur cette échelle`
                  : `Plus élevé que ${r.percentile} % de la population sur cette échelle`}
              </p>
            )}
          </div>
        )}
        {r.iqScore != null && (
          <div className="mx-auto max-w-xl">
            <IqScale iqScore={r.iqScore} />
          </div>
        )}
        <p className="mt-6 text-center font-medium text-primary">{r.band}</p>
        <p className="mt-1 text-center text-muted">{r.bandText}</p>
        {r.iqScore == null && (
          <p className="text-center text-2xl font-semibold">
            Score global : {r.score}
            <span className="text-lg font-medium text-muted-foreground">/{r.total}</span>
          </p>
        )}

        {r.childMode && (
          <p className="mt-4 rounded-lg border border-card-border bg-background p-3 text-center text-xs text-muted-foreground">
            Ce chiffre n&apos;est pas un score de QI : c&apos;est un repère indicatif, calculé sur
            cet exercice précis et cette tranche d&apos;âge, à un instant donné. Seul un vrai WISC,
            passé avec un·e psychologue, peut donner un score cliniquement valable pour un enfant.
          </p>
        )}

        {!r.childMode && IQ_BAND_INFO[r.band] && (
          <div className="mx-auto mt-6 max-w-xl rounded-lg border border-card-border bg-background p-4 text-center text-sm text-muted">
            <p className="font-medium text-foreground">
              {IQ_BAND_INFO[r.band]!.people ? "On associe souvent cette tranche à…" : "Pour te situer"}
            </p>
            <p className="mt-1">
              {IQ_BAND_INFO[r.band]!.people?.join(" · ") ?? IQ_BAND_INFO[r.band]!.generic}
            </p>
            {IQ_BAND_INFO[r.band]!.people && (
              <p className="mt-2 text-xs text-muted-foreground">{IQ_BAND_PEOPLE_NOTE}</p>
            )}
          </div>
        )}

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

        {(() => {
          const tips = weakestDomains(r.dimensionResults);
          if (tips.length === 0) return null;
          return (
            <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
              <p className="text-lg font-semibold">Conseils pour progresser</p>
              <p className="mt-1 text-sm text-muted">
                Sur les domaines où il reste le plus de marge :
              </p>
              <div className="mt-4 space-y-3">
                {tips.map((t) => (
                  <div key={t.code}>
                    <p className="text-sm font-medium text-foreground">{t.label}</p>
                    <p className="mt-0.5 text-sm text-muted">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {r.iqScore != null && r.childMode && (
          <div className="mt-10 rounded-xl border border-card-border bg-card p-6 text-sm text-muted">
            <p className="font-medium text-foreground">Comment lire ce résultat</p>
            <p className="mt-2">
              Ce chiffre est calculé à partir du pourcentage de bonnes réponses sur les 8
              familles de raisonnement testées, sur les 40 questions choisies pour cette tranche
              d&apos;âge, puis replacé sur une échelle indicative (moyenne 100) — la même
              présentation que la version adulte du test, pour rester lisible d&apos;un coup
              d&apos;œil.
            </p>
            <p className="mt-2">
              Ce n&apos;est pas un WISC ni un score étalonné sur une vraie population d&apos;enfants
              du même âge : nous n&apos;avons pas ces données. Il compare seulement la performance
              à cet exercice précis, pas les capacités réelles de l&apos;enfant. Le résultat peut
              aussi varier d&apos;un jour à l&apos;autre selon la fatigue ou la familiarité avec ce
              type d&apos;exercices — ce n&apos;est jamais une mesure figée.
            </p>
            <p className="mt-2">
              Regarde surtout le détail par domaine ci-dessus : il montre où l&apos;enfant est à
              l&apos;aise et où il pourrait reprendre tranquillement, plus utile au quotidien
              qu&apos;un chiffre seul.
            </p>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Le détail question par question n&apos;est pas affiché sur ce test, pour que le
              résultat garde un sens si l&apos;enfant le repasse plus tard.
            </p>
          </div>
        )}

        {r.iqScore != null && !r.childMode && (
          <div className="mt-10 rounded-xl border border-card-border bg-card p-6 text-sm text-muted">
            <p className="font-medium text-foreground">Comment lire ce résultat</p>
            <p className="mt-2">
              Ce score indicatif est calculé à partir de ton pourcentage de bonnes réponses sur
              les 8 familles de raisonnement testées (numérique, verbal, spatial, déductif,
              inductif, attention, organisation, mécanique), puis replacé sur l&apos;échelle de
              Wechsler (moyenne 100, écart-type 15) — la même échelle utilisée pour les vrais
              tests de QI cliniques.
            </p>
            <p className="mt-2">
              Le pourcentage affiché plus haut (« plus élevé que X % de la population ») est un
              percentile : il indique combien de personnes ton score dépasserait sur cette même
              échelle, ce qui se lit souvent plus intuitivement qu&apos;un chiffre brut. Les écarts
              se resserrent près de la moyenne et s&apos;étirent aux extrêmes : quelques points de
              plus autour de 130 pèsent bien plus, en percentile, que les mêmes points autour de 100.
            </p>
            <p className="mt-2">
              Ce n&apos;est pas un quotient intellectuel certifié : un vrai QI clinique demande un
              étalonnage sur une large population, un outil validé (WAIS/WISC) et une passation
              individuelle avec un psychologue formé. Ton score peut aussi varier d&apos;un jour à
              l&apos;autre selon la fatigue, le stress ou la familiarité avec ce type d&apos;exercices.
            </p>
            <p className="mt-2">
              Regarde surtout le détail par domaine ci-dessus : il montre où tu es le plus à
              l&apos;aise et où l&apos;entraînement ferait le plus de différence, ce qui est plus
              utile au quotidien qu&apos;un chiffre unique.
            </p>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Le détail question par question n&apos;est pas affiché sur ce test : un vrai test de
              QI ne donne jamais son corrigé, pour que le score garde un sens si tu le repasses
              plus tard.
            </p>
          </div>
        )}

        {r.iqScore == null && (
          <div className="mt-10 rounded-xl border border-card-border bg-card p-6 text-sm text-muted">
            <p className="font-medium text-foreground">Comment lire ce résultat</p>
            <p className="mt-2">
              Ton score est calculé sur l&apos;ensemble des familles de raisonnement testées
              (voir le détail par domaine ci-dessus). Le détail question par question
              n&apos;est pas affiché : un test de raisonnement ne donne jamais son corrigé,
              pour que le score garde un sens si tu le repasses plus tard.
            </p>
            <p className="mt-2">
              Regarde surtout le domaine où l&apos;écart est le plus marqué : c&apos;est
              généralement là que l&apos;entraînement ferait le plus de différence.
            </p>
          </div>
        )}
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
          Ce test mesure une appétence, pas une compétence ni une probabilité de réussite. Un score élevé ne dit rien de la viabilité d&apos;un projet. Un score bas n&apos;interdit à personne d&apos;entreprendre : il indique ce qu&apos;il faudra compenser, un associé, un accompagnement, ou un démarrage progressif en parallèle d&apos;un emploi.
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

  if (format === "adhd_screener") {
    const r = result as AdhdScreenerResult;

    const typeTxt: Record<string, string> = {
      combined: "les deux dimensions (attention, agitation et impulsivité)",
      inattention: "surtout l'attention et l'organisation",
      hyperactivite: "surtout l'agitation et l'impulsivité",
    };

    const [verdictTitle, verdictText] =
      r.level === "high"
        ? [
            "Profil évocateur d'un TDAH",
            `Tu décris des signes fréquents qui touchent ${r.dimensionType ? typeTxt[r.dimensionType] : "plusieurs domaines"}, présents depuis l'enfance et gênants dans plusieurs domaines. Ce tableau mérite une évaluation par un professionnel.`,
          ]
        : r.level === "mid"
          ? [
              "Plusieurs signes à explorer",
              r.dimensionType
                ? `Tu décris des signes fréquents qui touchent ${typeTxt[r.dimensionType]}, mais tous les critères de contexte ne sont pas réunis. Un médecin pourra faire la part entre un TDAH et d'autres causes possibles.`
                : "Certains signes reviennent souvent, sans atteindre le seuil habituel. Si ces difficultés te pèsent, parles-en à ton médecin : elles peuvent avoir plusieurs origines.",
            ]
          : [
              "Peu de signes évocateurs",
              "Tes réponses montrent peu de signes fréquents de TDAH. Si tu rencontres malgré tout des difficultés au quotidien, un médecin reste le bon interlocuteur.",
            ];

    const levelStyle =
      r.level === "high"
        ? "border-amber-500/60 bg-amber-500/10"
        : r.level === "mid"
          ? "border-primary/40 bg-primary/5"
          : "border-green-500/50 bg-green-500/10";

    const contextLabels = ["Présent avant 12 ans", "Gêne dans au moins deux domaines", "Depuis au moins 6 mois"];

    const DimensionMeter = ({ label, dim }: { label: string; dim: { hits: number; total: number; avgPercent: number } }) => (
      <div>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{label}</span>
          <span className="text-muted-foreground">{dim.hits} / {dim.total} signes fréquents</span>
        </div>
        <div className="relative mt-2 h-2.5 rounded-full bg-card-border/60">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${(dim.hits / dim.total) * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-foreground/60"
            style={{ left: `${(5 / dim.total) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Intensité moyenne : {dim.avgPercent} % — le trait marque le seuil de 5</p>
      </div>
    );

    return (
      <div className="text-left">
        <div className={`rounded-2xl border-2 p-6 text-center ${levelStyle}`}>
          <p className="text-sm font-medium text-muted-foreground">Ton résultat</p>
          <p className="mt-2 text-2xl font-bold">{verdictTitle}</p>
          <p className="mt-3 text-sm text-muted">{verdictText}</p>
        </div>

        <div className="mt-8 space-y-6 rounded-xl border border-card-border bg-card p-6">
          <DimensionMeter label="Attention" dim={r.attention} />
          <DimensionMeter label="Agitation et impulsivité" dim={r.hyperactivite} />
        </div>

        <div className="mt-6 rounded-xl border border-card-border bg-card p-5 text-sm text-muted">
          <p className="font-medium text-foreground">Comment lire ce résultat</p>
          <p className="mt-2">
            Chaque dimension (attention, agitation et impulsivité) regroupe 9 situations du
            quotidien, notées de « jamais » à « très souvent ». Une réponse à partir de 63 %
            (« souvent ») compte comme un signe fréquent ; 5 signes fréquents ou plus sur 9 dans
            une dimension atteignent le seuil utilisé chez l&apos;adulte dans le DSM-5.
          </p>
          <p className="mt-2">
            Un score élevé seul ne suffit pas : le DSM-5 demande aussi que ces signes soient
            présents depuis l&apos;enfance, gênent dans au moins deux domaines de vie et durent
            depuis 6 mois (voir Contexte ci-dessous). C&apos;est la combinaison des deux, pas le
            score seul, qui distingue un profil « évocateur » d&apos;un profil « à explorer ».
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-card-border bg-card p-5">
          <p className="font-semibold text-foreground">Contexte</p>
          <ul className="mt-3 space-y-2 text-sm">
            {r.contextAnswers.map((c, i) => (
              <li key={c.id} className="flex items-start gap-2">
                <span className={c.yes ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                  {c.yes ? "✓" : "–"}
                </span>
                <span className="text-muted">
                  {contextLabels[i] ?? c.text} : {c.yes ? "oui" : "non"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-card-border bg-card p-5 text-sm text-muted">
          <p className="font-medium text-foreground">Et maintenant ?</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Parles-en à ton médecin généraliste, qui pourra t&apos;orienter vers un psychiatre formé au TDAH de l&apos;adulte.</li>
            <li>Note des exemples concrets de ton quotidien et, si possible, retrouve d&apos;anciens bulletins scolaires : ils aident au diagnostic.</li>
            <li>
              L&apos;association HyperSupers – TDAH France informe et oriente :{" "}
              <a href="https://www.tdah-france.fr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                tdah-france.fr
              </a>
              .
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-card-border bg-card p-5 text-sm text-muted">
          <p className="font-medium text-foreground">Si un TDAH est confirmé</p>
          <p className="mt-2">
            Un diagnostic ne mène pas automatiquement à un traitement médicamenteux. Les approches
            non médicamenteuses (psychoéducation, thérapies comportementales, aménagements concrets
            du quotidien) sont toujours la première étape. Un traitement par méthylphénidate n&apos;est
            envisagé que si elles ne suffisent pas, toujours en complément et jamais à leur place, et
            sa prescription est strictement réservée à un médecin spécialisé du TDAH.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ce résultat est un repère, pas un diagnostic. Questions rédigées à partir des critères du TDAH de l&apos;adulte
          du DSM-5. Un questionnaire de repérage en ligne ne remplace jamais une évaluation clinique : seul un médecin
          ou un psychiatre peut poser un diagnostic de TDAH, après un entretien approfondi.
        </p>
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
