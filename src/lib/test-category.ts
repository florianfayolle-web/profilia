export type TestCategory = "pilote" | "grande-entreprise" | "personnalite" | "qi-sante-mentale";

export const CATEGORIES: {
  slug: TestCategory;
  title: string;
  shortTitle: string;
  description: string;
  gradient: string;
  accent: string;
}[] = [
  {
    slug: "qi-sante-mentale",
    title: "QI & profil cognitif",
    shortTitle: "QI & profil cognitif",
    description:
      "Un test de raisonnement façon QI, et des questionnaires de repérage inspirés d'outils utilisés par les professionnels de santé, jamais un diagnostic.",
    gradient: "linear-gradient(135deg, #134e4a 0%, #2dd4bf 100%)",
    accent: "#0d9488",
  },
  {
    slug: "personnalite",
    title: "Test de personnalité",
    shortTitle: "Personnalité",
    description:
      "Pour mieux te connaître, sans objectif de recrutement précis : découvre ton profil psychologique en détail.",
    gradient: "linear-gradient(135deg, #6b7a2e 0%, #eafa82 100%)",
    accent: "#8a9a1f",
  },
  {
    slug: "grande-entreprise",
    title: "Entretien grande entreprise",
    shortTitle: "Grande entreprise",
    description:
      "Pour préparer un entretien ou un processus de recrutement en grande entreprise : bilans de personnalité complets et modèle DISC.",
    gradient: "linear-gradient(135deg, #78350f 0%, #eab308 100%)",
    accent: "#ca8a04",
  },
  {
    slug: "pilote",
    title: "Tests pour pilote",
    shortTitle: "Pilote",
    description:
      "Pour te préparer aux sélections de compagnie aérienne ou de pilote militaire : inventaires de personnalité et jugement situationnel.",
    gradient: "linear-gradient(135deg, #002157 0%, #e4002b 100%)",
    accent: "#e4002b",
  },
];

// Slug -> category. Anything not listed falls back to "personnalite" so a
// newly added test always shows up somewhere instead of disappearing.
const TEST_CATEGORY: Record<string, TestCategory> = {
  "sosie2-fr": "pilote",
  "sosie2-en": "pilote",
  "td12-fr": "pilote",
  "td12-en": "pilote",
  "adapt-fr": "pilote",
  "adapt-en": "pilote",
  "militaire-ocean": "pilote",
  bp360: "grande-entreprise",
  disc: "grande-entreprise",
  "personnalite-50": "grande-entreprise",
  "type-cognitif-16": "grande-entreprise",
  pcm: "personnalite",
  "salarie-entrepreneur": "personnalite",
  orientation: "personnalite",
  "big-five-express": "personnalite",
  "logic-8": "personnalite",
  qi: "qi-sante-mentale",
  tdah: "qi-sante-mentale",
  hpi: "qi-sante-mentale",
  "animal-totem": "personnalite",
};

export function getTestCategory(slug: string): TestCategory {
  return TEST_CATEGORY[slug] ?? "personnalite";
}

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}
