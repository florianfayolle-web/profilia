// Comparison groups (see supabase/schema.sql): which tests can be shared,
// group codes, and the minimal summary copied into a group when someone
// consents. Deliberately an allow-list: IQ, ADHD and HPI results are too
// sensitive to hand to friends, so they are never eligible.

export const GROUP_TEST_SLUGS = new Set([
  "disc",
  "big-five-express",
  "personnalite-50",
  "pcm",
  "animal-totem",
  "type-cognitif-16",
  "bp360",
  "orientation",
]);

export const MAX_GROUP_MEMBERS = 12;

export type GroupSummary = {
  headline: string;
  bars: { label: string; value: number }[]; // value 0..1
  notes: { label: string; text: string }[];
};

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no look-alikes (i, l, o, 0, 1)

function randomString(len: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const newGroupCode = () => randomString(8);
export const newManageToken = () => randomString(24);

type Obj = Record<string, unknown>;
const asObj = (v: unknown): Obj => (v && typeof v === "object" ? (v as Obj) : {});
const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : null);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Pulls a short, format-agnostic summary out of a stored attempt result.
// `profileTitle` is the single_choice result profile (animal test).
export function summarizeResult(
  format: string,
  result: unknown,
  profileTitle?: string | null
): GroupSummary {
  const r = asObj(result);
  const dims = Array.isArray(r.dimensionResults) ? (r.dimensionResults as Obj[]) : [];
  const summary: GroupSummary = { headline: "", bars: [], notes: [] };

  switch (format) {
    case "single_choice":
      summary.headline = profileTitle ?? "";
      break;
    case "disc_quad":
      summary.headline = str(r.archetype) || str(r.title);
      summary.bars = dims.map((d) => ({ label: str(d.label), value: clamp01(num(d.scorePercent) ?? 0) }));
      break;
    case "likert_scale":
      summary.headline = str(asObj(r.dominantProfile).name);
      summary.bars = dims.map((d) => ({ label: str(d.name), value: clamp01(num(d.scorePercent) ?? 0) }));
      break;
    case "pcm_likert":
      summary.headline = str(asObj(r.baseType).name);
      summary.bars = dims.map((d) => ({ label: str(d.label), value: clamp01((num(d.basePercent) ?? 0) / 100) }));
      break;
    case "orientation_riasec": {
      const domains = Array.isArray(r.domainResults) ? (r.domainResults as Obj[]) : [];
      const top = Array.isArray(r.top3) ? (r.top3 as string[]) : [];
      const labelByCode = new Map(domains.map((d) => [str(d.code), str(d.label)]));
      summary.headline = top.map((c) => labelByCode.get(c) ?? c).join(" · ");
      summary.bars = domains.map((d) => ({ label: str(d.label), value: clamp01((num(d.interestPercent) ?? 0) / 100) }));
      break;
    }
    case "bipolar_pairs": {
      const type = asObj(r.typeResult);
      summary.headline = str(type.code) && str(type.name) ? `${str(type.code)} · ${str(type.name)}` : str(type.code) || str(asObj(r.mainProfile).trait);
      summary.notes = dims
        .map((d) => ({ label: str(d.name), text: str(d.tendance) }))
        .filter((n) => n.label && n.text);
      break;
    }
  }
  summary.bars = summary.bars.filter((b) => b.label);
  return summary;
}
