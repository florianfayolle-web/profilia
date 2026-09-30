// Extra explanatory content for the adult QI result page: how to situate a
// band (named figures where that's honest, a generic sentence otherwise),
// and concrete advice per reasoning domain. Kept separate from scoring.ts
// (pure computation) since this is display copy.
//
// Deliberately no NAMED examples below "Très supérieure": popular "IQ of
// celebrities" lists only exist for the high end, and inventing names for
// an average/above-average band would just be guessing. Below "Moyenne
// faible" (Limite, Très faible) there's nothing here at all, named or
// generic — those bandTexts already carry a relativizing message on their
// own (see iqClassification in scoring.ts), and piling on would read as
// patronizing rather than informative.
export type IqBandInfo = { people?: string[]; generic?: string };

export const IQ_BAND_INFO: Partial<Record<string, IqBandInfo>> = {
  "Très supérieure (Haut Potentiel Intellectuel)": {
    people: ["Albert Einstein", "Marie Curie", "Stephen Hawking", "Léonard de Vinci"],
  },
  "Supérieure": {
    generic:
      "Beaucoup de chercheurs, d'ingénieurs et de médecins spécialisés se situent dans cette tranche.",
  },
  "Moyenne forte": {
    generic:
      "Une bonne partie des cadres, professionnels qualifiés et diplômés du supérieur, tous métiers confondus, se situent exactement dans cette tranche.",
  },
  "Moyenne / Normale": {
    generic:
      "C'est la tranche où se situe la majorité des gens, quel que soit leur métier ou leur parcours : ni un plafond, ni un point de départ, juste la norme statistique.",
  },
  "Moyenne faible": {
    generic:
      "Cette tranche ne dit rien de tes compétences réelles dans ton domaine : beaucoup de réussites professionnelles et personnelles s'appuient sur d'autres qualités que ce type de raisonnement (relationnel, créativité, persévérance).",
  },
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
