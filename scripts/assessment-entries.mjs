// Shared catalog metadata for the FlyUp assessments, used by both
// import-assessments.mjs (Supabase) and setup-stripe.mjs (Stripe catalog).
// `lookupKey` ties a test to its Stripe Price via Price.lookup_key, so the
// two scripts can run independently, in any order, and still find each
// other's output on a later run.

export const DEFAULT_PRICE_CENTS = 499;
export const SUBSCRIPTION_PRICE_CENTS = 999;
export const SUBSCRIPTION_LOOKUP_KEY = "sub_unlimited_monthly";

export const ENTRIES = [
  {
    file: "sosie2-fr.json",
    slug: "sosie2-fr",
    format: "forced_choice_pair",
    language: "fr",
    lookupKey: "test_sosie2_fr_onetime",
    title: "Test de personnalité \"Profil Pilote\" (inspiré du SOSIE 2)",
    description:
      "Test de personnalité \"Profil Pilote\" en 100 questions à choix forcé, inspiré du format SOSIE 2. Rapport détaillé sur 10 dimensions. Conçu par des psychologues spécialisés en recrutement.",
  },
  {
    file: "sosie2-en.json",
    slug: "sosie2-en",
    format: "forced_choice_pair",
    language: "en",
    lookupKey: "test_sosie2_en_onetime",
    title: "\"Pilot Profile\" Personality Test (inspired by SOSIE 2)",
    description:
      "\"Pilot Profile\" personality test, 100 forced-choice items, inspired by the SOSIE 2 format. Detailed report across 10 dimensions. Designed by recruitment psychologists.",
  },
  {
    file: "td12-fr.json",
    slug: "td12-fr",
    format: "situational_judgment",
    language: "fr",
    lookupKey: "test_td12_fr_onetime",
    title: "Test de jugement situationnel \"Profil Pilote\" (inspiré du TD12)",
    description:
      "Test de jugement situationnel \"Profil Pilote\" en 100 mises en situation, inspiré du format TD12. Score global et rapport par dimension. Conçu par des psychologues spécialisés en recrutement.",
  },
  {
    file: "td12-en.json",
    slug: "td12-en",
    format: "situational_judgment",
    language: "en",
    lookupKey: "test_td12_en_onetime",
    title: "\"Pilot Profile\" Situational Judgment Test (inspired by TD12)",
    description:
      "\"Pilot Profile\" situational judgment test, 100 scenarios, inspired by the TD12 format. Overall score and per-dimension report. Designed by recruitment psychologists.",
  },
  {
    file: "adapt-fr.json",
    slug: "adapt-fr",
    format: "forced_choice_quad",
    language: "fr",
    lookupKey: "test_adapt_fr_onetime",
    title: "Test de personnalité \"Profil Pilote\" (inspiré du format ADAPT)",
    description:
      "Test de personnalité à choix forcé en quadruplets (100 questions), inspiré des questionnaires type APQ/OPQ/PAPI utilisés dans la batterie ADAPT. Conçu par des psychologues spécialisés en recrutement.",
  },
  {
    file: "adapt-en.json",
    slug: "adapt-en",
    format: "forced_choice_quad",
    language: "en",
    lookupKey: "test_adapt_en_onetime",
    title: "\"Pilot Profile\" Personality Test (inspired by the ADAPT format)",
    description:
      "Forced-choice quad personality test (100 items), inspired by APQ/OPQ/PAPI-style questionnaires used in the ADAPT battery. Designed by recruitment psychologists.",
  },
  {
    file: "bp360.json",
    slug: "bp360",
    format: "likert_scale",
    language: "fr",
    lookupKey: "test_bp360_onetime",
    title: "Bilan de Personnalité 360",
    description:
      "Bilan de Personnalité 360 : 150 affirmations, 15 dimensions, et un profil dominant parmi 8 profils types. Conçu par des psychologues spécialisés en recrutement.",
  },
  {
    file: "test50.json",
    slug: "personnalite-50",
    format: "bipolar_pairs",
    language: "fr",
    lookupKey: "test_personnalite50_onetime",
    title: "Qui suis-je ?",
    description:
      "Test de personnalité en 50 paires d'affirmations opposées, avec un profil psychologique détaillé sur 5 dimensions. Conçu par des psychologues spécialisés en recrutement.",
  },
  {
    file: "militaire-ocean.json",
    slug: "militaire-ocean",
    format: "likert_scale",
    language: "fr",
    lookupKey: "test_militaire_ocean_onetime",
    title: "Profil Militaire (inspiré du modèle Big Five / OCEAN)",
    description:
      "Test de personnalité en 50 affirmations, basé sur le modèle scientifique Big Five (OCEAN), pour se préparer aux sélections de pilote militaire ou d'officier. Conçu par des psychologues spécialisés en recrutement. Site indépendant, non affilié au ministère des Armées ni à aucun organisme officiel de sélection.\n\n" +
      "Comment se déroule ce type de test\n" +
      "Les évaluations de personnalité utilisées dans les processus de sélection militaire se déroulent en général en deux temps : un premier questionnaire psychotechnique, plus court, puis un second inventaire plus long et plus détaillé, souvent basé sur le modèle Big Five (OCEAN). Ce test s'entraîne sur ce second format, en 50 affirmations à évaluer sur une échelle en 5 niveaux, de « Pas du tout d'accord » à « Tout à fait d'accord ». Il n'y a pas de bonne ou de mauvaise réponse : l'objectif est de dresser un profil fidèle, pas de réussir un examen.\n\n" +
      "Pourquoi répondre sincèrement\n" +
      "Ce type de questionnaire précède généralement un entretien avec un psychologue. Si tes réponses orales contredisent nettement ton profil écrit, cela peut nuire à ta crédibilité, d'où l'intérêt de répondre avec honnêteté plutôt que de chercher la réponse « attendue ».\n\n" +
      "Les 5 dimensions évaluées\n" +
      "– Ouverture d'esprit : curiosité intellectuelle et capacité à s'adapter à des situations nouvelles.\n" +
      "– Rigueur & organisation : discipline, sens de la planification et fiabilité dans l'exécution des tâches.\n" +
      "– Extraversion : aisance sociale et énergie dans les interactions de groupe.\n" +
      "– Coopération & esprit d'équipe : capacité à collaborer et à s'intégrer dans un collectif.\n" +
      "– Stabilité émotionnelle : capacité à garder son calme et son jugement sous pression.\n\n" +
      "Quelques conseils\n" +
      "– Réponds de façon instinctive plutôt que de chercher la réponse « idéale » : un profil trop lissé finit souvent par se contredire.\n" +
      "– Entraîne-toi une ou deux fois sur ce format pour ne pas être surpris le jour J, sans chercher à mémoriser des réponses.\n" +
      "– Vise la cohérence plutôt que l'identique : ton profil global doit rester stable dans le temps.\n" +
      "– Évite les extrêmes qui te desserviraient : reste toi-même, avec nuance.",
  },
  {
    file: "type-cognitif-16.json",
    slug: "type-cognitif-16",
    format: "bipolar_pairs",
    language: "fr",
    lookupKey: "test_typecognitif16_onetime",
    title: "Test de personnalité en 16 profils cognitifs (type MBTI)",
    description:
      "Test de personnalité en 32 affirmations, sur 4 grandes préférences de fonctionnement (énergie, perception, décision, organisation), pour identifier lequel des 16 profils cognitifs te correspond. Conçu par des psychologues spécialisés en recrutement. Inspiré des typologies de personnalité à 16 profils (proches du modèle Myers-Briggs / MBTI), sans affiliation ni reproduction d'un test officiel.",
  },
];
