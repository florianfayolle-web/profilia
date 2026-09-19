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
  // ADAPT: charcoal & gold — executive, choix forcé en quadruplets.
  "adapt-fr": { "--primary": "#1e293b", "--accent": "#ca8a04", "--primary-foreground": "#ffffff" },
  "adapt-en": { "--primary": "#1e293b", "--accent": "#ca8a04", "--primary-foreground": "#ffffff" },
  // Bilan de Personnalité 360: prune & rose poudré — profil complet, feutré.
  bp360: { "--primary": "#4a1d5c", "--accent": "#d18b9a", "--primary-foreground": "#ffffff" },
  // Qui suis-je ?: sarcelle & terracotta — introspectif, chaleureux.
  "personnalite-50": { "--primary": "#134e4a", "--accent": "#d97757", "--primary-foreground": "#ffffff" },
  // 16 profils cognitifs: indigo profond & lavande — cérébral.
  "type-cognitif-16": { "--primary": "#312e81", "--accent": "#c4b5fd", "--primary-foreground": "#ffffff" },
  // DISC: slate profond & ambre — la roue à 4 couleurs se suffit à elle-même,
  // ce duo reste neutre pour les boutons/barres de progression.
  disc: { "--primary": "#0f172a", "--accent": "#f59e0b", "--primary-foreground": "#ffffff" },
  // PCM ("Six façons d'habiter sa vie") : rose & violet, dans l'esprit
  // introspectif et chaleureux du questionnaire original.
  pcm: { "--primary": "#6B3FA0", "--accent": "#D9345F", "--primary-foreground": "#ffffff" },
  // Test des 8 Logiques : sarcelle profond & ochre — sobre, façon feuille
  // de test papier, dans l'esprit éditorial du widget d'origine.
  "logic-8": { "--primary": "#2E6B58", "--accent": "#A97C1F", "--primary-foreground": "#ffffff" },
  // Salarié ou entrepreneur : bleu salariat & rose indépendance, la même
  // paire de pôles que la balance du widget d'origine.
  "salarie-entrepreneur": { "--primary": "#2B3AC4", "--accent": "#E0338A", "--primary-foreground": "#ffffff" },
  // Boussole (orientation RIASEC) : bleu profond & ocre — sobre, éditorial,
  // dans l'esprit d'un outil de conseil plutôt que d'un test ludique.
  orientation: { "--primary": "#1d4f73", "--accent": "#8a4b49", "--primary-foreground": "#ffffff" },
  // Test express gratuit : bordeaux riche & or — suit le même principe que
  // les autres thèmes du site (une couleur dominante sombre/dense + un
  // accent plus feutré) au lieu d'un duo rouge/jaune pur qui lisait comme
  // un drapeau plutôt qu'une identité de marque.
  "big-five-express": { "--primary": "#8B1E3F", "--accent": "#C9932E", "--primary-foreground": "#ffffff" },
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
  disc: 8,
  pcm: 9,
  "logic-8": 10,
  "salarie-entrepreneur": 11,
  orientation: 12,
  "big-five-express": 0,
};

export function getTestOrder(slug: string): number {
  return ORDER[slug] ?? 99;
}
