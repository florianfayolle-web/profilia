import type { TestFormat } from "@/lib/types";
import type {
  scoreBipolarPairs,
  scoreForcedChoicePair,
  scoreForcedChoiceQuad,
  scoreLikertScale,
  scoreSituationalJudgment,
} from "@/lib/assessments/scoring";
import {
  ChartLegend,
  ProfileLineChart,
  RadarChart,
  type ChartPoint,
} from "@/components/dimension-charts";

type BandedResult = ReturnType<
  typeof scoreForcedChoicePair | typeof scoreForcedChoiceQuad
>;
type JudgmentResult = ReturnType<typeof scoreSituationalJudgment>;
type LikertResult = ReturnType<typeof scoreLikertScale>;
type BipolarResult = ReturnType<typeof scoreBipolarPairs>;

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
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex justify-center">
          <RadarChart data={data} />
        </div>
        <div className="flex items-center">
          <ProfileLineChart data={data} />
        </div>
      </div>
      {bandThresholds && <ChartLegend bandThresholds={bandThresholds} />}
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-card-border/60">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
      />
    </div>
  );
}

function ReliabilityCard({
  consistencyLabel,
  flagged,
  flagText,
  lang,
}: {
  consistencyLabel: string;
  flagged: boolean;
  flagText: string;
  lang: "fr" | "en";
}) {
  return (
    <div className="mt-10 rounded-lg border border-card-border bg-card p-4 text-sm">
      <p className="font-medium">
        {lang === "en" ? "Response reliability" : "Fiabilité des réponses"}
      </p>
      <p className="mt-1 text-muted">
        {lang === "en" ? "Consistency: " : "Cohérence : "}
        {consistencyLabel}
      </p>
      {flagged && <p className="mt-1 text-amber-600 dark:text-amber-400">{flagText}</p>}
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

  if (format !== "bipolar_pairs") {
    return null;
  }

  const r = result as BipolarResult;
  return (
    <div className="text-left">
      {r.typeResult && (
        <div className="rounded-lg border border-card-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Ton profil : {r.typeResult.code}
          </p>
          <p className="mt-1 text-xl font-semibold">{r.typeResult.name}</p>
          <p className="mt-2 text-sm text-muted">{r.typeResult.description}</p>
          <p className="mt-3 text-sm">
            <span className="font-medium">Points forts : </span>
            <span className="text-muted">{r.typeResult.strengths}</span>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium">À surveiller : </span>
            <span className="text-muted">{r.typeResult.watchOut}</span>
          </p>
        </div>
      )}
      {r.mainProfile && (
        <div className="rounded-lg border border-card-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Ton profil principal</p>
          <p className="mt-1 text-xl font-semibold">{r.mainProfile.trait}</p>
          <p className="mt-2 text-sm text-muted">{r.mainProfile.description}</p>
        </div>
      )}
      <p
        className={
          r.typeResult || r.mainProfile ? "mt-6 text-center text-muted" : "text-center text-muted"
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
          <div key={d.key}>
            <p className="text-sm font-medium">{d.name}</p>
            <p className="text-sm text-muted-foreground">{d.tendance}</p>
            <p className="mt-2 text-sm text-muted">{d.commentaire}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted">{r.outro}</p>
    </div>
  );
}
