// Extra explanatory content for the adult QI result page: which well-known
// figures are popularly (not scientifically) associated with a given band,
// and concrete advice per reasoning domain. Kept separate from scoring.ts
// (pure computation) since this is display copy.
//
// Deliberately no named examples below "Supérieure": there is no honest
// "famous people who are averagely intelligent" trope (average IS most
// people, celebrity or not), and naming real people next to a low score
// would be disrespectful for no informational gain.

export const IQ_BAND_PEOPLE: Partial<Record<string, string[]>> = {
  "Très supérieure (Haut Potentiel Intellectuel)": [
    "Albert Einstein",
    "Marie Curie",
    "Stephen Hawking",
    "Léonard de Vinci",
  ],
  "Supérieure": [
    "Beaucoup de chercheurs, ingénieurs et médecins spécialisés",
  ],
};

export const IQ_BAND_PEOPLE_NOTE =
  "Ces noms reviennent souvent dans les classements populaires de « QI de célébrités » qui circulent en ligne : ce sont des estimations rétrospectives ou des légendes populaires, jamais un vrai score WAIS/WISC passé par la personne. À prendre comme repère culturel, pas comme donnée vérifiée.";

export const DOMAIN_TIPS: Record<string, string> = {
  num: "Pratique des suites numériques et des petits calculs mentaux chronométrés (applis de calcul mental, sudoku) : c'est un automatisme qui s'entretient vite.",
  ver: "Lis régulièrement des textes variés et note les mots inconnus : le vocabulaire et les analogies verbales progressent surtout par exposition.",
  spa: "Les jeux de construction, le Tetris, l'origami ou la lecture de plans font travailler la rotation mentale et le repérage spatial.",
  ded: "Les jeux de déduction (type « qui est-ce », enquêtes logiques, sudoku) entraînent directement à enchaîner plusieurs indices avec certitude.",
  ind: "Face à une suite ou une grille, prends l'habitude de formuler la règle à voix haute avant de répondre : ça muscle la détection de motifs.",
  att: "Les exercices de repérage d'erreurs ou de différences (type « jeu des 7 différences ») et limiter les distractions pendant l'exercice aident la précision sous contrainte de temps.",
  org: "Planifier consciemment ses tâches (listes, priorités, rétroplanning) transfère directement à ce type de raisonnement.",
  mec: "Observer et manipuler des objets du quotidien (vélo, poulies, leviers) aide à construire une intuition physique plus fine.",
};

export function weakestDomains(
  dimensionResults: { code: string; label: string; scorePercent: number }[]
) {
  return [...dimensionResults]
    .filter((d) => d.scorePercent < 0.7)
    .sort((a, b) => a.scorePercent - b.scorePercent)
    .slice(0, 3)
    .map((d) => ({ ...d, tip: DOMAIN_TIPS[d.code] }));
}
