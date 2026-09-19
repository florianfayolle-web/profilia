import "server-only";
import type {
  BandedReport,
  BipolarPairsDefinition,
  BipolarType,
  DiscAnswer,
  DiscDefinition,
  CareerBalanceDefinition,
  DiscKey,
  ForcedChoicePairDefinition,
  ForcedChoiceQuadDefinition,
  LikertScaleDefinition,
  LogicMcqDefinition,
  OrientationDefinition,
  OrientationJob,
  OrientationValueKey,
  PcmAnswer,
  PcmDefinition,
  PcmKey,
  RiasecKey,
  SituationalJudgmentDefinition,
  SosieAnswer,
  SosieDefinition,
  SosieOptionKey,
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
        ? `Your clearest strength is "${spread.strongest!.label}". The dimension to work on first is "${spread.weakest!.label}".`
        : `Ta force la plus nette ressort sur « ${spread.strongest!.label} ». La dimension à travailler en priorité est « ${spread.weakest!.label} ».`;

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

// ---------------------------------------------------------------------------
// disc_quad (DISC style: pick most-like-me AND least-like-me per group of 4)
// ---------------------------------------------------------------------------

const DISC_KEYS: DiscKey[] = ["D", "I", "S", "C"];

function pearsonCorr(a: number[], b: number[]): number | null {
  const n = a.length;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0,
    da = 0,
    db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da === 0 || db === 0 ? null : num / Math.sqrt(da * db);
}

function reliabilityTier(score: number): "good" | "warn" | "bad" {
  if (score >= 0.7) return "good";
  if (score >= 0.45) return "warn";
  return "bad";
}

export function scoreDisc(
  def: DiscDefinition,
  answers: Record<string, DiscAnswer>,
  lang: Lang = "fr"
) {
  const items = def.items;
  const N = items.length; // 80 groups; every dimension appears once per group
  const half = Math.floor(N / 2);

  const net: Record<DiscKey, number> = { D: 0, I: 0, S: 0, C: 0 };
  const h1: Record<DiscKey, number> = { D: 0, I: 0, S: 0, C: 0 };
  const h2: Record<DiscKey, number> = { D: 0, I: 0, S: 0, C: 0 };
  const plusPositionCount = [0, 0, 0, 0];
  const pairPositionCount: Record<string, number> = {};
  // sign[`${dimension}:${trait}:${phrasing}`] = 1 (picked "+") | -1 (picked "-")
  const sign: Record<string, 1 | -1> = {};
  const times: number[] = [];

  items.forEach((item, index) => {
    const answer = answers[String(item.id)];
    const bucket = index < half ? h1 : h2;
    if (!answer) return;
    times.push(answer.timeMs ?? 0);
    const plusIdx = answer.plus ? item.options.findIndex((o) => o.key === answer.plus) : -1;
    const minusIdx = answer.minus ? item.options.findIndex((o) => o.key === answer.minus) : -1;
    if (plusIdx >= 0) {
      const opt = item.options[plusIdx];
      net[opt.dimension] += 1;
      bucket[opt.dimension] += 1;
      sign[`${opt.dimension}:${opt.trait}:${opt.phrasing}`] = 1;
      plusPositionCount[plusIdx] += 1;
    }
    if (minusIdx >= 0) {
      const opt = item.options[minusIdx];
      net[opt.dimension] -= 1;
      bucket[opt.dimension] -= 1;
      sign[`${opt.dimension}:${opt.trait}:${opt.phrasing}`] = -1;
    }
    if (plusIdx >= 0 && minusIdx >= 0) {
      const key = `${plusIdx}-${minusIdx}`;
      pairPositionCount[key] = (pairPositionCount[key] ?? 0) + 1;
    }
  });

  // 1. Twin formulations: every trait is asked twice, worded differently.
  // A contradiction is picking "+" for one phrasing and "-" for the other.
  const traitTexts = new Map<string, { a?: string; b?: string }>();
  for (const item of items) {
    for (const opt of item.options) {
      const key = `${opt.dimension}:${opt.trait}`;
      const entry = traitTexts.get(key) ?? {};
      entry[opt.phrasing] = opt.text;
      traitTexts.set(key, entry);
    }
  }
  let agree = 0;
  let contra = 0;
  const contraList: { dimension: DiscKey; textPlus: string; textMinus: string }[] = [];
  for (const key of traitTexts.keys()) {
    const [dimension, traitStr] = key.split(":");
    const signA = sign[`${key}:a`];
    const signB = sign[`${key}:b`];
    if (!signA || !signB) continue;
    if (signA === signB) {
      agree += 1;
    } else {
      contra += 1;
      const { a, b } = traitTexts.get(key)!;
      contraList.push({
        dimension: dimension as DiscKey,
        textPlus: signA === 1 ? a! : b!,
        textMinus: signA === 1 ? b! : a!,
      });
    }
    void traitStr;
  }
  const twinRatio = agree + contra > 0 ? agree / (agree + contra) : null;
  const twinScore = twinRatio === null ? 0.5 : Math.max(0, Math.min(1, (twinRatio - 0.5) / (0.85 - 0.5)));

  // 2. Split-half stability: does the first half of the test agree with the
  // second half on which styles come out on top?
  const r = pearsonCorr(
    DISC_KEYS.map((k) => h1[k]),
    DISC_KEYS.map((k) => h2[k])
  );
  const top1 = DISC_KEYS.reduce((m, k) => (h1[k] > h1[m] ? k : m), "D" as DiscKey);
  const top2 = DISC_KEYS.reduce((m, k) => (h2[k] > h2[m] ? k : m), "D" as DiscKey);
  const splitScore = r === null ? 0.5 : Math.max(0, Math.min(1, r));

  // 3. Pace: answers given in under 4s suggest the statements weren't read.
  const fast = times.filter((t) => t > 0 && t < 4000).length;
  const fastShare = times.length > 0 ? fast / times.length : 0;
  const sortedTimes = [...times].sort((a, b) => a - b);
  const median = sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length / 2)] : 0;
  const total = times.reduce((s, t) => s + t, 0);
  const speedScore = Math.max(0, Math.min(1, 1 - fastShare / 0.3));

  // 4. Position habits: the 4 statements are shuffled every group, so a
  // thought-through answer should land on each of the 4 slots ~25% of the time.
  const maxPlus = Math.max(...plusPositionCount) / N;
  const maxPair = Math.max(0, ...Object.values(pairPositionCount)) / N;
  const autoShare = Math.max(maxPlus, maxPair * 1.5);
  const posScore = Math.max(0, Math.min(1, 1 - (autoShare - 0.35) / (0.7 - 0.35)));

  const spread = Math.max(...DISC_KEYS.map((k) => net[k])) - Math.min(...DISC_KEYS.map((k) => net[k]));
  const wSplit = 0.3 * Math.max(0, Math.min(1, spread / 30));
  const wTwin = 0.8 - wSplit;
  const index = Math.round(
    100 * (wTwin * twinScore + wSplit * splitScore + 0.1 * speedScore + 0.1 * posScore)
  );

  const labelFor = (k: DiscKey) => def.dimensions.find((d) => d.code === k)?.label ?? k;

  const [reliabilityLabel, reliabilityText] =
    index >= 70
      ? ["Résultat fiable", "Les réponses sont cohérentes d'un bout à l'autre du test. Le profil peut être interprété avec confiance."]
      : index >= 45
        ? ["À interpréter avec prudence", "Certaines réponses se contredisent. Le profil donne une tendance, à confirmer lors d'un échange."]
        : ["Résultat peu fiable", "Les réponses sont trop contradictoires ou trop rapides pour dégager un profil solide. Il est conseillé de refaire le test au calme."];

  const indicators = [
    {
      tier: reliabilityTier(twinScore),
      title: `Affirmations jumelles : ${contra} contradiction${contra > 1 ? "s" : ""} sur ${agree + contra} paires`,
      text: "Chaque trait est mesuré deux fois avec des formulations différentes, à des moments éloignés du test. Une contradiction, c'est choisir « + » pour l'une et « − » pour l'autre.",
    },
    {
      tier: wSplit < 0.1 ? ("good" as const) : reliabilityTier(splitScore),
      title:
        top1 === top2
          ? `Première et deuxième moitié : même style dominant (${labelFor(top1)})`
          : `Première moitié : ${labelFor(top1)}, deuxième moitié : ${labelFor(top2)}`,
      text:
        wSplit < 0.1
          ? "Profil très équilibré : la comparaison des deux moitiés est peu significative et compte peu dans l'indice."
          : `Ressemblance des deux moitiés : ${r === null ? "non calculable" : `${Math.round(Math.max(0, r) * 100)} %`}. Un profil stable donne un score proche de 100 %.`,
    },
    {
      tier: reliabilityTier(speedScore),
      title: `Rythme : ${fast} groupe${fast > 1 ? "s" : ""} traité${fast > 1 ? "s" : ""} en moins de 4 secondes`,
      text: `Temps de réponse total : ${Math.round(total / 60000)} min, soit ${Math.round(median / 1000)} s par groupe en temps médian. Des réponses très rapides laissent penser que les affirmations n'ont pas été lues.`,
    },
    {
      tier: reliabilityTier(posScore),
      title: `Réponses en automatique : ${Math.round(maxPlus * 100)} % des « + » au même emplacement`,
      text: "L'ordre des affirmations est mélangé à chaque groupe, donc un choix réfléchi se répartit sur les quatre emplacements (environ 25 % chacun).",
    },
  ];

  const sortedByNet = [...DISC_KEYS].sort((a, b) => net[b] - net[a]);
  const [p1, p2] = sortedByNet;
  const pct: Record<DiscKey, number> = {
    D: (net.D + N) / (2 * N),
    I: (net.I + N) / (2 * N),
    S: (net.S + N) / (2 * N),
    C: (net.C + N) / (2 * N),
  };

  let tag: string;
  let title: string;
  let summary: string;
  if (spread <= 12) {
    tag = "Profil équilibré";
    title = "Tu t'adaptes à chaque situation";
    summary = `Tes quatre styles sont proches : tu passes facilement de l'un à l'autre selon le contexte. Ton style le plus présent reste ${labelFor(p1)}.`;
  } else if (net[p2] >= 0 && net[p1] - net[p2] <= 10) {
    const comboKey = [p1, p2].sort((a, b) => DISC_KEYS.indexOf(a) - DISC_KEYS.indexOf(b)).join("");
    tag = `Style ${p1}${p2}`;
    title = `${labelFor(p1)}, nuancé ${labelFor(p2).toLowerCase()}`;
    summary = def.combos[comboKey] ?? def.report.dimensions[p1]?.bands.High ?? "";
  } else {
    tag = `Style ${p1}`;
    title = lang === "en" ? `Your dominant style: ${labelFor(p1)}` : `Ton style dominant : ${labelFor(p1)}`;
    summary = def.report.dimensions[p1]?.bands.High ?? "";
  }

  const dimensionResults = DISC_KEYS.map((k) => {
    const entry = def.report.dimensions[k];
    return {
      code: k,
      label: labelFor(k),
      scorePercent: pct[k],
      strengths: entry?.strengths ?? "",
      suitableWork: entry?.suitableWork ?? "",
      tips: entry?.tips ?? "",
    };
  }).sort((a, b) => b.scorePercent - a.scorePercent);

  return {
    tag,
    title,
    summary,
    dominant: p1,
    secondary: p2,
    net,
    dimensionResults,
    reliability: {
      index,
      label: reliabilityLabel,
      text: reliabilityText,
      indicators,
      contradictions: contraList,
    },
  };
}

// ---------------------------------------------------------------------------
// pcm_likert ("Six façons d'habiter sa vie" — base style vs. current phase)
// ---------------------------------------------------------------------------

const PCM_KEYS: PcmKey[] = ["emp", "tra", "per", "rev", "reb", "pro"];

export function scorePcm(def: PcmDefinition, answers: Record<string, PcmAnswer>) {
  const items = def.items;
  const labelFor = (k: PcmKey) => def.dimensions.find((d) => d.code === k)?.label ?? k;

  const baseSum: Record<PcmKey, number> = { emp: 0, tra: 0, per: 0, rev: 0, reb: 0, pro: 0 };
  const baseMax: Record<PcmKey, number> = { emp: 0, tra: 0, per: 0, rev: 0, reb: 0, pro: 0 };
  const phaseSum: Record<PcmKey, number> = { emp: 0, tra: 0, per: 0, rev: 0, reb: 0, pro: 0 };
  const phaseMax: Record<PcmKey, number> = { emp: 0, tra: 0, per: 0, rev: 0, reb: 0, pro: 0 };

  // For the reliability index: raw answer value per item index, in the
  // test's own presentation order, plus how long each one took.
  const values: (number | null)[] = [];
  const times: number[] = [];
  const twinValue: Record<string, { a?: number; b?: number; textA?: string; textB?: string }> = {};

  items.forEach((item) => {
    const answer = answers[String(item.id)];
    const sumTarget = item.block === "base" ? baseSum : phaseSum;
    const maxTarget = item.block === "base" ? baseMax : phaseMax;
    maxTarget[item.dimension] += 4;
    if (!answer) {
      values.push(null);
      return;
    }
    sumTarget[item.dimension] += answer.value;
    values.push(answer.value);
    times.push(answer.timeMs);
    if (item.twin) {
      const entry = twinValue[item.twin] ?? {};
      if (entry.a === undefined) {
        entry.a = answer.value;
      } else {
        entry.b = answer.value;
      }
      twinValue[item.twin] = entry;
    }
  });

  const basePct: Record<PcmKey, number> = { emp: 0, tra: 0, per: 0, rev: 0, reb: 0, pro: 0 };
  const phasePct: Record<PcmKey, number> = { emp: 0, tra: 0, per: 0, rev: 0, reb: 0, pro: 0 };
  for (const k of PCM_KEYS) {
    basePct[k] = baseMax[k] === 0 ? 0 : baseSum[k] / baseMax[k];
    phasePct[k] = phaseMax[k] === 0 ? 0 : phaseSum[k] / phaseMax[k];
  }

  const baseOrder = [...PCM_KEYS].sort((a, b) => basePct[b] - basePct[a]);
  const baseK = baseOrder[0];
  const phaseK = [...PCM_KEYS].sort((a, b) => phasePct[b] - phasePct[a])[0];
  const same = baseK === phaseK;
  const gap = Math.round((basePct[baseOrder[0]] - basePct[baseOrder[1]]) * 100);

  // 1. Agreement between twin reformulations (0-4 diff -> 0-100 score).
  const diffs: number[] = [];
  const clashes: { textPlus: string; textMinus: string }[] = [];
  for (const key of Object.keys(twinValue)) {
    const { a, b } = twinValue[key];
    if (a === undefined || b === undefined) continue;
    const d = Math.abs(a - b);
    diffs.push(d);
  }
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const meanDiff = diffs.length ? diffs.reduce((s, d) => s + d, 0) / diffs.length : 0;
  const accord = clamp(100 - (meanDiff / 4) * 100);

  // 2. Spread of answers used (over-reliance on one rung of the scale).
  const answered = values.filter((v): v is number => v !== null);
  const counts = [0, 0, 0, 0, 0];
  let run = 1;
  let maxRun = 1;
  answered.forEach((v, i) => {
    counts[v] += 1;
    if (i > 0) {
      run = answered[i] === answered[i - 1] ? run + 1 : 1;
      if (run > maxRun) maxRun = run;
    }
  });
  const distinct = counts.filter((c) => c > 0).length;
  const topShare = answered.length ? Math.max(...counts) / answered.length : 0;
  const variete = clamp(
    100 - Math.max(0, maxRun - 5) * 10 - Math.max(0, topShare - 0.45) * 160 - (5 - distinct) * 10
  );

  // 3. Pace: median time per item (very fast answers suggest skimming).
  const sortedTimes = [...times].sort((a, b) => a - b);
  const med = sortedTimes.length ? sortedTimes[Math.floor(sortedTimes.length / 2)] : 0;
  const rythme = med >= 2200 ? 100 : clamp((med / 2200) * 100);

  // 4. Acquiescence bias: always agreeing or always refusing.
  const mean = answered.length ? answered.reduce((s, v) => s + v, 0) / answered.length : 2;
  const equilibre = clamp(100 - Math.abs(mean - 2) * 40);

  const globalIndex = clamp(accord * 0.45 + variete * 0.2 + rythme * 0.15 + equilibre * 0.2);

  const [reliabilityLabel, reliabilityText] =
    globalIndex >= 80
      ? [
          "Résultat solide",
          "Tu as répondu de façon stable, variée et à un rythme normal. Le classement des six profils tient debout.",
        ]
      : globalIndex >= 60
        ? [
            "Résultat exploitable",
            "Rien d'alarmant, mais un ou deux indicateurs tirent vers le bas. Regarde lequel avant de prendre l'ordre des profils au pied de la lettre.",
          ]
        : globalIndex >= 40
          ? [
              "À interpréter avec prudence",
              "Certaines réponses se contredisent ou manquent de variété. Le profil donne une tendance, pas une certitude.",
            ]
          : [
              "Peu exploitable",
              "Refaire le test au calme, un autre jour, donnerait probablement un résultat plus net.",
            ];

  const indicators = [
    {
      tier: reliabilityTier(accord / 100),
      title: `Accord entre affirmations jumelles : écart moyen de ${(meanDiff).toFixed(1)} / 4`,
      text: "Chaque idée est mesurée deux fois, avec des mots différents. Un grand écart entre les deux réponses signale soit une hésitation réelle, soit une réponse donnée trop vite.",
    },
    {
      tier: reliabilityTier(variete / 100),
      title: `Variété des réponses : plus longue série identique de ${maxRun}`,
      text: "Utiliser toute l'échelle donne un profil qui discrimine vraiment entre les six styles ; rester sur le même niveau partout aplatit les écarts.",
    },
    {
      tier: reliabilityTier(rythme / 100),
      title: `Rythme : ${Math.round(med / 100) / 10} s par affirmation en médiane`,
      text: "Un rythme de lecture normal indique que chaque phrase a été lue avant d'être notée, pas seulement parcourue.",
    },
    {
      tier: reliabilityTier(equilibre / 100),
      title: `Équilibre des réponses : moyenne de ${(mean + 1).toFixed(1)} / 5`,
      text: "Approuver ou refuser presque toutes les affirmations écrase les écarts entre les six styles ; le profil se lit mieux quand les réponses varient.",
    },
  ];

  const dimensionResults = PCM_KEYS.map((k) => ({
    code: k,
    label: labelFor(k),
    basePercent: basePct[k],
    phasePercent: phasePct[k],
    ...def.types[k],
  })).sort((a, b) => b.basePercent - a.basePercent);

  const baseType = def.types[baseK];
  const phaseType = def.types[phaseK];
  const phaseInfo = def.phase[phaseK];

  const summary = same
    ? `Ta base est ${baseType.name}, et tu vis toujours au même étage : ce dont tu as besoin aujourd'hui est ce dont tu as toujours eu besoin.`
    : `Ta base est ${baseType.name}, mais tu vis en ce moment dans un registre plus ${phaseType.name.toLowerCase()}. Tu perçois le monde comme avant, mais tes besoins du moment ont changé.`;

  return {
    baseKey: baseK,
    phaseKey: phaseK,
    same,
    gap,
    summary,
    baseType,
    phaseType,
    phaseInfo,
    dimensionResults,
    reliability: {
      index: globalIndex,
      label: reliabilityLabel,
      text: reliabilityText,
      indicators,
      contradictions: clashes,
    },
  };
}

// --- logic_mcq ("Le Test des 8 Logiques") -----------------------------------

function logicBand(score: number): [string, string] {
  if (score >= 27) return ["Niveau très supérieur", "Performance rare sur ce format : tu maîtrises les huit familles d'items."];
  if (score >= 22) return ["Niveau supérieur", "Au-dessus de ce qu'obtient la majorité des candidats préparés."];
  if (score >= 16) return ["Moyenne haute", "Base solide ; les points perdus se concentrent en général sur un ou deux domaines."];
  if (score >= 11) return ["Dans la moyenne", "Les mécanismes sont là, la régularité et la vitesse manquent encore."];
  return ["À consolider", "Reprenez domaine par domaine : ce sont des méthodes qui s'apprennent, pas un plafond."];
}

export function scoreLogicMcq(def: LogicMcqDefinition, answers: Record<string, number>) {
  const perDomain: Record<string, { ok: number; total: number }> = {};
  let score = 0;

  const review = def.items.map((item) => {
    const given = answers[String(item.id)] ?? null;
    const isCorrect = given === item.correctIndex;
    if (isCorrect) score++;

    const bucket = perDomain[item.domain] ?? { ok: 0, total: 0 };
    bucket.total++;
    if (isCorrect) bucket.ok++;
    perDomain[item.domain] = bucket;

    return {
      id: item.id,
      domain: item.domain,
      question: item.question,
      series: item.series,
      figure: item.figure,
      grid: item.grid,
      options: item.options,
      correctIndex: item.correctIndex,
      givenIndex: given,
      isCorrect,
      explanation: item.explanation,
    };
  });

  const dimensionResults = Object.entries(def.domains).map(([code, label]) => {
    const bucket = perDomain[code] ?? { ok: 0, total: 0 };
    return {
      code,
      label,
      ok: bucket.ok,
      total: bucket.total,
      scorePercent: bucket.total > 0 ? bucket.ok / bucket.total : 0,
    };
  });

  const [band, bandText] = logicBand(score);

  return {
    score,
    total: def.items.length,
    scorePercent: score / def.items.length,
    band,
    bandText,
    dimensionResults,
    review,
  };
}

// --- career_balance ("Salarié ou entrepreneur ?") ---------------------------
// Raw per-axis contributions run 1-4 (pair) or 1-5 (likert); three items per
// axis give a raw range of [3, 13], stretched to the displayed [4, 20] scale
// with the same round(4 + (raw-3)/10*16) the source widget used.
function scaleAxisRaw(raw: number): number {
  return Math.round(4 + ((raw - 3) / 10) * 16);
}

export function scoreCareerBalance(
  def: CareerBalanceDefinition,
  answers: Record<string, number>
) {
  const rawByAxis: Record<string, number> = {};
  for (const item of def.items) {
    const v = answers[String(item.id)];
    let contribution: number;
    if (item.kind === "pair") {
      const val = v || 2.5;
      contribution = item.flip ? 5 - val : val;
    } else {
      const val = v || 3;
      contribution = item.reverse ? 6 - val : val;
    }
    rawByAxis[item.axis] = (rawByAxis[item.axis] ?? 0) + contribution;
  }

  const axisResults = def.axes.map((axis) => {
    const score = scaleAxisRaw(rawByAxis[axis.key] ?? 3);
    const band: "lo" | "mid" | "hi" = score <= 9 ? "lo" : score >= 15 ? "hi" : "mid";
    return {
      code: axis.key,
      label: axis.name,
      short: axis.short,
      description: axis.description,
      score,
      band,
      text: band === "lo" ? axis.lowText : band === "hi" ? axis.hiText : axis.midText,
    };
  });

  const total = axisResults.reduce((s, a) => s + a.score, 0);
  const profile =
    def.profiles.find((p) => total >= p.min && total <= p.max) ?? def.profiles[0];

  let leftWeight = 0;
  let rightWeight = 0;
  const towardSalariat: typeof axisResults = [];
  const towardIndependance: typeof axisResults = [];
  const inSuspense: typeof axisResults = [];
  axisResults.forEach((a) => {
    if (a.score < 12) leftWeight += 12 - a.score;
    else if (a.score > 12) rightWeight += a.score - 12;
    if (a.band === "lo") towardSalariat.push(a);
    else if (a.band === "hi") towardIndependance.push(a);
    else inSuspense.push(a);
  });

  const byCode = Object.fromEntries(axisResults.map((a) => [a.code, a.score]));
  const flags: string[] = [];
  if (byCode.initiative <= 9) {
    flags.push(
      "Votre axe Initiative est le point faible du profil. Un indépendant qui ne sait pas aller chercher ses clients ne tient pas, quelle que soit la qualité de son travail. C'est la compétence à travailler en priorité, avant toute décision de statut."
    );
  }
  if (byCode.cadre >= 18) {
    flags.push(
      "Votre rapport au cadre est très tranché. C'est un atout pour démarrer seul, un risque pour faire grandir quelque chose : déléguer et s'associer supposent d'accepter qu'on fasse autrement que vous."
    );
  }
  if (byCode.securite <= 9 && byCode.autonomie >= 15 && byCode.resilience >= 15) {
    flags.push(
      "Autonomie et résilience élevées, mais besoin de sécurité financière fort : la nuance intrapreneur vous concerne, même si votre score global pointe ailleurs. Une création progressive, à côté d'un revenu stable, correspond mieux à ce mélange qu'un saut brutal."
    );
  }
  if (byCode.incertitude <= 9 && total >= 80) {
    flags.push(
      "Appétence globale forte mais faible tolérance à l'incertitude : vous voulez l'indépendance sans le flou qui l'accompagne. Avancez par jalons courts et vérifiables, sinon l'attente de visibilité vous paralysera."
    );
  }
  if (byCode.resilience <= 9) {
    flags.push(
      "Votre score de résilience est bas. L'indépendance expose à un volume de refus sans commune mesure avec le salariat ; sans capacité de rebond, l'usure arrive avant les résultats."
    );
  }
  if (axisResults.every((a) => a.score >= 10 && a.score <= 14)) {
    flags.push(
      "Profil très peu tranché : aucun axe ne ressort. Les paires étaient conçues pour vous forcer à pencher — un résultat aussi plat signale souvent un vrai équilibre, parfois des choix faits au hasard. Un second passage le dira."
    );
  }

  return {
    total,
    axisResults,
    profile,
    balance: {
      leftWeight,
      rightWeight,
      towardSalariat,
      towardIndependance,
      inSuspense,
    },
    flags,
  };
}

// --- sosie_v2 (8 traits + 12 values, tetrads + triads, ipsatif) ------------
// Mirrors the source spreadsheet's own formulas: score brut = "+" picks
// minus "−" picks per dimension (each dimension is proposed exactly 8 times
// across its scored items), stretched to a 0-1 index with
// (raw + timesProposed) / (2 * timesProposed). Reliability recomputes the
// spreadsheet's "Contrôle qualité" tab: test-retest stability on the 5
// duplicated control groups, position bias, and social-desirability bias.

export function scoreSosie(def: SosieDefinition, answers: Record<string, SosieAnswer>) {
  const scoredItems = def.items.filter((it) => !it.isControl);

  const timesProposed: Record<string, number> = {};
  const plusCount: Record<string, number> = {};
  const minusCount: Record<string, number> = {};
  for (const item of scoredItems) {
    for (const opt of item.options) {
      timesProposed[opt.dimension] = (timesProposed[opt.dimension] ?? 0) + 1;
    }
    const answer = answers[String(item.id)];
    if (!answer) continue;
    const plusOpt = item.options.find((o) => o.key === answer.most);
    const minusOpt = item.options.find((o) => o.key === answer.least);
    if (plusOpt) plusCount[plusOpt.dimension] = (plusCount[plusOpt.dimension] ?? 0) + 1;
    if (minusOpt) minusCount[minusOpt.dimension] = (minusCount[minusOpt.dimension] ?? 0) + 1;
  }

  function dimensionResult(dim: { code: string; label: string; description: string }) {
    const proposed = timesProposed[dim.code] ?? 0;
    const raw = (plusCount[dim.code] ?? 0) - (minusCount[dim.code] ?? 0);
    const scorePercent = proposed > 0 ? (raw + proposed) / (2 * proposed) : 0.5;
    return { code: dim.code, label: dim.label, description: dim.description, raw, proposed, scorePercent };
  }

  const traitResults = def.traitDimensions.map(dimensionResult);
  const personalValueResults = def.valueDimensions
    .filter((d) => d.group === "personal")
    .map(dimensionResult);
  const interpersonalValueResults = def.valueDimensions
    .filter((d) => d.group === "interpersonal")
    .map(dimensionResult);

  const byCode = Object.fromEntries(
    [...traitResults, ...personalValueResults, ...interpersonalValueResults].map((d) => [
      d.code,
      d.scorePercent,
    ])
  );
  const synthesisResults = def.synthesisAxes.map((axis) => ({
    name: axis.name,
    scorePercent:
      axis.codes.reduce((s, code) => s + (byCode[code] ?? 0.5), 0) / axis.codes.length,
  }));

  // --- Reliability -----------------------------------------------------
  // 1. Test-retest stability: each control item exactly duplicates a scored
  // item elsewhere in the test. A "stable" respondent picks the same most/
  // least on both.
  let stableChecks = 0;
  let stableMatches = 0;
  for (const item of def.items) {
    if (!item.isControl || item.controlOf === null) continue;
    const original = answers[String(item.controlOf)];
    const dup = answers[String(item.id)];
    if (!original || !dup) continue;
    stableChecks += 2;
    if (original.most === dup.most) stableMatches += 1;
    if (original.least === dup.least) stableMatches += 1;
  }
  const stabilityScore = stableChecks > 0 ? stableMatches / stableChecks : 0.5;

  // 2. Position bias: options are shuffled per group, so a considered answer
  // should land on "A" only as often as chance allows (~25-33%). The source
  // sheet flags anything above 45%.
  const mostPicks = scoredItems
    .map((item) => answers[String(item.id)]?.most)
    .filter((v): v is SosieOptionKey => Boolean(v));
  const posShareA = mostPicks.length > 0 ? mostPicks.filter((v) => v === "A").length / mostPicks.length : 0;
  const positionScore = Math.max(0, Math.min(1, 1 - Math.max(0, posShareA - 0.3) / (0.45 - 0.3)));

  // 3. Social-desirability bias: each trait tetrad mixes 2 valorized and 2
  // less-valorized statements. Picking the valorized one far more than
  // chance (>13 of 16) suggests the respondent followed the statements'
  // apparent appeal rather than describing themselves.
  const traitScored = scoredItems.filter((it) => it.block === "trait");
  const desirablePicks = traitScored.filter((item) => {
    const answer = answers[String(item.id)];
    const opt = item.options.find((o) => o.key === answer?.most);
    return opt?.desirable === true;
  }).length;
  const desirableShare = traitScored.length > 0 ? desirablePicks / traitScored.length : 0.5;
  const desirabilityScore = Math.max(
    0,
    Math.min(1, 1 - Math.max(0, desirableShare - 0.5) / (13 / 16 - 0.5))
  );

  const reliabilityIndex = Math.round(
    100 * (0.5 * stabilityScore + 0.25 * positionScore + 0.25 * desirabilityScore)
  );

  const [reliabilityLabel, reliabilityText] =
    reliabilityIndex >= 70
      ? ["Résultat fiable", "Les réponses sont cohérentes d'un bout à l'autre du test. Le profil peut être interprété avec confiance."]
      : reliabilityIndex >= 45
        ? ["À interpréter avec prudence", "Certains signaux de cohérence sont moyens. Le profil donne une tendance, à confirmer lors d'un échange."]
        : ["Résultat peu fiable", "Les réponses sont trop instables ou trop marquées par l'attrait apparent des énoncés pour dégager un profil solide. Il est conseillé de refaire le test au calme."];

  const indicators = [
    {
      tier: reliabilityTier(stabilityScore),
      title: `Stabilité test-retest : ${stableMatches} réponse${stableMatches > 1 ? "s" : ""} identique${stableMatches > 1 ? "s" : ""} sur ${stableChecks}`,
      text: "5 groupes de ce test sont des copies exactes de groupes déjà posés ailleurs, insérées sans signalement. Répondre pareil aux deux exemplaires signale des choix réfléchis, pas au hasard.",
    },
    {
      tier: reliabilityTier(positionScore),
      title: `Réponses en automatique : ${Math.round(posShareA * 100)} % des choix « + » en première position`,
      text: "L'ordre des affirmations est tiré au sort à chaque groupe, donc un choix réfléchi se répartit sur toutes les positions plutôt que de se concentrer sur la première.",
    },
    {
      tier: reliabilityTier(desirabilityScore),
      title: `Désirabilité sociale : ${desirablePicks} affirmation${desirablePicks > 1 ? "s" : ""} valorisée${desirablePicks > 1 ? "s" : ""} choisie${desirablePicks > 1 ? "s" : ""} sur ${traitScored.length}`,
      text: "Chaque groupe de personnalité combine des affirmations à l'attrait comparable. Choisir presque systématiquement la plus flatteuse suggère une image lissée plutôt qu'une description sincère.",
    },
  ];

  return {
    traitResults,
    personalValueResults,
    interpersonalValueResults,
    synthesisResults,
    reliability: {
      index: reliabilityIndex,
      label: reliabilityLabel,
      text: reliabilityText,
      indicators,
      contradictions: [] as unknown[],
    },
  };
}

// --- orientation_riasec ("Boussole" — RIASEC career orientation) -----------
// Mirrors the source widget's own formulas verbatim: pct(sum,n) turns a
// 1-5 Likert sum into a 0-100 index, and the job-match score is a weighted
// blend of interest/mastery (via the job's 3-letter RIASEC code) and field
// taste, with a handful of value-driven bonuses/penalties. Audience only
// changes displayed text and a small reconversion bonus on job scores, so
// both variants are computed once here and the client just switches views.

function orientationPct(sum: number, n: number): number {
  return n > 0 ? Math.round(((sum - n) / (4 * n)) * 100) : 0;
}

function scoreJob(
  job: OrientationJob,
  I: Record<RiasecKey, number>,
  C: Record<RiasecKey, number>,
  taste: Record<string, number>,
  val: Record<OrientationValueKey, number>,
  audience: "lyc" | "adu"
) {
  const [a, b, c] = job.code.split("") as RiasecKey[];
  const base = (3 * I[a] + 2 * I[b] + I[c]) / 6;
  const skl = (3 * C[a] + 2 * C[b] + C[c]) / 6;
  const gout = taste[job.univers] ?? 50;
  let sc = 0.58 * base + 0.15 * skl + 0.27 * gout;
  const notes: string[] = [];
  if (gout >= 75) notes.push("un domaine qui vous attire");
  if (job.tags.includes("utile") && val.uti >= 70) {
    sc += 6;
    notes.push("répond à votre besoin d'utilité");
  }
  if (job.tags.includes("indep") && val.aut >= 70) {
    sc += 5;
    notes.push("compatible avec votre besoin d'autonomie");
  }
  if (job.tags.includes("tension") && val.sec >= 70) {
    sc += 5;
    notes.push("marché de l'emploi favorable");
  }
  if (job.tags.includes("reconv") && audience === "adu") sc += 4;
  if (job.tags.includes("horaires") && val.equ >= 70) {
    sc -= 9;
    notes.push("⚠ rythme difficile à concilier avec l'équilibre que vous recherchez");
  }
  if (job.level >= 5 && val.rem >= 75) sc += 2;
  return {
    name: job.name,
    univers: job.univers,
    code: job.code,
    level: job.level,
    description: job.description,
    tags: job.tags,
    notes,
    score: Math.max(0, Math.min(100, Math.round(sc))),
  };
}

export function scoreOrientation(
  def: OrientationDefinition,
  answers: Record<string, number>
) {
  const RIASEC: RiasecKey[] = ["R", "I", "A", "S", "E", "C"];
  const interestSum: Record<string, number> = {};
  const interestCount: Record<string, number> = {};
  const masterySum: Record<string, number> = {};
  const masteryCount: Record<string, number> = {};
  const valueSum: Record<string, number> = {};
  const valueCount: Record<string, number> = {};
  const taste: Record<string, number> = {};

  for (const item of def.items) {
    const v = answers[String(item.id)];
    if (!v) continue;
    if (item.part === "interest") {
      interestSum[item.dimension] = (interestSum[item.dimension] ?? 0) + v;
      interestCount[item.dimension] = (interestCount[item.dimension] ?? 0) + 1;
    } else if (item.part === "skill") {
      masterySum[item.dimension] = (masterySum[item.dimension] ?? 0) + v;
      masteryCount[item.dimension] = (masteryCount[item.dimension] ?? 0) + 1;
    } else if (item.part === "value") {
      valueSum[item.valeur] = (valueSum[item.valeur] ?? 0) + v;
      valueCount[item.valeur] = (valueCount[item.valeur] ?? 0) + 1;
    } else if (item.part === "taste") {
      taste[item.univers] = Math.round(((v - 1) / 4) * 100);
    }
  }

  const I = {} as Record<RiasecKey, number>;
  const C = {} as Record<RiasecKey, number>;
  RIASEC.forEach((k) => {
    I[k] = orientationPct(interestSum[k] ?? 0, interestCount[k] ?? 0);
    C[k] = orientationPct(masterySum[k] ?? 0, masteryCount[k] ?? 0);
  });
  const val = {} as Record<OrientationValueKey, number>;
  def.values.forEach((v) => {
    val[v.key] = orientationPct(valueSum[v.key] ?? 0, valueCount[v.key] ?? 0);
  });
  def.items
    .filter((it) => it.part === "taste")
    .forEach((it) => {
      if (it.part === "taste" && taste[it.univers] === undefined) taste[it.univers] = 50;
    });

  const domainResults = def.types
    .map((t) => ({
      code: t.key,
      label: t.name,
      competenceLabel: t.competenceLabel,
      tag: t.tag,
      color: t.color,
      interestPercent: I[t.key],
      masteryPercent: C[t.key],
    }))
    .sort((a, b) => b.interestPercent - a.interestPercent);

  const top3 = domainResults.slice(0, 3);
  const topCode = top3.map((d) => d.code).join("");

  const appuiCodes = domainResults.filter((d) => d.interestPercent >= 60 && d.masteryPercent >= 60).map((d) => d.code);
  const devCodes = domainResults.filter((d) => d.interestPercent >= 60 && d.masteryPercent < 50).map((d) => d.code);
  const cacheCodes = domainResults.filter((d) => d.masteryPercent >= 65 && d.interestPercent < 45).map((d) => d.code);

  const valueResults = def.values
    .map((v) => ({ code: v.key, label: v.name, percent: val[v.key] }))
    .sort((a, b) => b.percent - a.percent);
  const valueAdviceTop = valueResults.slice(0, 3).map((v) => ({
    ...v,
    textLyc: def.valueAdvice[v.code]?.lyc ?? "",
    textAdu: def.valueAdvice[v.code]?.adu ?? "",
  }));
  const valueLowLabel = valueResults
    .slice(-2)
    .map((v) => v.label.toLowerCase())
    .join(" et ");

  const tasteResults = def.items
    .filter((it): it is Extract<typeof it, { part: "taste" }> => it.part === "taste")
    .map((it) => ({ univers: it.univers, label: it.text, percent: taste[it.univers] ?? 50 }))
    .sort((a, b) => b.percent - a.percent);

  const profileSections = top3.map((d, rank) => {
    const p = def.profiles[d.code];
    return {
      code: d.code,
      rank,
      label: d.label,
      tag: d.tag,
      interestPercent: d.interestPercent,
      desc: p?.desc ?? "",
      env: p?.env ?? "",
      metiers: p?.metiers ?? [],
      formationsLyc: p?.lyc ?? [],
      formationsAdu: p?.adu ?? [],
    };
  });

  function comboText(audience: "lyc" | "adu") {
    const [a, b, c] = top3;
    const key1 = [a.code, b.code].sort().join("");
    const desc = def.combos[key1] ?? "une combinaison peu courante, qui mérite d'être explorée métier par métier";
    const fin =
      audience === "lyc"
        ? "Concrètement : cherchez des formations qui touchent ces deux dimensions plutôt qu'une seule. Les parcours trop étroits vous frustreront."
        : "Concrètement : cherchez un métier qui réutilise ces deux dimensions. Les reconversions qui tiennent sont rarement des ruptures totales, ce sont des recompositions.";
    return `Votre dominante est ${a.label.toLowerCase()}, soutenue par ${b.label.toLowerCase()}. Ce couple dessine ${desc}. La troisième dominante, ${c.label.toLowerCase()}, est la couleur que vous donnerez à ce métier plus qu'elle n'en change la nature. ${fin}`;
  }

  function jobsFor(audience: "lyc" | "adu") {
    return def.jobs
      .map((j) => scoreJob(j, I, C, taste, val, audience))
      .sort((a, b) => b.score - a.score);
  }
  const jobsLyc = jobsFor("lyc");
  const jobsAdu = jobsFor("adu");

  function universFor(jobs: ReturnType<typeof jobsFor>) {
    const byUnivers: Record<string, number[]> = {};
    jobs.forEach((j) => {
      (byUnivers[j.univers] ??= []).push(j.score);
    });
    return Object.entries(byUnivers)
      .map(([univers, scores]) => {
        const top = [...scores].sort((a, b) => b - a).slice(0, 3);
        return {
          univers,
          label: def.universLabels[univers] ?? univers,
          score: Math.round(top.reduce((s, v) => s + v, 0) / top.length),
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  return {
    domainResults,
    topCode,
    top3: top3.map((d) => d.code),
    appuiCodes,
    devCodes,
    cacheCodes,
    valueResults,
    valueAdviceTop,
    valueLowLabel,
    tasteResults,
    profileSections,
    comboLyc: comboText("lyc"),
    comboAdu: comboText("adu"),
    jobsLyc,
    jobsAdu,
    universLyc: universFor(jobsLyc),
    universAdu: universFor(jobsAdu),
    actionLyc: def.actionPlan.lyc,
    actionAdu: def.actionPlan.adu,
    universLabels: def.universLabels,
  };
}
