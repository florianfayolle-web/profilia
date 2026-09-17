import "server-only";
import type {
  BandedReport,
  BipolarPairsDefinition,
  BipolarType,
  ForcedChoicePairDefinition,
  ForcedChoiceQuadDefinition,
  LikertScaleDefinition,
  SituationalJudgmentDefinition,
} from "./types";

// Answers are always keyed by item id (as a string, since that's how object
// keys arrive after a JSON round-trip). The value's meaning depends on the
// format: "A"/"B" for pairs, "A".."D" for quads/judgment, 1-5 for Likert,
// -2..2 for bipolar pairs.
export type AnswerMap = Record<string, string | number>;
export type Lang = "fr" | "en";

type DimensionScore = { code: string; label: string; scorePercent: number };

function band(score: number, lowBelow: number, midUpTo: number): "Low" | "Mid" | "High" {
  if (score < lowBelow) return "Low";
  if (score <= midUpTo) return "Mid";
  return "High";
}

// Mirrors the Excel/Swift "profile summary" cell: a balanced profile gets a
// generic sentence, a contrasted one names the strongest/weakest dimension.
function summarizeSpread(
  dimensions: DimensionScore[],
  spreadThreshold: number
): { kind: "balanced" | "contrasted"; strongest?: DimensionScore; weakest?: DimensionScore } {
  if (dimensions.length === 0) return { kind: "balanced" };
  const sorted = [...dimensions].sort((a, b) => a.scorePercent - b.scorePercent);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  if (strongest.scorePercent - weakest.scorePercent < spreadThreshold) {
    return { kind: "balanced" };
  }
  return { kind: "contrasted", strongest, weakest };
}

function narrativeFromBandedReport(
  dimensionScores: DimensionScore[],
  report: BandedReport,
  spreadThreshold: number,
  lang: Lang
) {
  const { lowBelow, midUpTo } = report.bandThresholds;
  const dimensions = dimensionScores.map((d) => {
    const entry = report.dimensions[d.code];
    const b = band(d.scorePercent, lowBelow, midUpTo);
    return {
      code: d.code,
      label: d.label,
      scorePercent: d.scorePercent,
      band: b,
      text: entry?.bands[b] ?? "",
      strengths: entry?.strengths ?? "",
      suitableWork: entry?.suitableWork ?? "",
      tips: entry?.tips ?? "",
    };
  });

  const spread = summarizeSpread(dimensionScores, spreadThreshold);
  const summary =
    spread.kind === "balanced"
      ? lang === "en"
        ? "Your profile is fairly balanced across all the dimensions measured."
        : "Ton profil est plutôt équilibré entre toutes les dimensions mesurées."
      : lang === "en"
        ? `Your profile contrasts mainly between "${spread.strongest!.label}" (most marked) and "${spread.weakest!.label}" (least marked).`
        : `Ton profil contraste surtout entre « ${spread.strongest!.label} » (le plus marqué) et « ${spread.weakest!.label} » (le moins marqué).`;

  return { dimensions, summary, bandThresholds: { lowBelow, midUpTo } };
}

function consistencyScore(
  controlItems: { id: number; controlOf: number | null }[],
  answers: AnswerMap
): number | null {
  if (controlItems.length === 0) return null;
  let matches = 0;
  let comparable = 0;
  for (const item of controlItems) {
    if (item.controlOf == null) continue;
    const a1 = answers[String(item.id)];
    const a2 = answers[String(item.controlOf)];
    if (a1 === undefined || a2 === undefined) continue;
    comparable += 1;
    if (a1 === a2) matches += 1;
  }
  return comparable === 0 ? null : matches / comparable;
}

function consistencyLabel(score: number | null, lang: Lang): string {
  if (score === null) return lang === "en" ? "Not available" : "Non disponible";
  if (score >= 0.8) return lang === "en" ? "Stable and consistent" : "Stable et cohérent";
  if (score >= 0.6)
    return lang === "en"
      ? "Moderate, interpret with caution"
      : "Modéré, à interpréter avec prudence";
  return lang === "en" ? "Low, inconsistent answers" : "Faible, réponses peu cohérentes";
}

// ---------------------------------------------------------------------------
// forced_choice_pair (SOSIE 2 style)
// ---------------------------------------------------------------------------

export function scoreForcedChoicePair(
  def: ForcedChoicePairDefinition,
  answers: AnswerMap,
  lang: Lang = "fr"
) {
  const mainItems = def.items.filter((i) => !i.isControl);
  const controlItems = def.items.filter((i) => i.isControl);

  const dimensionResults = def.dimensions.map((dim) => {
    let offered = 0;
    let chosen = 0;
    for (const item of mainItems) {
      if (item.statementA.dimension === dim.code) offered += 1;
      if (item.statementB.dimension === dim.code) offered += 1;
      const answer = answers[String(item.id)];
      if (answer === undefined) continue;
      const chosenDim = answer === "A" ? item.statementA.dimension : item.statementB.dimension;
      if (chosenDim === dim.code) chosen += 1;
    }
    return {
      code: dim.code,
      label: dim.label,
      timesOffered: offered,
      timesChosen: chosen,
      scorePercent: offered === 0 ? 0 : chosen / offered,
    };
  });

  const answered = mainItems
    .map((i) => answers[String(i.id)])
    .filter((a): a is string => a !== undefined);
  const shareA = answered.length === 0 ? 0 : answered.filter((a) => a === "A").length / answered.length;
  const responsePatternFlag = answered.length === mainItems.length && (shareA > 0.85 || shareA < 0.15);

  const consistency = consistencyScore(controlItems, answers);

  return {
    dimensionResults,
    consistency,
    consistencyLabel: consistencyLabel(consistency, lang),
    responsePatternFlag,
    narrativeReport: narrativeFromBandedReport(dimensionResults, def.report, 0.25, lang),
  };
}

// ---------------------------------------------------------------------------
// forced_choice_quad (ADAPT style)
// ---------------------------------------------------------------------------

export function scoreForcedChoiceQuad(
  def: ForcedChoiceQuadDefinition,
  answers: AnswerMap,
  lang: Lang = "fr"
) {
  const mainItems = def.items.filter((i) => !i.isControl);
  const controlItems = def.items.filter((i) => i.isControl);

  const dimensionResults = def.dimensions.map((dim) => {
    let offered = 0;
    let chosen = 0;
    for (const item of mainItems) {
      for (const opt of item.options) {
        if (opt.dimension === dim.code) offered += 1;
      }
      const answer = answers[String(item.id)];
      if (answer === undefined) continue;
      const picked = item.options.find((o) => o.key === answer);
      if (picked?.dimension === dim.code) chosen += 1;
    }
    return {
      code: dim.code,
      label: dim.label,
      timesOffered: offered,
      timesChosen: chosen,
      scorePercent: offered === 0 ? 0 : chosen / offered,
    };
  });

  const answered = mainItems
    .map((i) => answers[String(i.id)])
    .filter((a): a is string => a !== undefined);
  let positionBiasFlag = false;
  if (answered.length === mainItems.length) {
    for (const letter of ["A", "B", "C", "D"]) {
      const share = answered.filter((a) => a === letter).length / answered.length;
      if (share > 0.4 || share < 0.1) positionBiasFlag = true;
    }
  }

  const consistency = consistencyScore(controlItems, answers);

  return {
    dimensionResults,
    consistency,
    consistencyLabel: consistencyLabel(consistency, lang),
    positionBiasFlag,
    narrativeReport: narrativeFromBandedReport(dimensionResults, def.report, 0.15, lang),
  };
}

// ---------------------------------------------------------------------------
// situational_judgment (TD12 style)
// ---------------------------------------------------------------------------

export function scoreSituationalJudgment(
  def: SituationalJudgmentDefinition,
  answers: AnswerMap,
  lang: Lang = "fr"
) {
  const mainItems = def.items.filter((i) => !i.isControl);
  const controlItems = def.items.filter((i) => i.isControl);

  let totalPoints = 0;
  let totalMax = 0;

  const dimensionResults = def.dimensions.map((dim) => {
    const dimItems = mainItems.filter((i) => i.dimension === dim.code);
    let points = 0;
    for (const item of dimItems) {
      const answer = answers[String(item.id)];
      const opt = item.options.find((o) => o.key === answer);
      if (opt) points += 5 - opt.rank;
    }
    const maxPoints = dimItems.length * 4;
    totalPoints += points;
    totalMax += maxPoints;
    return {
      code: dim.code,
      label: dim.label,
      itemCount: dimItems.length,
      pointsEarned: points,
      maxPoints,
      scorePercent: maxPoints === 0 ? 0 : points / maxPoints,
    };
  });

  const overallPercent = totalMax === 0 ? 0 : totalPoints / totalMax;

  const answeredItems = mainItems.filter((i) => answers[String(i.id)] !== undefined);
  let socialDesirabilityFlag = false;
  if (answeredItems.length === mainItems.length) {
    const rank1Count = answeredItems.filter((item) => {
      const opt = item.options.find((o) => o.key === answers[String(item.id)]);
      return opt?.rank === 1;
    }).length;
    const share = rank1Count / answeredItems.length;
    socialDesirabilityFlag = share > 0.85 || share < 0.15;
  }

  const consistency = consistencyScore(controlItems, answers);

  return {
    dimensionResults,
    overallPercent,
    consistency,
    consistencyLabel: consistencyLabel(consistency, lang),
    socialDesirabilityFlag,
    narrativeReport: narrativeFromBandedReport(dimensionResults, def.report, 0.2, lang),
  };
}

// ---------------------------------------------------------------------------
// likert_scale (BP360 style)
// ---------------------------------------------------------------------------

export function scoreLikertScale(
  def: LikertScaleDefinition,
  answers: AnswerMap,
  lang: Lang = "fr"
) {
  function levelFor(percent: number): string {
    for (const lvl of def.levels) {
      if (percent < lvl.maxPercent) return lvl.label;
    }
    return def.levels[def.levels.length - 1]?.label ?? "";
  }

  const dimensionResults = def.dimensions.map((dim) => {
    const items = def.items.filter((i) => i.dimension === dim.key);
    const total = items.reduce((sum, item) => sum + Number(answers[String(item.id)] ?? 0), 0);
    const maxScore = items.length * 5;
    const scorePercent = maxScore === 0 ? 0 : total / maxScore;
    return {
      key: dim.key,
      name: dim.name,
      scoreObtained: total,
      scoreMax: maxScore,
      scorePercent,
      level: levelFor(scorePercent),
    };
  });

  const percentByName = new Map(dimensionResults.map((d) => [d.name, d.scorePercent]));

  const profileResults = def.profiles
    .map((profile) => {
      const relevant = profile.dominantDimensions
        .map((name) => percentByName.get(name))
        .filter((v): v is number => v !== undefined);
      const scorePercent =
        relevant.length === 0 ? 0 : relevant.reduce((a, b) => a + b, 0) / relevant.length;
      return { name: profile.name, description: profile.description, scorePercent };
    })
    .sort((a, b) => b.scorePercent - a.scorePercent);

  const narrativeReport = def.report
    ? narrativeFromBandedReport(
        dimensionResults.map((d) => ({
          code: d.key,
          label: d.name,
          scorePercent: d.scorePercent,
        })),
        def.report,
        0.25,
        lang
      )
    : undefined;

  return {
    dimensionResults,
    profileResults,
    dominantProfile: profileResults[0] ?? null,
    narrativeReport,
  };
}

// ---------------------------------------------------------------------------
// bipolar_pairs (Test 50 style)
// ---------------------------------------------------------------------------

export function scoreBipolarPairs(def: BipolarPairsDefinition, answers: AnswerMap) {
  function levelCode(percentA: number, percentB: number, total: number): string {
    if (total <= 0) return "equilibre";
    if (percentA >= 0.7) return "Amarque";
    if (percentB >= 0.7) return "Bmarque";
    if (percentA > percentB) return "Amodere";
    if (percentB > percentA) return "Bmodere";
    return "equilibre";
  }

  function tendanceLabel(
    poleA: { label: string; trait?: string },
    poleB: { label: string; trait?: string },
    percentA: number,
    percentB: number,
    total: number
  ): string {
    if (total <= 0) return "Équilibré / Neutre";
    // When both poles carry a descriptive trait word, lead with that
    // instead of a raw intensity label — reads as a personality
    // description rather than a graduation on a scale.
    if (poleA.trait && poleB.trait) {
      if (percentA > percentB) return poleA.trait;
      if (percentB > percentA) return poleB.trait;
      return "Équilibré";
    }
    if (percentA >= 0.7) return `${poleA.label} (marqué)`;
    if (percentB >= 0.7) return `${poleB.label} (marqué)`;
    if (percentA > percentB) return `${poleA.label} (modéré)`;
    if (percentB > percentA) return `${poleB.label} (modéré)`;
    return "Équilibré";
  }

  const dimensionResults = def.dimensions.map((dim) => {
    let pointsA = 0;
    let pointsB = 0;
    const items = def.items.filter((i) => i.dimension === dim.key);
    for (const item of items) {
      const raw = answers[String(item.id)];
      if (raw === undefined) continue;
      const value = Number(raw);
      const leftPoints = Math.max(-value, 0);
      const rightPoints = Math.max(value, 0);
      if (item.left.pole === "A") pointsA += leftPoints;
      else pointsB += leftPoints;
      if (item.right.pole === "A") pointsA += rightPoints;
      else pointsB += rightPoints;
    }
    const total = pointsA + pointsB;
    const percentA = total === 0 ? 0 : pointsA / total;
    const percentB = total === 0 ? 0 : pointsB / total;
    return {
      key: dim.key,
      name: dim.name,
      poleALabel: dim.poleA.label,
      poleBLabel: dim.poleB.label,
      poleALetter: dim.poleA.letter,
      poleBLetter: dim.poleB.letter,
      pointsA,
      pointsB,
      percentA,
      percentB,
      tendance: tendanceLabel(dim.poleA, dim.poleB, percentA, percentB, total),
      levelCode: levelCode(percentA, percentB, total),
      commentaire: dim.report[levelCode(percentA, percentB, total)] ?? "",
    };
  });

  let typeResult: (BipolarType & { code: string }) | null = null;
  if (def.typeCatalog && dimensionResults.every((d) => d.poleALetter && d.poleBLetter)) {
    const code = dimensionResults
      .map((d) => (d.percentA >= d.percentB ? d.poleALetter : d.poleBLetter))
      .join("");
    const entry = def.typeCatalog[code];
    if (entry) typeResult = { code, ...entry };
  }

  // When poles carry trait words, the single most pronounced dimension
  // (biggest gap between its two poles) names an overall headline profile —
  // one word out of the whole test, not just a per-dimension label.
  let mainProfile: { trait: string; description: string } | null = null;
  let bestSpread = -1;
  for (const dim of def.dimensions) {
    const result = dimensionResults.find((d) => d.key === dim.key);
    if (!result) continue;
    const winningPole = result.percentA >= result.percentB ? dim.poleA : dim.poleB;
    if (!winningPole.trait) continue;
    const spread = Math.abs(result.percentA - result.percentB);
    if (spread > bestSpread) {
      bestSpread = spread;
      mainProfile = { trait: winningPole.trait, description: winningPole.description };
    }
  }

  return {
    dimensionResults,
    intro: def.report.intro,
    outro: def.report.outro,
    typeResult,
    mainProfile,
  };
}
