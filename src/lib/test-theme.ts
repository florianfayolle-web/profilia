import type { CSSProperties } from "react";

// Per-test color overrides, applied by wrapping the test's pages with these
// as inline CSS custom properties. They shadow the site-wide --primary /
// --accent tokens (defined in globals.css) for everything in that subtree —
// buttons, progress bars, badges, and the result-page charts all read the
// same variables, so one override re-themes all of it.
const THEMES: Record<string, Record<string, string>> = {
  // Military personality test: an olive/khaki camouflage-inspired palette.
  "militaire-ocean": {
    "--primary": "#4b5d3a",
    "--accent": "#8c8a5b",
    "--primary-foreground": "#ffffff",
  },
  // SOSIE 2 / TD12-style tests: Air France's navy blue + red.
  "sosie2-fr": { "--primary": "#002157", "--accent": "#e4002b", "--primary-foreground": "#ffffff" },
  "sosie2-en": { "--primary": "#002157", "--accent": "#e4002b", "--primary-foreground": "#ffffff" },
  "td12-fr": { "--primary": "#002157", "--accent": "#e4002b", "--primary-foreground": "#ffffff" },
  "td12-en": { "--primary": "#002157", "--accent": "#e4002b", "--primary-foreground": "#ffffff" },
};

export function getTestThemeStyle(slug: string): CSSProperties | undefined {
  const theme = THEMES[slug];
  return theme as CSSProperties | undefined;
}

export function hasTestTheme(slug: string): boolean {
  return slug in THEMES;
}

// Explicit catalog ordering so thematically related tests (colored the
// same way) sit next to each other instead of scattering by creation date.
// Lower sorts first; anything unlisted falls back to a high default.
const ORDER: Record<string, number> = {
  "sosie2-fr": 1,
  "td12-fr": 2,
  "adapt-fr": 3,
  "sosie2-en": 1,
  "td12-en": 2,
  "adapt-en": 3,
  "militaire-ocean": 4,
  bp360: 5,
  "personnalite-50": 6,
  "type-cognitif-16": 7,
};

export function getTestOrder(slug: string): number {
  return ORDER[slug] ?? 99;
}
