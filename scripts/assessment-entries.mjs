// Shared catalog metadata for the FlyUp assessments, used by both
// import-assessments.mjs (Supabase) and setup-stripe.mjs (Stripe catalog).
// `lookupKey` ties a test to its Stripe Price via Price.lookup_key, so the
// two scripts can run independently, in any order, and still find each
// other's output on a later run.
//
// An entry with `priceCents: 0` is a fully free test: setup-stripe.mjs
// skips it (no Price to create) and import-assessments.mjs stores it with
// price_cents 0 and no stripe_price_id — getTestAccess() already treats
// price_cents === 0 as unconditional access, same as the free preview logic.

export const DEFAULT_PRICE_CENTS = 99;
export const SUBSCRIPTION_PRICE_CENTS = 599;
export const SUBSCRIPTION_LOOKUP_KEY = "sub_unlimited_monthly";

// Micro-payment to unblur the free test's result — not tied to any one
// test row, so it isn't in ENTRIES below.
export const UNLOCK_RESULT_PRICE_CENTS = 99;
export const UNLOCK_RESULT_LOOKUP_KEY = "unlock_guest_result";

export const ENTRIES = [
  {
    file: "sosie2-fr.json",
    slug: "sosie2-fr",
    format: "sosie_v2",
    language: "fr",
    lookupKey: "test_sosie2_fr_onetime",
    title: "Test de personnalité \"Profil Pilote\" (inspiré du SOSIE 2)",
    description:
      "Inventaire de personnalité et de valeurs \"Profil Pilote\", inspiré de la logique de construction du SOSIE 2nd Generation (choix forcé ipsatif). 85 groupes de propositions (34 tétrades et 51 triades), 20 dimensions reprenant les intitulés publiés par l'éditeur : 8 traits de personnalité et 12 valeurs personnelles et interpersonnelles. Rapport détaillé avec profil de compétences et indice de fiabilité. Conçu par des psychologues spécialisés en recrutement.",
  },
  {
    file: "sosie2-en.json",
    slug: "sosie2-en",
    format: "forced_choice_pair",
    language: "en",
    lookupKey: "test_sosie2_en_onetime",
    title: "\"Pilot Profile\" Personality Test (inspired by SOSIE 2)",
    description:
      "\"Pilot Profile\" personality test, 110 forced-choice items (including 10 consistency checks), inspired by the SOSIE 2 format. Detailed report across 10 dimensions. Designed by recruitment psychologists.",
  },
  {
    file: "td12-fr.json",
    slug: "td12-fr",
    format: "situational_judgment",
    language: "fr",
    lookupKey: "test_td12_fr_onetime",
    title: "Test de jugement situationnel \"Profil Pilote\" (inspiré du TD12)",
    description:
      "Test de jugement situationnel \"Profil Pilote\" en 110 mises en situation (dont 10 de contrôle de cohérence), inspiré du format TD12. Score global et rapport par dimension. Conçu par des psychologues spécialisés en recrutement.",
  },
  {
    file: "td12-en.json",
    slug: "td12-en",
    format: "situational_judgment",
    language: "en",
    lookupKey: "test_td12_en_onetime",
    title: "\"Pilot Profile\" Situational Judgment Test (inspired by TD12)",
    description:
      "\"Pilot Profile\" situational judgment test, 110 scenarios (including 10 consistency checks), inspired by the TD12 format. Overall score and per-dimension report. Designed by recruitment psychologists.",
  },
  {
    file: "adapt-fr.json",
    slug: "adapt-fr",
    format: "forced_choice_quad",
    language: "fr",
    lookupKey: "test_adapt_fr_onetime",
    title: "Test de personnalité \"Profil Pilote\" (inspiré du format ADAPT)",
    description:
      "Test de personnalité à choix forcé en quadruplets (110 questions, dont 10 de contrôle de cohérence), inspiré des questionnaires type APQ/OPQ/PAPI utilisés dans la batterie ADAPT. Conçu par des psychologues spécialisés en recrutement.",
  },
  {
    file: "adapt-en.json",
    slug: "adapt-en",
    format: "forced_choice_quad",
    language: "en",
    lookupKey: "test_adapt_en_onetime",
    title: "\"Pilot Profile\" Personality Test (inspired by the ADAPT format)",
    description:
      "Forced-choice quad personality test (110 items, including 10 consistency-check items), inspired by APQ/OPQ/PAPI-style questionnaires used in the ADAPT battery. Designed by recruitment psychologists.",
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
      "Test de personnalité en 80 affirmations, basé sur le modèle scientifique Big Five (OCEAN), pour se préparer aux sélections de pilote militaire ou d'officier. Conçu par des psychologues spécialisés en recrutement. Site indépendant, non affilié au ministère des Armées ni à aucun organisme officiel de sélection.\n\n" +
      "Comment se déroule ce type de test\n" +
      "Les évaluations de personnalité utilisées dans les processus de sélection militaire se déroulent en général en deux temps : un premier questionnaire psychotechnique, plus court, puis un second inventaire plus long et plus détaillé, souvent basé sur le modèle Big Five (OCEAN). Ce test s'entraîne sur ce second format, en 80 affirmations à évaluer sur une échelle en 5 niveaux, de « Pas du tout d'accord » à « Tout à fait d'accord ». Il n'y a pas de bonne ou de mauvaise réponse : l'objectif est de dresser un profil fidèle, pas de réussir un examen.\n\n" +
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
      "Test de personnalité en 60 affirmations, sur 4 grandes préférences de fonctionnement (énergie, perception, décision, organisation), pour identifier lequel des 16 profils cognitifs te correspond. Conçu par des psychologues spécialisés en recrutement. Inspiré des typologies de personnalité à 16 profils (proches du modèle Myers-Briggs / MBTI), sans affiliation ni reproduction d'un test officiel.\n\n" +
      "Qui es-tu ? Découvre lequel de ces 16 profils te correspond le plus :\n" +
      "Le Gardien, Le Protecteur, Le Confident, Le Stratège, Le Pragmatique, L'Artiste libre, L'Idéaliste, Le Théoricien, L'Audacieux, Le Boute-en-train, L'Enthousiaste, L'Électron libre, Le Bâtisseur, Le Fédérateur, Le Rassembleur, Le Meneur.",
  },
  {
    file: "disc.json",
    slug: "disc",
    format: "disc_quad",
    language: "fr",
    lookupKey: "test_disc_onetime",
    title: "Test de personnalité DISC (Dominant, Influent, Stable, Conforme)",
    description:
      "Test de personnalité en 80 groupes de 4 affirmations à choix forcé, basé sur le modèle DISC (Dominant, Influent, Stable, Conforme). Rapport détaillé avec ta roue de positionnement sur les 4 styles, et ton profil sur la roue élargie des 8 profils (Pilote, Entraîneur, Animateur, Pacificateur, Conseiller, Protecteur, Analyste, Planificateur). Conçu par des psychologues spécialisés en recrutement. Modèle largement utilisé en entreprise, sans affiliation à une marque commerciale du DISC.",
  },
  {
    file: "pcm.json",
    slug: "pcm",
    format: "pcm_likert",
    language: "fr",
    lookupKey: "test_pcm_onetime",
    title: "Six façons d'habiter sa vie — test de personnalité inspiré de la Process Communication",
    description:
      "Test de personnalité en 72 affirmations pour découvrir lequel des 6 profils (Empathique, Travaillomane, Persévérant, Rêveur, Rebelle, Promoteur) te correspond le plus — ta base durable, et la phase où tu vis en ce moment. Inspiré du modèle de Taibi Kahler (Process Communication), sans affiliation ni reproduction d'un questionnaire officiel.",
  },
  {
    file: "logic-8.json",
    slug: "logic-8",
    format: "logic_mcq",
    language: "fr",
    lookupKey: "test_logic8_onetime",
    title: "Le Test des 8 Logiques",
    description:
      "Test de raisonnement logique en 30 items chronométrés (25 minutes), couvrant les huit grandes formes de logique évaluées en recrutement : inductif, numérique, verbal, spatial, déductif, organisation, attention et mécanique. Score global, score détaillé par domaine et corrigé complet des 30 questions.",
  },
  {
    file: "salarie-entrepreneur.json",
    slug: "salarie-entrepreneur",
    format: "career_balance",
    language: "fr",
    lookupKey: "test_salarie_entrepreneur_onetime",
    title: "Salarié ou entrepreneur ? Test d'auto-positionnement",
    description:
      "Test d'auto-positionnement en 18 questions sur l'appétence à entreprendre, mesurée sur 6 axes : tolérance à l'incertitude, autonomie, initiative commerciale, rapport à la sécurité financière, résilience face à l'échec et rapport au collectif. Score global sur 120, profil (salarié, intrapreneur, indépendant ou créateur d'entreprise) et points de vigilance personnalisés.",
  },
  {
    file: "orientation-riasec.json",
    slug: "orientation",
    format: "orientation_riasec",
    language: "fr",
    lookupKey: "test_orientation_riasec_onetime",
    priceCents: 0,
    title: "Boussole — test d'orientation",
    description:
      "Test d'orientation en 88 propositions, basé sur le modèle RIASEC utilisé par la plupart des questionnaires d'orientation (dont ceux de l'Onisep). Croise tes activités préférées, tes centres d'intérêt, tes valeurs et tes compétences pour dresser ton profil sur 6 dimensions et te proposer des pistes parmi 122 métiers, avec des conseils adaptés selon que tu es au lycée/post-bac ou en reconversion professionnelle.",
  },
  {
    file: "big-five-express.json",
    slug: "big-five-express",
    format: "bipolar_pairs",
    language: "fr",
    lookupKey: "test_big_five_express_free",
    priceCents: 0,
    title: "Test de personnalité express, gratuit",
    description:
      "Test de personnalité gratuit et rapide (20 affirmations, environ 5 minutes) sur 5 grandes dimensions inspirées du modèle Big Five : ouverture d'esprit, organisation, extraversion, agréabilité, stabilité émotionnelle. Les 20 questions et ton profil principal sont gratuits, sans carte bancaire ; le détail des 5 dimensions et le rapport PDF sont optionnels (0,99 €).",
  },
  {
    file: "qi.json",
    slug: "qi",
    format: "logic_mcq",
    language: "fr",
    lookupKey: "test_qi_onetime",
    title: "Test de QI, raisonnement logique, verbal, numérique et spatial",
    description:
      "Test de raisonnement complet en 60 questions sur 8 domaines (numérique, verbal, spatial, déductif, inductif, attention, organisation, raisonnement mécanique), donnant un score indicatif façon QI (moyenne 100, écart-type 15). Ce n'est pas un quotient intellectuel clinique étalonné : seul un psychologue, avec un outil validé, peut délivrer un vrai QI certifié. Une version adaptée par tranche d'âge (6-8, 9-11, 12-14 ans) est proposée pour les enfants et ados, avec un résultat exprimé en niveau de raisonnement plutôt qu'en chiffre de QI.",
  },
  {
    file: "tdah.json",
    slug: "tdah",
    format: "adhd_screener",
    language: "fr",
    lookupKey: "test_tdah_screener",
    title: "Repérage TDAH adulte, questionnaire basé sur le DSM-5",
    description:
      "Questionnaire de repérage du TDAH chez l'adulte en 21 questions, rédigé à partir des critères du DSM-5 (attention, agitation et impulsivité, contexte). Ce n'est pas un diagnostic : seul un médecin ou un psychiatre peut poser un diagnostic de TDAH.",
  },
  {
    file: "hpi.json",
    slug: "hpi",
    format: "likert_scale",
    language: "fr",
    lookupKey: "test_hpi_traits",
    title: "HPI, reconnaître les traits du haut potentiel intellectuel",
    description:
      "Test en 30 affirmations explorant 6 traits souvent décrits chez les personnes à haut potentiel intellectuel (pensée arborescente, hypersensibilité, besoin de sens, ennui, décalage relationnel, créativité). Ce n'est pas un test de QI et ne peut pas diagnostiquer un haut potentiel : seul un bilan psychométrique complet (WAIS) avec un psychologue le permet.",
  },
  // "animal-totem" is deliberately NOT listed here anymore: it moved from
  // the rich bipolar_pairs format to the simple single_choice engine
  // (questions/question_options/result_profiles tables), seeded directly in
  // Supabase — re-adding it here and re-running this script would upsert
  // `tests.format` back to "bipolar_pairs" and wipe its result_profiles-based
  // content via test_content. Its title/description/price already live on
  // the `tests` row in the database.
];
