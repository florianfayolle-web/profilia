// Search results show ~60 characters of <title> (the root layout adds
// " | Profilia", 11 chars) and ~155 of the meta description; anything longer
// is cut mid-word by Google. Page headings and body text stay full-length —
// only what goes into <title> / meta description is clipped, at a natural
// boundary rather than blindly.

const TRAILING_STOPWORDS = /\s+(de|du|des|la|le|les|un|une|et|ou|à|au|aux|en|pour|sur|avec|d'|l')$/i;

export function clipTitle(title: string, max = 52): string {
  const t = title.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  for (const sep of [" : ", " — ", " – ", " ("]) {
    const i = t.indexOf(sep);
    if (i >= 25 && i <= max) return t.slice(0, i);
  }
  let cut = t.slice(0, max);
  cut = cut.slice(0, cut.lastIndexOf(" "));
  // Never leave a parenthesis open, or dangle a connector/number.
  if (cut.lastIndexOf("(") > cut.lastIndexOf(")")) cut = cut.slice(0, cut.lastIndexOf("("));
  for (;;) {
    const next = cut.replace(/[\s,;:\-–—\/"«]+$/, "").replace(/\s+\d+$/, "").replace(TRAILING_STOPWORDS, "");
    if (next === cut) break;
    cut = next;
  }
  return cut;
}

export function clipDescription(text: string, max = 155): string {
  const t = text.trim().split(/\n\s*\n/)[0].replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const window = t.slice(0, max);
  const sentenceEnd = Math.max(window.lastIndexOf(". "), window.lastIndexOf(" : "), window.lastIndexOf("? "));
  if (sentenceEnd >= 80) return window.slice(0, sentenceEnd + 1);
  return window.slice(0, window.lastIndexOf(" ")).replace(/[\s,;:\-–—(]+$/, "") + "…";
}
