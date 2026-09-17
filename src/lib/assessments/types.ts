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
