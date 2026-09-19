// Shapes of the `test_content.definition` JSON for each rich assessment
// format. These mirror the FlyUp *_fr.json / *_en.json files almost
// verbatim — see content/flyup/README.md for where they come from and
// docs/iOS_Implementation_Guide.md (delivered alongside the original files)
// for the reference scoring logic this port follows.

export type Dimension = { code: string; label: string };

export type ReportBands = { Low: string; Mid: string; High: string };

export type DimensionReportEntry = {
  bands: ReportBands;
  strengths: string;
  suitableWork: string;
  tips: string;
};

export type BandedReport = {
  description?: string;
  bandThresholds: { lowBelow: number; midUpTo: number };
  dimensions: Record<string, DimensionReportEntry>;
};

// --- forced_choice_pair (SOSIE 2 style) -------------------------------------

export type ForcedChoicePairItem = {
  id: number;
  isControl: boolean;
  controlOf: number | null;
  statementA: { text: string; dimension: string };
  statementB: { text: string; dimension: string };
};

export type ForcedChoicePairDefinition = {
  meta: { title: string; totalItems: number; controlItems: number; disclaimer: string };
  dimensions: Dimension[];
  items: ForcedChoicePairItem[];
  report: BandedReport;
};

// --- forced_choice_quad (ADAPT style) ---------------------------------------

export type ForcedChoiceQuadItem = {
  id: number;
  isControl: boolean;
  controlOf: number | null;
  options: { key: "A" | "B" | "C" | "D"; text: string; dimension: string }[];
};

export type ForcedChoiceQuadDefinition = {
  meta: { title: string; totalItems: number; controlItems: number; disclaimer: string };
  dimensions: Dimension[];
  items: ForcedChoiceQuadItem[];
  report: BandedReport;
};

// --- situational_judgment (TD12 style) --------------------------------------

export type SituationalJudgmentItem = {
  id: number;
  isControl: boolean;
  controlOf: number | null;
  dimension: string;
  situation: string;
  options: { key: "A" | "B" | "C" | "D"; text: string; rank: number }[];
};

export type SituationalJudgmentDefinition = {
  meta: { title: string; totalItems: number; controlItems: number; disclaimer: string };
  dimensions: Dimension[];
  items: SituationalJudgmentItem[];
  report: BandedReport;
};

// --- likert_scale (BP360 style) ---------------------------------------------

export type LikertScaleStep = { label: string; value: number };
export type LikertDimension = { key: string; name: string; questionRange: [number, number] };
export type LikertLevel = { maxPercent: number; label: string };
export type LikertItem = { id: number; dimension: string; text: string };
export type LikertProfile = {
  name: string;
  dominantDimensions: string[]; // dimension *names*, not keys
  description: string;
};

export type LikertScaleDefinition = {
  testId: string;
  title: string;
  instructions: string;
  scale: LikertScaleStep[];
  dimensions: LikertDimension[];
  levels: LikertLevel[];
  items: LikertItem[];
  profiles: LikertProfile[];
  // Optional: banded narrative text (strengths / suitable roles / tips) per
  // dimension, keyed by dimension `key`. When present, the result page shows
  // a written explanation of each dimension's score, not just a level label.
  report?: BandedReport;
};

// --- bipolar_pairs (Test 50 style) ------------------------------------------

export type BipolarScaleStep = { value: number; anchor: "left" | "neutral" | "right"; label: string };
// `letter` is optional: when every dimension's poles carry one, the scorer
// concatenates the winning letter of each dimension (in `dimensions` order)
// into a type code and looks it up in `typeCatalog` below.
// `trait` is optional too: when a pole carries one, the scorer reports that
// word as the dimension's tendency instead of the pole label with a
// "(modéré)"/"(marqué)" intensity suffix.
export type BipolarPole = { label: string; description: string; letter?: string; trait?: string };
export type BipolarDimension = {
  key: string;
  name: string;
  poleA: BipolarPole;
  poleB: BipolarPole;
  // "Amarque" | "Amodere" | "equilibre" | "Bmodere" | "Bmarque" -> text
  report: Record<string, string>;
};
export type BipolarItem = {
  id: number;
  dimension: string;
  left: { text: string; pole: "A" | "B" };
  right: { text: string; pole: "A" | "B" };
};

export type BipolarType = {
  name: string;
  description: string;
  strengths: string;
  watchOut: string;
};

// --- disc_quad (DISC style: pick most-like-me AND least-like-me) ----------

export type DiscKey = "D" | "I" | "S" | "C";

export type DiscOption = {
  key: "A" | "B" | "C" | "D";
  text: string;
  dimension: DiscKey;
  // Every statement exists twice, in different formulations, testing the
  // same underlying trait (0-39 per dimension) — `trait` links a statement
  // to its twin elsewhere in the item list, for the consistency check.
  trait: number;
  phrasing: "a" | "b";
};

export type DiscItem = { id: number; options: DiscOption[] };

export type DiscDefinition = {
  meta: { title: string; totalItems: number; optionsPerItem: number; disclaimer: string };
  dimensions: Dimension[];
  items: DiscItem[];
  report: BandedReport;
  // Two-letter combos (sorted D<I<S<C, e.g. "DI") for a nuanced dominant pair.
  combos: Record<string, string>;
};

// An answer for a disc_quad item: which statement is most ("plus") and
// least ("minus") like the respondent, plus how long they took (ms) — used
// only by the reliability breakdown, never by the D/I/S/C scoring itself.
export type DiscAnswer = {
  plus: "A" | "B" | "C" | "D" | null;
  minus: "A" | "B" | "C" | "D" | null;
  timeMs: number;
};

export type BipolarPairsDefinition = {
  testId: string;
  title: string;
  instructions: string;
  responseScale: BipolarScaleStep[];
  report: { intro: string; outro: string };
  dimensions: BipolarDimension[];
  items: BipolarItem[];
  // Optional: when the four (or more) dimensions each carry a `letter` on
  // their poles, this maps the resulting code (e.g. "INTJ") to a named type.
  typeCatalog?: Record<string, BipolarType>;
};

// --- pcm_likert ("Six façons d'habiter sa vie" — Process Communication) ---

export type PcmKey = "emp" | "tra" | "per" | "rev" | "reb" | "pro";

export type PcmItem = {
  id: number;
  dimension: PcmKey;
  text: string;
  // Pairs of items sharing the same `twin` value are reformulations of the
  // same idea — comparing the two answers is how the reliability check
  // detects contradictions.
  twin: string | null;
  block: "base" | "phase";
};

export type PcmTypeEntry = {
  name: string;
  perception: string;
  quotidien: string;
  talents: string;
  besoin: string;
  stress: string;
  aide: string;
  citation: string;
};

export type PcmPhaseEntry = { besoin: string; signal: string; demande: string };

export type PcmDefinition = {
  meta: { title: string; totalItems: number; baseCount: number; phaseCount: number; disclaimer: string };
  dimensions: Dimension[];
  items: PcmItem[];
  types: Record<PcmKey, PcmTypeEntry>;
  phase: Record<PcmKey, PcmPhaseEntry>;
  scale: { value: number; label: string }[];
};

// One answer per item: the picked scale value (0-4) and how long it took
// (ms) — timing feeds the same kind of reliability index as the DISC test.
export type PcmAnswer = { value: number; timeMs: number };

// --- logic_mcq ("Le Test des 8 Logiques") -----------------------------------

export type LogicMcqOption = { text?: string; svg?: string };

export type LogicMcqItem = {
  id: number;
  domain: string; // key into LogicMcqDefinition["domains"]
  question: string;
  series: string | null; // a number/letter sequence shown under the question, if any
  figure: string | null; // an SVG shown above the options, if any
  grid: boolean; // render options as a 4-up grid (figure-based answers) instead of a list
  options: LogicMcqOption[];
  correctIndex: number;
  explanation: string;
};

export type LogicMcqDefinition = {
  meta: { title: string; totalItems: number; durationSeconds: number; disclaimer: string };
  domains: Record<string, string>;
  items: LogicMcqItem[];
};

// --- career_balance ("Salarié ou entrepreneur ?") ---------------------------
// Six axes, each scored from a mix of forced-lean pairs (1-4, no neutral
// option) and single-statement agreement items (1-5) — unlike bipolar_pairs
// (pure paired opposites) or likert_scale (uniform 1-5), this format scores
// one axis from both shapes at once, then sums the six axis scores into a
// single 24-120 "appétence" total that picks the profile band.

export type CareerBalanceAxis = {
  key: string;
  name: string;
  short: string;
  description: string;
  lowText: string;
  midText: string;
  hiText: string;
};

export type CareerBalancePairItem = {
  id: number;
  kind: "pair";
  axis: string;
  textA: string;
  textB: string;
  // When true, picking "B" is the pole-A-scoring direction (i.e. the raw
  // value fed to the axis total is 5 - pickedValue instead of pickedValue).
  flip: boolean;
};

export type CareerBalanceLikertItem = {
  id: number;
  kind: "likert";
  axis: string;
  text: string;
  // When true, agreeing (5) scores toward pole A (salariat), so the raw
  // value fed to the axis total is 6 - pickedValue instead of pickedValue.
  reverse: boolean;
};

export type CareerBalanceItem = CareerBalancePairItem | CareerBalanceLikertItem;

export type CareerBalanceProfile = {
  min: number;
  max: number;
  name: string;
  body: string[];
};

export type CareerBalanceDefinition = {
  meta: { title: string; totalItems: number; disclaimer: string };
  axes: CareerBalanceAxis[];
  items: CareerBalanceItem[];
  profiles: CareerBalanceProfile[];
};

// --- sosie_v2 (SOSIE-2-style inventory: 8 traits + 12 values) --------------
// Two item shapes share one scoring logic: trait items are tetrads (pick
// most-like-me and least-like-me among 4), value items are triads (same,
// among 3). Both are "ipsatif" (dimensions compared within the profile, not
// to an external norm) and both carry a `desirable` flag per option (social-
// desirability balance) plus a handful of exact-duplicate control items
// (`isControl` / `controlOf`) used only for the test-retest reliability
// check — excluded from the dimension scoring itself.

export type SosieOptionKey = "A" | "B" | "C" | "D";

export type SosieOption = {
  key: SosieOptionKey;
  text: string;
  dimension: string;
  desirable: boolean;
};

export type SosieItem = {
  id: number;
  block: "trait" | "value";
  options: SosieOption[]; // 4 for "trait", 3 for "value"
  isControl: boolean;
  controlOf: number | null; // id of the original item this exactly duplicates
};

export type SosieDimension = {
  code: string;
  label: string;
  description: string;
  group: "trait" | "personal" | "interpersonal";
};

export type SosieSynthesisAxis = { name: string; codes: string[] };

export type SosieDefinition = {
  meta: {
    title: string;
    totalTraitItems: number;
    totalValueItems: number;
    disclaimer: string;
  };
  traitDimensions: SosieDimension[]; // 8
  valueDimensions: SosieDimension[]; // 12 (6 personal + 6 interpersonal)
  items: SosieItem[]; // 18 trait (16 scored + 2 control) + 35 value (32 scored + 3 control)
  synthesisAxes: SosieSynthesisAxis[]; // 4
};

// One answer per item: which option was picked as most-like-me and which as
// least-like-me (never the same one), plus response time for pacing checks.
export type SosieAnswer = {
  most: SosieOptionKey | null;
  least: SosieOptionKey | null;
  timeMs: number;
};

// --- orientation_riasec ("Boussole" — career orientation, RIASEC model) ---
// Four question blocks, each a 1-5 rating with its own scale wording:
// interests (36, one of 6 RIASEC types), tastes (18, one per professional
// field — a single item per field, not averaged), values (16, one of 8
// work values), skills (18, one of 6 RIASEC types again, self-rated
// mastery). Scoring produces an interest/mastery profile across the 6
// types plus a job-matching score against a fixed bank of jobs.

export type RiasecKey = "R" | "I" | "A" | "S" | "E" | "C";
export type OrientationValueKey = "sec" | "aut" | "rem" | "uti" | "equ" | "rec" | "app" | "var";
export type OrientationLevel = 0 | 2 | 3 | 5;
export type OrientationTag = "tension" | "horaires" | "indep" | "utile" | "reconv";

export type OrientationType = {
  key: RiasecKey;
  name: string;
  competenceLabel: string;
  tag: string;
  color: string;
};

export type OrientationValue = { key: OrientationValueKey; name: string };

export type OrientationItem =
  | { id: number; part: "interest"; dimension: RiasecKey; text: string }
  | { id: number; part: "taste"; univers: string; text: string }
  | { id: number; part: "value"; valeur: OrientationValueKey; text: string }
  | { id: number; part: "skill"; dimension: RiasecKey; text: string };

export type OrientationProfileEntry = {
  desc: string;
  env: string;
  metiers: string[];
  lyc: string[];
  adu: string[];
};

export type OrientationJob = {
  name: string;
  univers: string;
  code: string; // 3-letter RIASEC code, e.g. "REC"
  level: OrientationLevel;
  description: string;
  tags: OrientationTag[];
};

export type OrientationDefinition = {
  meta: { title: string; totalItems: number; disclaimer: string };
  types: OrientationType[]; // 6
  values: OrientationValue[]; // 8
  universLabels: Record<string, string>; // 18 field codes -> label
  levelLabels: Record<string, string>;
  tagLabels: Record<OrientationTag, string>;
  scaleLabels: { int: string[]; val: string[]; com: string[]; gou: string[] };
  items: OrientationItem[]; // 88
  profiles: Record<RiasecKey, OrientationProfileEntry>;
  valueAdvice: Record<OrientationValueKey, { lyc: string; adu: string }>;
  combos: Record<string, string>; // sorted 2-letter RIASEC pair -> description
  actionPlan: { lyc: string[]; adu: string[] };
  jobs: OrientationJob[]; // 122
};
