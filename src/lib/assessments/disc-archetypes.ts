// Display copy for the 8 profiles of the extended DISC wheel (see
// DISC_ARCHETYPES in scoring.ts for how a result maps to one of them).
// Original wording. Each profile sits on one style (D/I/S/C) or on the
// border between two neighbours.

export type DiscArchetypeInfo = {
  styles: string;
  summary: string;
  strengths: string[];
  watch: string;
  tip: string;
};

export const DISC_ARCHETYPE_INFO: Record<string, DiscArchetypeInfo> = {
  Planificateur: {
    styles: "Entre Conformité et Dominance",
    summary:
      "Tu veux que les choses soient bien faites et tu as la volonté de les faire aboutir : un esprit exigeant, structuré, qui avance avec un plan et ne lâche pas.",
    strengths: ["Organisation et rigueur", "Sens des priorités", "Fiabilité sur la durée"],
    watch:
      "Ton exigence peut devenir de l'inflexibilité : les autres n'ont pas toujours ton niveau de détail ni ton rythme.",
    tip: "Explique le « pourquoi » de tes standards plutôt que de les imposer, et accepte qu'une solution à 90 % soit parfois suffisante.",
  },
  Pilote: {
    styles: "Dominance",
    summary:
      "Tu aimes décider, prendre la main et obtenir des résultats. Face à un obstacle, ton réflexe est d'agir plutôt que d'attendre.",
    strengths: ["Décision rapide", "Goût du défi", "Capacité à entraîner vers un objectif"],
    watch:
      "L'impatience et la franchise brute peuvent froisser, et tu risques de décider seul sur des sujets qui demanderaient l'avis des autres.",
    tip: "Prends le temps d'écouter avant de trancher : tes décisions y gagneront en adhésion, pas seulement en vitesse.",
  },
  Entraîneur: {
    styles: "Entre Dominance et Influence",
    summary:
      "Énergique et charismatique, tu mets les gens en mouvement : tu fixes un cap et tu sais donner envie de le suivre.",
    strengths: ["Leadership enthousiaste", "Aisance à convaincre", "Énergie communicative"],
    watch:
      "Tu peux aller trop vite pour ton équipe, ou sous-estimer les détails et le suivi une fois l'élan lancé.",
    tip: "Associe-toi à quelqu'un de plus méthodique pour transformer l'élan en résultats durables.",
  },
  Animateur: {
    styles: "Influence",
    summary:
      "Sociable, expressif et optimiste, tu crées facilement du lien et de l'ambiance. Tu as besoin d'échanges et de reconnaissance pour t'épanouir.",
    strengths: ["Contact facile", "Créativité et enthousiasme", "Capacité à fédérer"],
    watch:
      "L'enthousiasme peut te disperser, et les tâches répétitives ou très détaillées te pèsent plus qu'aux autres.",
    tip: "Termine ce que tu commences avant de lancer l'idée suivante : un petit suivi visible renforce ta crédibilité.",
  },
  Pacificateur: {
    styles: "Entre Influence et Stabilité",
    summary:
      "Chaleureux et conciliant, tu veilles à l'harmonie du groupe. Tu aimes que chacun se sente bien et tu sais désamorcer les tensions.",
    strengths: ["Écoute et diplomatie", "Sens du collectif", "Ambiance positive"],
    watch:
      "Pour préserver la paix, tu peux éviter les sujets qui fâchent ou ne pas dire ce que tu penses vraiment.",
    tip: "Entraîne-toi à exprimer un désaccord tôt et calmement : c'est souvent moins risqué pour la relation que le non-dit.",
  },
  Conseiller: {
    styles: "Stabilité",
    summary:
      "Calme, patient et loyal, tu es un appui sur lequel on peut compter. Tu préfères la constance et les relations de confiance aux changements brusques.",
    strengths: ["Fiabilité", "Écoute attentive", "Persévérance dans la durée"],
    watch:
      "Tu peux résister au changement ou t'effacer au lieu de défendre ton point de vue.",
    tip: "Prévois les changements à l'avance quand c'est possible, et rappelle-toi que ton avis a de la valeur même s'il est discret.",
  },
  Protecteur: {
    styles: "Entre Stabilité et Conformité",
    summary:
      "Posé et consciencieux, tu veux que tout soit sûr et bien fait. Tu protèges ton équipe en anticipant les risques et en respectant les règles.",
    strengths: ["Sens du détail", "Prudence et fiabilité", "Constance dans la qualité"],
    watch:
      "La prudence peut ralentir les décisions, et tu supportes mal l'improvisation ou les critiques frontales.",
    tip: "Fixe-toi une limite de temps pour décider : une bonne décision à temps vaut mieux qu'une décision parfaite trop tard.",
  },
  Analyste: {
    styles: "Conformité",
    summary:
      "Précis, logique et réfléchi, tu aimes comprendre avant d'agir. Tu t'appuies sur les faits, tu vérifies et tu vises la qualité.",
    strengths: ["Analyse rigoureuse", "Précision", "Esprit critique"],
    watch:
      "L'envie de tout vérifier peut te freiner, et ta réserve peut être perçue comme de la froideur.",
    tip: "Partage tes raisonnements au fil de l'eau : les autres verront la valeur de ton analyse et tu auras plus de soutien.",
  },
};
