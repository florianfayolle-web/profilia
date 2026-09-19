import type { Test } from "@/lib/types";
import { getTestOrder } from "@/lib/test-theme";

const LANGUAGE_LABELS: Record<string, string> = {
  fr: "Tests en français",
  en: "Tests in English",
};

const LANGUAGE_ORDER = ["fr", "en"];

export function groupTestsByLanguage(tests: Test[]) {
  const groups = new Map<string, Test[]>();
  for (const test of tests) {
    const key = test.language || "fr";
    groups.set(key, [...(groups.get(key) ?? []), test]);
  }

  for (const group of groups.values()) {
    group.sort((a, b) => getTestOrder(a.slug) - getTestOrder(b.slug));
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      const ia = LANGUAGE_ORDER.indexOf(a);
      const ib = LANGUAGE_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    })
    .map(([language, tests]) => ({
      language,
      label: LANGUAGE_LABELS[language] ?? language,
      tests,
    }));
}
