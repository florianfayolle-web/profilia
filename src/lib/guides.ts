// Long-form, original guide articles — one per test format — written to
// target informational search queries ("comment se déroule le test X",
// "comment se préparer à X") that the short product page on /tests/[slug]
// doesn't have room to cover. Each guide links back to its matching test.

export type Guide = {
  slug: string;
  testSlug: string;
  title: string;
  metaDescription: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
  faq: { question: string; answer: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "test-sosie-2",
    testSlug: "sosie2-fr",
    title: "Test SOSIE 2 : comment il se déroule et comment s'y préparer",
    metaDescription:
      "Comprendre le format du test SOSIE 2 (tétrades et triades, choix forcé ipsatif), pourquoi il est utilisé en recrutement aérien, et comment t'entraîner avant ta sélection.",
    intro:
      "Le format SOSIE 2 revient régulièrement dans les processus de sélection de personnel navigant et de pilotes de ligne. Ce guide explique comment ce type de test fonctionne concrètement, pourquoi les recruteurs l'utilisent, et comment t'y préparer sans chercher à \"tricher\" avec le résultat.",
    sections: [
      {
        heading: "Le principe du choix forcé ipsatif",
        body: [
          "Le format SOSIE 2 présente des groupes de propositions — des tétrades de 4 affirmations pour la partie personnalité, des triades de 3 propositions pour la partie valeurs — et te demande de désigner celle qui te correspond le plus et celle qui te correspond le moins. Contrairement à une échelle de Likert (« pas du tout d'accord » à « tout à fait d'accord »), tu dois trancher à chaque fois entre plusieurs propositions, ce qui rend plus difficile de répondre « ce qu'on attend de toi » de façon systématique.",
          "C'est un test dit ipsatif : tes dimensions se comparent entre elles, à l'intérieur de ton propre profil, jamais à une norme externe. Un score bas sur une dimension signale une priorité plus faible que tes autres dimensions, pas une insuffisance en soi.",
        ],
      },
      {
        heading: "Ce que mesure le test : 8 traits et 12 valeurs",
        body: [
          "La partie « traits » explore 8 dimensions de personnalité (dominance, persévérance, résistance au stress, sociabilité, circonspection, curiosité d'esprit, acceptation des autres, dynamisme) à travers 32 tétrades — chaque trait est proposé 16 fois. Chaque groupe combine volontairement des affirmations d'attrait comparable — deux socialement valorisées, deux moins valorisées — pour que tu ne puisses pas donner une image uniformément flatteuse de toi-même en suivant simplement l'attrait apparent des énoncés.",
          "La partie « valeurs » explore 12 dimensions (6 valeurs personnelles comme le matérialisme ou le goût du challenge, 6 valeurs interpersonnelles comme le besoin d'approbation ou le goût du pouvoir) à travers 48 triades — chaque valeur est proposée 12 fois — sur le même principe de choix forcé. Les 20 dimensions reprennent les intitulés publiés par l'éditeur du SOSIE 2nd Generation, pour un vocabulaire directement transférable si tu passes ensuite l'épreuve officielle.",
        ],
      },
      {
        heading: "Un profil de compétences en plus des 20 dimensions",
        body: [
          "En plus du détail par dimension, ton rapport regroupe tes scores en huit compétences composites (vision stratégique, esprit d'entreprise, ouverture au changement, capacité à motiver, compétences organisationnelles, gestion d'équipe, communication, ressources personnelles), chacune une moyenne de trois dimensions choisies pour leur pertinence conjointe. C'est une lecture plus directement utilisable en entretien que vingt scores isolés.",
        ],
      },
      {
        heading: "Comment s'entraîner sans fausser le résultat",
        body: [
          "L'objectif d'un entraînement n'est pas de mémoriser les « bonnes » réponses — il n'y en a pas — mais de te familiariser avec la structure de l'épreuve : le rythme des choix forcés, la sensation de devoir trancher rapidement entre des options qui te semblent parfois toutes vraies.",
          "Réponds avec spontanéité plutôt qu'en essayant d'anticiper ce que le recruteur veut lire : un profil trop lissé ou changé d'une session à l'autre finit souvent par se contredire, notamment à l'oral en entretien. Le test intègre d'ailleurs des groupes de contrôle (des copies exactes de groupes déjà posés, insérées sans signalement) qui vérifient la stabilité de tes réponses.",
          "Utilise ensuite le rapport détaillé par dimension pour identifier tes points forts et tes axes de vigilance, et prépare des exemples concrets à l'oral qui illustrent ces points sans les contredire.",
        ],
      },
    ],
    faq: [
      {
        question: "Le test SOSIE 2 sur ce site est-il le test officiel ?",
        answer:
          "Non. Il s'agit d'une création originale inspirée de la logique de construction du SOSIE 2nd Generation (choix forcé ipsatif en tétrades et triades), pensée comme outil d'entraînement. Ce n'est pas une reproduction des items, du barème ni des étalonnages de l'outil édité par TalentLens/ECPA.",
      },
      {
        question: "Combien de temps dure le test ?",
        answer:
          "Le test complet compte 85 groupes de propositions (32 tétrades de personnalité + 48 triades de valeurs, plus 5 groupes de contrôle) et prend généralement entre 25 et 30 minutes.",
      },
      {
        question: "Peut-on \"rater\" ce type de test ?",
        answer:
          "Il n'y a pas de note de réussite ou d'échec : le test dresse un profil. Ce qui compte davantage en recrutement, c'est la cohérence entre ce profil et ton comportement en entretien.",
      },
    ],
  },
  {
    slug: "test-td12",
    testSlug: "td12-fr",
    title: "Test TD12 : jugement situationnel, comment ça marche",
    metaDescription:
      "Le format TD12 (jugement situationnel) expliqué : mises en situation, notation par rang, et comment t'entraîner avant un entretien de sélection.",
    intro:
      "Le TD12 est un format de test de jugement situationnel : au lieu de choisir entre deux affirmations sur toi-même, tu dois classer ou choisir la meilleure réponse face à une situation professionnelle concrète. Voici comment il fonctionne et comment t'y préparer.",
    sections: [
      {
        heading: "Le principe du jugement situationnel",
        body: [
          "Chaque question du TD12 présente une situation réaliste (un conflit d'équipe, une décision à prendre sous contrainte de temps, une communication délicate) suivie de plusieurs réponses possibles. Tu dois identifier la réponse la plus adaptée, parfois la moins adaptée, ou classer l'ensemble des options par ordre de pertinence.",
          "Ce format ne mesure pas ta personnalité de façon directe comme un questionnaire d'auto-évaluation : il mesure ton jugement professionnel face à des cas concrets, souvent proches de situations de type CRM (Crew Resource Management) — communication, prise de décision partagée, gestion de l'urgence.",
        ],
      },
      {
        heading: "Pourquoi ce format est utilisé en sélection",
        body: [
          "Dans l'aviation comme dans d'autres métiers à forte responsabilité, on cherche à évaluer non seulement ce que tu es, mais comment tu réagirais concrètement. Le jugement situationnel permet d'observer ta capacité à hiérarchiser des priorités (sécurité, communication, procédure) dans des scénarios qui n'ont pas toujours une réponse évidente.",
          "Un score global est calculé à partir de l'ensemble des situations, mais le test évalue aussi des dimensions spécifiques (communication, décision, gestion de l'urgence) pour donner un profil plus fin que la seule note globale.",
        ],
      },
      {
        heading: "Comment s'entraîner",
        body: [
          "Le principal piège du jugement situationnel est de répondre systématiquement par la réponse qui te semble « la plus consensuelle » ou « la plus prudente » : les recruteurs sérieux repèrent ce biais (appelé désirabilité sociale) et il peut être signalé si tu choisis trop souvent l'option jugée « idéale » sans nuance.",
          "Entraîne-toi à lire chaque situation attentivement, à évaluer les options sur leurs mérites propres plutôt que sur une intuition rapide, et à accepter qu'il n'y a pas toujours une réponse parfaite — seulement une réponse la mieux adaptée au contexte donné.",
        ],
      },
    ],
    faq: [
      {
        question: "Le test TD12 sur ce site est-il le test officiel ?",
        answer:
          "Non, c'est une création originale inspirée du format TD12 (jugement situationnel), destinée à l'entraînement. Ce n'est pas une reproduction de l'épreuve propriétaire réelle.",
      },
      {
        question: "Le test donne-t-il une note de réussite ?",
        answer:
          "Il donne un score global et un rapport par dimension, mais ce n'est pas un examen à réussir ou rater : l'objectif est de te familiariser avec le format avant le jour J.",
      },
    ],
  },
  {
    slug: "test-adapt",
    testSlug: "adapt-fr",
    title: "Test ADAPT (choix forcé en quadruplets) : format et préparation",
    metaDescription:
      "Comment fonctionne un test de personnalité à choix forcé en quadruplets type ADAPT (APQ/OPQ/PAPI), et comment t'y préparer avant une sélection.",
    intro:
      "Le format ADAPT s'appuie sur des questionnaires de personnalité à choix forcé en quadruplets, dans la lignée des batteries APQ, OPQ ou PAPI. Ce guide explique la mécanique de ce format et comment t'entraîner efficacement.",
    sections: [
      {
        heading: "Le principe du choix forcé en quadruplets",
        body: [
          "Contrairement au choix forcé par paires (deux affirmations), le format en quadruplets te présente quatre affirmations à la fois. Tu dois généralement indiquer celle qui te ressemble le plus et celle qui te ressemble le moins, ce qui force une hiérarchisation plus fine de tes préférences.",
          "Comme pour les paires, chaque dimension (leadership, esprit d'équipe, rigueur, prise de risque...) est mesurée à travers plusieurs quadruplets répartis dans le test, pas une seule question isolée.",
        ],
      },
      {
        heading: "Pourquoi ce format est utilisé en recrutement",
        body: [
          "Le choix forcé en quadruplets est réputé encore plus difficile à « jouer » consciemment que le choix par paires, car il faut hiérarchiser quatre options à la fois plutôt que d'en choisir une sur deux. C'est un format fréquent dans les processus de sélection exigeants, notamment dans l'aérien et les grands groupes.",
          "Des questions de contrôle, reformulées différemment mais cohérentes entre elles, permettent de vérifier la stabilité de tes réponses tout au long du test.",
        ],
      },
      {
        heading: "Comment s'entraîner",
        body: [
          "La difficulté principale de ce format est le rythme : il faut apprendre à comparer quatre affirmations rapidement sans se figer sur chaque question. S'entraîner une ou deux fois permet de ne pas découvrir cette mécanique le jour de la vraie sélection.",
          "Comme pour les autres formats, réponds avec sincérité plutôt qu'en essayant de deviner un profil « idéal » : la cohérence entre ton profil écrit et ton comportement en entretien compte davantage qu'un profil parfait mais artificiel.",
        ],
      },
    ],
    faq: [
      {
        question: "Le test ADAPT sur ce site est-il le test officiel ?",
        answer:
          "Non. C'est une création originale inspirée des questionnaires de personnalité à choix forcé en quadruplets (type APQ/OPQ/PAPI) utilisés notamment dans la batterie ADAPT, pensée comme outil d'entraînement.",
      },
      {
        question: "Ce format est-il plus difficile que le choix par paires ?",
        answer:
          "Il demande une hiérarchisation plus fine (le plus et le moins proche de toi parmi quatre options), ce qui peut sembler plus exigeant au début, mais devient plus naturel après quelques questions.",
      },
    ],
  },
  {
    slug: "bilan-personnalite-360",
    testSlug: "bp360",
    title: "Bilan de Personnalité 360 : comprendre ses résultats",
    metaDescription:
      "Comment fonctionne le Bilan de Personnalité 360 (150 affirmations, 15 dimensions, profil dominant), et comment interpréter ton rapport détaillé.",
    intro:
      "Le Bilan de Personnalité 360 est un test long format basé sur une échelle d'accord (de « pas du tout d'accord » à « tout à fait d'accord »), qui couvre 15 dimensions et fait ressortir un profil dominant parmi plusieurs profils types. Voici comment le lire.",
    sections: [
      {
        heading: "Un format en échelle, pas en choix forcé",
        body: [
          "Contrairement aux tests à choix forcé (SOSIE 2, ADAPT), le Bilan 360 te demande d'indiquer ton degré d'accord avec chaque affirmation sur une échelle. Ce format permet de mesurer 15 dimensions différentes avec une bonne granularité, au prix d'un test plus long (150 affirmations).",
          "Chaque dimension est calculée à partir d'un sous-ensemble de questions, et ton profil dominant est déterminé par les dimensions où ton score est le plus marqué.",
        ],
      },
      {
        heading: "Comment lire ton profil dominant",
        body: [
          "Le profil dominant n'est pas une catégorie figée : c'est une synthèse de tes tendances les plus marquées parmi les 15 dimensions mesurées. Il te donne un point de départ pour comprendre ton style personnel, mais le détail par dimension (avec le niveau atteint sur chacune) reste la lecture la plus fine de ton résultat.",
          "Utilise le rapport par dimension pour repérer les traits qui reviennent le plus souvent dans ton quotidien professionnel, et ceux qui pourraient nécessiter un effort de développement selon le poste visé.",
        ],
      },
    ],
    faq: [
      {
        question: "À quoi sert un test aussi long (150 affirmations) ?",
        answer:
          "La longueur permet de mesurer 15 dimensions avec plusieurs questions chacune, ce qui donne un résultat plus stable qu'un test court sur les mêmes dimensions.",
      },
      {
        question: "Le profil dominant peut-il changer si je repasse le test ?",
        answer:
          "Ton profil reflète tes préférences à un instant donné ; il peut évoluer avec l'expérience. Une variation légère entre deux passages est normale.",
      },
    ],
  },
  {
    slug: "qui-suis-je",
    testSlug: "personnalite-50",
    title: "\"Qui suis-je ?\" : le test de personnalité en 50 paires d'affirmations",
    metaDescription:
      "Comment fonctionne le test \"Qui suis-je ?\" en 50 paires d'affirmations opposées, et comment interpréter les 5 dimensions et ton profil principal.",
    intro:
      "\"Qui suis-je ?\" propose 50 paires d'affirmations opposées à évaluer sur une échelle symétrique en 5 niveaux, pour dresser un profil sur 5 grandes dimensions et faire ressortir un profil principal.",
    sections: [
      {
        heading: "Le principe des paires bipolaires",
        body: [
          "Chaque question propose deux affirmations opposées (par exemple, structure et planification d'un côté, flexibilité et adaptabilité de l'autre), et tu indiques de quel côté tu te situes, avec quelle intensité, sur une échelle en 5 niveaux plutôt qu'un choix binaire strict.",
          "Ce format nuancé permet de mesurer non seulement ta tendance, mais aussi son intensité (modérée ou marquée), sur 5 dimensions : structure, exploration, mode relationnel, style de jugement, et orientation pragmatisme/vision.",
        ],
      },
      {
        heading: "Comprendre ton profil principal",
        body: [
          "En plus du détail par dimension, le test fait ressortir un profil principal parmi 8 profils possibles (par exemple Le Bâtisseur, L'Explorateur, L'Analyste...), déterminé par la dimension où ton score est le plus tranché. C'est une synthèse utile pour te présenter rapidement, à compléter par le détail des 5 dimensions pour une lecture plus complète.",
        ],
      },
    ],
    faq: [
      {
        question: "Ce test est-il basé sur un modèle scientifique reconnu ?",
        answer:
          "Le test s'appuie sur 5 dimensions de personnalité pertinentes en contexte professionnel (structure, exploration, relationnel, jugement, orientation), dans un format bipolaire à échelle symétrique. Ce n'est pas un outil de diagnostic clinique.",
      },
    ],
  },
  {
    slug: "test-militaire-ocean",
    testSlug: "militaire-ocean",
    title: "Test de personnalité militaire (Big Five / OCEAN) : à quoi s'attendre",
    metaDescription:
      "Comprendre le modèle Big Five (OCEAN) utilisé dans les tests de personnalité militaires, et comment te préparer à une sélection pilote militaire ou officier.",
    intro:
      "Les évaluations de personnalité utilisées dans les processus de sélection militaire s'appuient souvent sur le modèle scientifique Big Five (OCEAN). Ce guide explique ce modèle et comment t'y préparer avant une sélection EOPN, ALAT, AOPAN ou équivalente.",
    sections: [
      {
        heading: "Le modèle Big Five (OCEAN)",
        body: [
          "Le modèle Big Five est l'un des modèles de personnalité les plus étudiés en psychologie : il mesure cinq grandes dimensions — Ouverture d'esprit, Conscienciosité (rigueur & organisation), Extraversion, Agréabilité (coopération & esprit d'équipe), et Névrosisme (ici mesuré à l'inverse, comme stabilité émotionnelle). L'acronyme OCEAN reprend l'initiale de chaque dimension en anglais.",
          "Contrairement aux tests à choix forcé, ce type de test utilise généralement une échelle d'accord en 5 niveaux, de « pas du tout d'accord » à « tout à fait d'accord », appliquée à des affirmations simples.",
        ],
      },
      {
        heading: "Pourquoi ce modèle en sélection militaire",
        body: [
          "Les processus de sélection militaire, notamment pour les postes à forte exigence opérationnelle (pilote, officier), cherchent des profils capables de garder leur calme et leur jugement sous pression, de respecter un cadre strict tout en gardant de l'initiative, et de bien fonctionner en collectif. Les 5 dimensions du modèle OCEAN couvrent directement ces enjeux.",
          "Ce type de questionnaire précède généralement un entretien avec un psychologue : la cohérence entre tes réponses écrites et ton discours à l'oral est un point d'attention important.",
        ],
      },
      {
        heading: "Comment te préparer",
        body: [
          "Réponds de façon instinctive plutôt que de chercher la réponse « idéale » : un profil trop lissé finit souvent par se contredire. Entraîne-toi une ou deux fois sur ce format pour ne pas être surpris le jour J, sans chercher à mémoriser des réponses précises.",
          "Vise la cohérence plutôt que l'identique d'un passage à l'autre : ton profil global doit rester globalement stable dans le temps, ce qui rassure davantage un recruteur qu'un profil qui change du tout au tout.",
        ],
      },
    ],
    faq: [
      {
        question: "Ce test est-il affilié au ministère des Armées ?",
        answer:
          "Non. Ce site est indépendant et n'est affilié à aucun organisme officiel de sélection militaire. Le test est une création originale basée sur le modèle scientifique public Big Five (OCEAN).",
      },
      {
        question: "Le modèle OCEAN est-il vraiment utilisé par les recruteurs ?",
        answer:
          "Le Big Five est l'un des modèles de personnalité les plus validés scientifiquement et les plus utilisés en psychologie du travail, y compris dans des contextes de sélection exigeants.",
      },
    ],
  },
  {
    slug: "test-16-profils-cognitifs",
    testSlug: "type-cognitif-16",
    title: "Test de personnalité en 16 profils cognitifs (type MBTI) : comment ça marche",
    metaDescription:
      "Comprendre les 4 grandes préférences psychologiques (énergie, perception, décision, organisation) qui définissent les 16 profils cognitifs, et comment interpréter ton résultat.",
    intro:
      "Ce test explore quatre grandes préférences de fonctionnement psychologique pour faire émerger l'un de 16 profils cognitifs, dans la lignée des typologies à 16 profils popularisées par les travaux de Jung et leurs suites (dont le Myers-Briggs Type Indicator). Voici comment il fonctionne.",
    sections: [
      {
        heading: "Les 4 grandes préférences mesurées",
        body: [
          "Le test évalue quatre axes indépendants : la source d'énergie (tournée vers l'action et les autres, ou vers la réflexion intérieure), le mode de perception (attention aux faits concrets, ou aux idées et possibilités), le mode de décision (logique et objectivité, ou impact humain et valeurs), et le rapport à l'organisation (besoin de structure, ou préférence pour la flexibilité).",
          "Chaque axe est mesuré par plusieurs paires d'affirmations opposées ; le pôle dominant sur chaque axe (4 lettres au total) détermine ton profil parmi 16 combinaisons possibles.",
        ],
      },
      {
        heading: "Comprendre ton profil",
        body: [
          "Chaque profil (par exemple Le Stratège, L'Enthousiaste, Le Gardien...) est décrit par un texte original propre à ce site, avec ses points forts et ses points de vigilance en contexte professionnel — pas une reproduction des textes d'un autre outil de typologie.",
          "Ce type de profil est surtout utile comme point de départ de réflexion sur ton mode de fonctionnement naturel : il ne doit pas être lu comme une case figée, mais comme une tendance parmi d'autres, qui peut varier selon le contexte.",
        ],
      },
    ],
    faq: [
      {
        question: "Ce test est-il le test Myers-Briggs (MBTI) officiel ?",
        answer:
          "Non. Le test s'inspire des typologies de personnalité à 16 profils construites sur le même type de dichotomies (popularisées historiquement par le Myers-Briggs Type Indicator), mais les noms de profils, descriptions et textes sont des créations originales de ce site, sans affiliation ni reproduction d'un test officiel.",
      },
      {
        question: "Les 4 lettres du résultat ont-elles une signification universelle ?",
        answer:
          "Les dichotomies utilisées (énergie, perception, décision, organisation) sont un cadre de lecture largement répandu en psychologie populaire, mais ce test propose sa propre interprétation, adaptée à un contexte de préparation professionnelle.",
      },
    ],
  },
];

GUIDES.push({
  slug: "test-disc",
  testSlug: "disc",
  title: "Test de personnalité DISC gratuit : comment ça marche",
  metaDescription:
    "Comprendre le modèle DISC (Dominant, Influent, Stable, Conforme), comment se déroule notre test DISC gratuit à choix forcé, et comment lire ton résultat.",
  intro:
    "Le DISC est l'un des modèles de personnalité les plus utilisés en entreprise, en recrutement comme en développement d'équipe. Voici comment fonctionne notre test DISC gratuit et comment interpréter ton profil.",
  sections: [
    {
      heading: "Le modèle DISC : 4 styles comportementaux",
      body: [
        "Le DISC situe ta personnalité sur quatre grandes tendances comportementales : Dominant (affirmé, orienté résultats), Influent (communicatif, orienté relationnel), Stable (posé, orienté coopération) et Conforme (méthodique, orienté précision). Personne n'est « pur » sur un seul style : ton profil est un dosage des quatre, avec un ou deux styles dominants.",
        "C'est un cadre de psychologie comportementale public et largement répandu, utilisé par de nombreuses entreprises et cabinets de recrutement sous des formes commerciales variées — le nom « DISC » lui-même n'est pas une marque protégée.",
      ],
    },
    {
      heading: "Comment se déroule notre test DISC gratuit",
      body: [
        "Le test présente 80 groupes de 4 affirmations. Pour chaque groupe, tu choisis l'affirmation qui te ressemble le plus (+) et celle qui te ressemble le moins (−) — un format à choix forcé qui t'oblige à trancher plutôt que de rester neutre partout, ce qui donne un profil plus net.",
        "Les 5 premiers groupes sont gratuits, sans engagement ni carte bancaire, pour te permettre de tester le format avant d'aller plus loin.",
      ],
    },
    {
      heading: "Lire ton résultat : roue de positionnement et fiabilité",
      body: [
        "Ton rapport affiche une roue de positionnement (ton point exact entre les 4 styles), le détail de ton score sur chacun des 4 styles, tes points forts et axes de vigilance pour chaque dimension, et un indice de fiabilité sur 100 qui vérifie la cohérence de tes réponses (affirmations jumelles, stabilité entre les deux moitiés du test, rythme de réponse).",
        "Un score élevé sur un style ne veut pas dire que les autres sont absents : c'est le dosage des quatre qui dessine ton profil complet.",
      ],
    },
  ],
  faq: [
    {
      question: "Ce test DISC est-il gratuit ?",
      answer:
        "Les 5 premières affirmations sont gratuites, sans carte bancaire. Le rapport complet (roue de positionnement, détail par style, fiabilité) se débloque ensuite si tu veux aller plus loin.",
    },
    {
      question: "Est-ce le test DISC officiel utilisé par les entreprises ?",
      answer:
        "Non. Le modèle DISC est un cadre public de psychologie comportementale. Notre test est une création originale inspirée de ce modèle, sans affiliation à une marque commerciale du DISC ni à une entreprise en particulier.",
    },
    {
      question: "Quelle différence avec un inventaire de personnalité classique ?",
      answer:
        "Un inventaire de personnalité comme le nôtre en choix forcé par paires (SOSIE) mesure des dimensions fines sur une échelle continue. Le DISC, lui, situe ton profil sur 4 styles comportementaux larges — plus simple à retenir, souvent utilisé en complément d'un inventaire plus détaillé.",
    },
  ],
});

GUIDES.push({
  slug: "recrutement-societe-generale",
  testSlug: "bp360",
  title:
    "Recrutement Société Générale (stage, alternance, VIE) : tests de pré-sélection et personnalité",
  metaDescription:
    "Comprendre le processus de recrutement Société Générale (tests de pré-sélection en ligne, entretiens) et le rôle du test de personnalité dans la décision.",
  intro:
    "Le recrutement chez Société Générale pour les stages, alternances et VIE suit un processus structuré en plusieurs étapes, dont une phase de tests de pré-sélection en ligne à réussir avant même l'examen du CV par un recruteur.",
  sections: [
    {
      heading: "Les étapes du processus",
      body: [
        "Le parcours suit généralement six étapes : candidature en ligne aux offres correspondant à ton profil, passage de plusieurs tests de pré-sélection en ligne, étude du CV par les recruteurs en cas de réussite, un ou plusieurs entretiens avec le manager, un retour sur la suite donnée à la candidature, puis l'embauche. Le délai moyen annoncé, signature du contrat comprise, est de 4 à 8 semaines pour les stages et alternances.",
      ],
    },
    {
      heading: "Les tests de pré-sélection en ligne",
      body: [
        "Les candidats passent plusieurs tests informatisés portant sur le raisonnement logique (suites visuelles et numériques, raisonnement spatial), la maîtrise du français (compréhension, orthographe, vocabulaire, synonymes et antonymes) et le calcul (calcul mental, conversions d'unités, pourcentages, vitesse, distance, moyennes), des compétences directement utiles dans un environnement bancaire.",
        "Ces tests sont complétés par une évaluation de personnalité : l'idée est de mesurer des dimensions qu'un entretien classique, jugé insuffisant à lui seul, ne permet pas toujours de bien évaluer.",
      ],
    },
    {
      heading: "Comment t'y préparer",
      body: [
        "Prévois un créneau calme d'environ une heure pour passer les tests en ligne dans de bonnes conditions, comme le recommande l'entreprise elle-même dans sa documentation de recrutement. Pour la partie personnalité, connaître ton profil à l'avance te permet d'arriver à l'entretien avec des réponses cohérentes avec ce que tu as indiqué par écrit.",
      ],
    },
  ],
  faq: [
    {
      question: "Ce site propose-t-il le vrai test utilisé par Société Générale ?",
      answer:
        "Non. Profilia est indépendant et n'est affilié à Société Générale. Notre Bilan de Personnalité 360 est une création originale pour t'entraîner sur ce type de format de questionnaire, pas une reproduction d'un outil propriétaire.",
    },
    {
      question: "Les tests de logique et de personnalité comptent-ils autant l'un que l'autre ?",
      answer:
        "Les pondérations exactes ne sont pas communiquées publiquement. Mieux vaut te préparer sérieusement sur chaque composante plutôt que de négliger l'une d'elles.",
    },
  ],
});

GUIDES.push({
  slug: "test-personnalite-thales",
  testSlug: "td12-fr",
  title: "Test de personnalité Thales : format et retours de candidats",
  metaDescription:
    "Comprendre le format du test de personnalité utilisé en recrutement chez Thales (mises en situation, rythme rapide) et comment t'y préparer.",
  intro:
    "D'après des retours de candidats partagés sur des forums spécialisés, le test de personnalité utilisé en recrutement chez Thales prend la forme d'un questionnaire à choix multiples avec des mises en situation, à passer dans un temps limité.",
  sections: [
    {
      heading: "Un format QCM rythmé, basé sur des mises en situation",
      body: [
        "Selon plusieurs témoignages, le test comporte une centaine de questions à traiter en une vingtaine de minutes environ, ce qui impose un rythme de réponse rapide. Chaque question propose un scénario ou une affirmation, et le candidat choisit la réponse qui lui correspond le mieux parmi plusieurs options.",
      ],
    },
    {
      heading: "Ce que le test chercherait à mesurer",
      body: [
        "D'après ces mêmes retours, les dimensions explorées incluraient le leadership et la capacité d'exécution, la gestion de l'impulsivité, la propension à l'abstraction et les compétences de communication — des traits pertinents dans un groupe industriel technologique comme Thales.",
      ],
    },
    {
      heading: "L'importance de la cohérence sous pression de temps",
      body: [
        "Plusieurs candidats soulignent que les questions se recoupent sous des formulations différentes, ce qui permet de repérer les réponses incohérentes. Répondre vite tout en restant sincère est donc préférable à essayer de composer un profil « stratégique » : le risque de se contredire augmente avec la vitesse imposée par le format.",
      ],
    },
  ],
  faq: [
    {
      question: "Ce site propose-t-il le vrai test utilisé par Thales ?",
      answer:
        "Non. Profilia est indépendant et n'est affilié à Thales. Notre test de jugement situationnel (inspiré du format TD12) est une création originale pour t'entraîner sur ce type de mécanique (mises en situation, rythme soutenu), pas une reproduction de l'outil propriétaire réel.",
    },
    {
      question: "Peut-on échouer uniquement à cause de ce test ?",
      answer:
        "Les critères précis d'élimination ne sont pas communiqués publiquement par l'entreprise. Ce test s'inscrit généralement dans un processus plus large incluant CV et entretiens.",
    },
  ],
});

GUIDES.push({
  slug: "selection-militaire-eopn-alat-aopan",
  testSlug: "militaire-ocean",
  title:
    "Sélection pilote militaire (EOPN, ALAT, AOPAN) : le CSO et le questionnaire de personnalité",
  metaDescription:
    "Comprendre le déroulement des sélections pilote militaire françaises (EOPN Air, ALAT Terre, AOPAN Marine) : CSO, tests psychotechniques, questionnaire de personnalité. Comment s'y préparer.",
  intro:
    "Devenir pilote militaire en France passe par l'une de trois filières selon l'armée visée : l'EOPN pour l'Armée de l'Air et de l'Espace, l'ALAT pour l'aviation légère de l'Armée de Terre (hélicoptères), et l'AOPAN/EOPAN pour la Marine nationale. Les trois partagent une structure de sélection proche, centrée sur un passage en centre de sélection.",
  sections: [
    {
      heading: "Le CSO, une étape commune aux trois filières",
      body: [
        "Le Centre de Sélection et d'Orientation (CSO) est le passage obligatoire pour l'EOPN et l'ALAT, avec des centres répartis en France. La Marine organise ses propres évaluations selon une logique similaire, avec ses centres à Toulon et Lanvéoc. Selon le nombre de candidatures déposées, le passage peut durer une seule journée ou s'étendre sur deux jours.",
        "Dans les trois cas, on retrouve un socle de tests transversaux communs (orientation spatiale, calcul mental aéronautique, logique sur grilles, raisonnement sur séries de figures, raisonnement numérique), complété par des épreuves spécifiques à chaque filière (identification d'aéronefs, lecture d'instruments de bord, aptitude au multitâche, culture aéronautique militaire).",
      ],
    },
    {
      heading: "Le questionnaire de personnalité",
      body: [
        "Au-delà des aptitudes cognitives, chaque filière évalue des traits de personnalité : gestion du stress, capacité de décision dans des situations complexes, et un entretien psychologique qui vient généralement compléter le questionnaire écrit. L'anglais est également testé de façon spécifique, l'aviation utilisant cette langue comme standard international de communication.",
        "Ce questionnaire de personnalité recoupe largement le modèle Big Five (OCEAN) : ouverture d'esprit, rigueur, extraversion, coopération et stabilité émotionnelle. C'est exactement ce que notre test « Profil Militaire » entraîne, en 80 questions couvrant ces 5 dimensions.",
      ],
    },
    {
      heading: "Les étapes suivantes : médical, simulateur, commission",
      body: [
        "Pour les candidats admissibles à l'issue du CSO, le parcours se poursuit généralement par une visite médicale approfondie, des épreuves sur simulateur, puis une commission qui évalue les compétences interpersonnelles et l'adhésion aux valeurs militaires. Pour certaines filières, une sélection en vol sur aéronef réel complète le dispositif avant l'admission finale.",
      ],
    },
    {
      heading: "Comment te préparer sans te focaliser sur une seule épreuve",
      body: [
        "La tentation est grande de se concentrer sur les tests psychotechniques (souvent perçus comme les plus « bachotables »), mais le questionnaire de personnalité et l'entretien psychologique comptent tout autant dans la décision finale. Connaître ton profil sur les grandes dimensions de personnalité te permet d'arriver à l'entretien avec des réponses cohérentes plutôt que de découvrir ton propre profil en même temps que l'examinateur.",
      ],
    },
  ],
  faq: [
    {
      question: "Quelle est la différence entre EOPN, ALAT et AOPAN ?",
      answer:
        "L'EOPN concerne l'Armée de l'Air et de l'Espace, l'ALAT les hélicoptères de l'Armée de Terre, et l'AOPAN (parfois appelé EOPAN) la Marine nationale. Chacune a ses propres centres et épreuves spécifiques, mais partage une logique de sélection proche.",
    },
    {
      question: "Ce site propose-t-il le vrai test utilisé en sélection militaire ?",
      answer:
        "Non. Profilia est indépendant et n'est affilié au ministère des Armées ni à aucun organisme officiel de sélection. Notre test « Profil Militaire » est une création originale basée sur le modèle scientifique public Big Five (OCEAN), pour t'entraîner sur ce type de format.",
    },
    {
      question: "Faut-il réussir tous les tests transversaux pour être admis ?",
      answer:
        "Les seuils et pondérations exacts ne sont pas communiqués publiquement et peuvent varier d'une session à l'autre. L'évaluation reste globale, incluant aussi la personnalité, l'entretien et parfois la sélection en vol.",
    },
  ],
});

GUIDES.push({
  slug: "recrutement-lvmh",
  testSlug: "bp360",
  title:
    "Recrutement LVMH : comment se préparer (Maisons, étapes, tests de personnalité)",
  metaDescription:
    "Comprendre le recrutement chez LVMH (Louis Vuitton, Dior, Sephora, Moët Hennessy...) : organisation par Maison, étapes du processus, tests utilisés, types de questions posées en entretien.",
  intro:
    "LVMH est le premier groupe mondial du luxe, avec près de 75 Maisons (mode et maroquinerie, vins et spiritueux, parfums et cosmétiques, horlogerie et joaillerie, distribution sélective). Le recrutement y a une particularité importante à connaître avant de te préparer : il est largement décentralisé, chaque Maison gardant sa propre culture et son propre processus.",
  sections: [
    {
      heading: "Une organisation par Maison, pas par groupe",
      body: [
        "Se préparer à un entretien « LVMH » en général est une erreur fréquente : Louis Vuitton, Dior, Sephora ou Moët Hennessy n'ont pas le même univers, le même ton, ni les mêmes attentes. Avant de te préparer, identifie précisément la Maison et le métier visés (boutique, siège, ateliers, supply chain), et renseigne-toi sur son histoire et ses codes propres plutôt que sur le groupe dans son ensemble.",
      ],
    },
    {
      heading: "Les grandes étapes du processus",
      body: [
        "Le parcours varie selon la Maison et le poste, mais suit souvent une trame commune : candidature en ligne, un premier échange avec les ressources humaines (téléphonique, vidéo, ou différé), puis un ou plusieurs entretiens avec des managers, parfois complétés par une mise en situation pour les postes en boutique (jeu de rôle de vente).",
        "Pour les fonctions de siège, la finance ou les jeunes diplômés, des tests écrits (raisonnement, personnalité) interviennent fréquemment en amont des entretiens, pour objectiver une partie de la présélection avant les échanges humains.",
      ],
    },
    {
      heading: "Ce que les tests de personnalité évaluent dans ce contexte",
      body: [
        "Dans un environnement de luxe, l'enjeu n'est pas seulement de vérifier des compétences techniques : les recruteurs cherchent aussi une sensibilité au produit, une capacité d'écoute du client et une aisance relationnelle qui ne s'improvisent pas le jour J. Un test de personnalité bien construit peut faire ressortir ces dimensions (relationnel, rigueur, gestion du stress, orientation client) avant même l'entretien.",
        "Connaître ton propre profil sur ces dimensions te permet d'anticiper les questions qui le recoupent, et d'éviter les contradictions entre ce que tu as répondu par écrit et ce que tu dis à l'oral.",
      ],
    },
    {
      heading: "Le type de questions à anticiper",
      body: [
        "Les entretiens dans le secteur du luxe reviennent souvent sur les mêmes grandes familles de questions : pourquoi cette Maison en particulier (au-delà du prestige de la marque), ce que le luxe représente pour toi concrètement, comment tu gérerais une situation de vente délicate ou un client insatisfait, et comment tu te projettes dans le groupe à moyen terme.",
        "La méthode STAR (Situation, Tâche, Action, Résultat) reste le meilleur outil pour structurer tes exemples concrets, notamment sur les questions comportementales liées au service ou à la gestion d'un client difficile.",
      ],
    },
  ],
  faq: [
    {
      question: "Le recrutement LVMH est-il centralisé ?",
      answer:
        "Non. Chaque Maison recrute très largement de façon autonome, avec sa propre culture d'entretien. Il vaut mieux cibler la Maison précise que le groupe dans son ensemble.",
    },
    {
      question: "Faut-il déjà une expérience dans le luxe pour postuler ?",
      answer:
        "Pas nécessairement, mais il faut en maîtriser les codes. Une expérience de service exigeant (hôtellerie, restauration haut de gamme, relation client premium) est généralement bien valorisée.",
    },
    {
      question: "Ce site propose-t-il un vrai test utilisé par LVMH ?",
      answer:
        "Non. Profilia est indépendant et n'est affilié à LVMH ni à aucune de ses Maisons. Nos tests sont des créations originales pour t'entraîner sur ce type de format (personnalité, choix forcé), pas une reproduction d'un outil propriétaire.",
    },
  ],
});

GUIDES.push({
  slug: "selection-ryanair-pnc-pilote",
  testSlug: "td12-fr",
  title:
    "Sélection Ryanair (PNC et pilote) : tests d'aptitude, jugement situationnel et personnalité",
  metaDescription:
    "Comprendre le processus de sélection Ryanair (candidature en ligne, tests d'aptitude, jugement situationnel, personnalité) et comment t'y préparer.",
  intro:
    "Le recrutement chez Ryanair, aussi bien pour le personnel de cabine que pour les programmes pilotes (Future Flyer Academy), s'appuie largement sur des tests en ligne avant les entretiens. Voici comment ce type de processus se déroule généralement et comment t'y préparer.",
  sections: [
    {
      heading: "Les grandes étapes",
      body: [
        "Le parcours suit en général une candidature en ligne, une série de tests d'aptitude informatisés, un échange téléphonique avec les ressources humaines, puis des entretiens. Chaque étape conditionne l'accès à la suivante : la performance aux tests en ligne détermine qui est convoqué aux étapes suivantes.",
      ],
    },
    {
      heading: "Raisonnement verbal et jugement situationnel",
      body: [
        "Une partie des épreuves porte sur la compréhension de texte (identifier des synonymes, antonymes, analogies à partir de courts passages). Une autre partie prend la forme de mises en situation propres au travail en cabine : plusieurs réponses possibles sont proposées face à un scénario, et il faut les classer selon ce qui te semble le comportement le plus adapté — exactement le principe d'un test de jugement situationnel.",
      ],
    },
    {
      heading: "Le test de personnalité",
      body: [
        "En complément, un questionnaire de personnalité te demande de te positionner face à des affirmations décrivant ton caractère. L'enjeu principal est la cohérence de tes réponses sur l'ensemble du questionnaire : des réponses trop calculées ou changeantes se repèrent facilement et peuvent nuire à ta crédibilité, y compris lors des entretiens qui suivent.",
      ],
    },
    {
      heading: "Comment t'entraîner utilement",
      body: [
        "S'entraîner sur un format de jugement situationnel avant de passer les vraies épreuves permet de ne pas être surpris par la mécanique (classer des réponses plutôt qu'en choisir une seule), et de repérer tes propres réflexes face à des situations de gestion d'équipe ou de communication sous contrainte.",
        "Pour la personnalité, connaître ton profil à l'avance t'aide à répondre de façon spontanée et cohérente, plutôt que de chercher en direct la réponse que tu penses « attendue ».",
      ],
    },
  ],
  faq: [
    {
      question: "Ce site propose-t-il le vrai test utilisé par Ryanair ?",
      answer:
        "Non. Profilia est indépendant et n'est affilié à Ryanair. Notre test de jugement situationnel (inspiré du format TD12) est une création originale pour t'entraîner sur ce type de mécanique, pas une reproduction de l'outil propriétaire réel.",
      },
    {
      question: "Le test de personnalité peut-il m'éliminer seul ?",
      answer:
        "Les critères précis et les seuils exacts ne sont pas communiqués publiquement par les compagnies. Mieux vaut te préparer sérieusement sur l'ensemble des étapes plutôt que de te concentrer sur une seule épreuve.",
    },
  ],
});

GUIDES.push({
  slug: "selection-easyjet-pnc",
  testSlug: "sosie2-fr",
  title:
    "Sélection easyJet (PNC et pilote) : tests de personnalité et jugement situationnel",
  metaDescription:
    "Comprendre les tests utilisés en sélection easyJet : personnalité par paires d'affirmations pour le PNC, format ADAPT/Symbiotics pour les pilotes. Comment s'y préparer.",
  intro:
    "easyJet recrute à la fois du personnel de cabine (PNC) et des pilotes, avec des étapes de sélection en ligne qui s'appuient sur des formats de test bien identifiables avant les entretiens et exercices en présentiel.",
  sections: [
    {
      heading: "PNC : un test de personnalité par paires d'affirmations",
      body: [
        "Pour le personnel de cabine, le questionnaire présente des paires d'affirmations, et il faut choisir celle qui te correspond le mieux entre les deux — plutôt qu'indiquer un simple degré d'accord sur une échelle. Ce format explore des dimensions comme le travail en équipe, la gestion du stress, l'adaptabilité au changement, le sens de l'organisation et l'empathie relationnelle.",
        "Il n'y a pas de bonne ou de mauvaise réponse dans l'absolu : l'objectif est de vérifier que ton style de fonctionnement est cohérent avec la culture et les contraintes opérationnelles de la compagnie, pas de repérer un profil « parfait » universel.",
      ],
    },
    {
      heading: "Pilote : le format ADAPT / Symbiotics",
      body: [
        "Pour les candidats pilotes, la partie personnalité de l'évaluation en ligne s'appuie sur un format de type ADAPT / Symbiotics : un questionnaire à choix forcé qui te demande de hiérarchiser plusieurs affirmations entre elles plutôt que de répondre affirmation par affirmation. C'est le même principe que notre test ADAPT, également utilisé comme référence pour d'autres sélections aériennes.",
        "Cette partie personnalité s'accompagne généralement d'un test de jugement situationnel spécifique au poste de copilote, ainsi que d'épreuves de coordination, de sens de l'orientation et de gestion multitâche propres à l'évaluation pilote.",
      ],
    },
    {
      heading: "La cohérence, plus importante que la réponse parfaite",
      body: [
        "Ces deux formats répètent les mêmes dimensions sous des formulations différentes tout au long du questionnaire. Des réponses qui se contredisent d'une question à l'autre se repèrent facilement, alors que répondre avec sincérité et spontanéité donne un profil stable, plus rassurant pour un recruteur.",
      ],
    },
    {
      heading: "L'exercice de groupe",
      body: [
        "En complément du test écrit, les sélections en compagnie aérienne incluent souvent un exercice de groupe (résolution d'un cas ou d'une mise en situation collective, en petit groupe de candidats), observé par des représentants de la compagnie. Il évalue ta capacité à collaborer, écouter et t'exprimer dans un cadre collectif, en cohérence avec les dimensions déjà mesurées par le questionnaire écrit.",
      ],
    },
  ],
  faq: [
    {
      question: "Ce site propose-t-il le vrai test easyJet ?",
      answer:
        "Non. Profilia est indépendant et n'est affilié à easyJet. Nos tests SOSIE 2 (choix forcé par paires) et ADAPT (choix forcé en quadruplets) sont des créations originales pour t'entraîner sur ces mêmes principes de format, pas une reproduction des outils propriétaires réels.",
    },
    {
      question: "Le format est-il le même pour le PNC et pour les pilotes ?",
      answer:
        "Non, les retours de candidats indiquent des formats différents selon le poste : paires d'affirmations pour le PNC, format ADAPT/Symbiotics à choix forcé pour les pilotes. Entraîne-toi sur le format qui correspond à ton poste visé.",
    },
    {
      question: "Faut-il préparer des réponses à l'avance ?",
      answer:
        "Non, et c'est même contre-productif : une préparation qui consiste à mémoriser des réponses « idéales » produit souvent un profil incohérent. Mieux vaut connaître tes propres tendances et répondre avec sincérité.",
    },
  ],
});

GUIDES.push({
  slug: "psy1-enac-epl",
  testSlug: "bp360",
  title:
    "PSY1 ENAC EPL / EPL(S) : à quoi ressemble le questionnaire de personnalité",
  metaDescription:
    "Comprendre le déroulement du PSY1 (concours ENAC EPL / EPL(S)) : tests psychotechniques, épreuve psychomotrice, questionnaire de personnalité. Comment s'y préparer.",
  intro:
    "Le PSY1 est l'épreuve d'admission du concours ENAC EPL / EPL(S), qui permet de devenir élève pilote de ligne. Sur la base de retours de candidats et de sites spécialisés dans la préparation à ce concours, voici comment cette journée se déroule et comment aborder sereinement la partie « questionnaire de personnalité ».",
  sections: [
    {
      heading: "Une journée en trois grandes parties",
      body: [
        "Le PSY1 se déroule sur une journée entière et comprend généralement trois types d'épreuves bien distinctes : des tests psychotechniques (calcul mental, raisonnement logique, visualisation dans l'espace, mémorisation, compréhension verbale rapide), une épreuve psychomotrice au joystick qui évalue la coordination entre la main et l'œil, et un questionnaire de personnalité.",
        "Contrairement aux tests psychotechniques où une mauvaise réponse ne coûte rien de plus qu'une question manquée, l'épreuve psychomotrice pénalise spécifiquement les erreurs, ce qui change la stratégie à adopter (mieux vaut parfois ralentir que se précipiter).",
      ],
    },
    {
      heading: "Le questionnaire de personnalité",
      body: [
        "Cette partie te demande de te positionner sur une échelle d'accord/désaccord face à des affirmations ou des scénarios, plutôt que de choisir entre deux options comme dans un format à choix forcé. Elle explore des dimensions comme la confiance en soi, la prise de décision et la détermination, en cohérence avec ce qu'on attend d'un futur pilote de ligne.",
        "Les résultats sont ensuite présentés par classes de pourcentage plutôt qu'en note brute, et peuvent orienter la suite du processus de sélection pour les candidats admissibles.",
      ],
    },
    {
      heading: "Comment t'y préparer",
      body: [
        "Pour la partie personnalité, l'entraînement le plus utile consiste à te familiariser avec le principe d'une échelle d'accord/désaccord appliquée à des affirmations personnelles, pour ne pas hésiter sur la mécanique de réponse le jour de l'épreuve. Réponds toujours avec spontanéité : ce type de questionnaire n'a pas de bonne réponse universelle, seulement un profil cohérent.",
        "Pour les tests psychotechniques et l'épreuve psychomotrice, qui mesurent des aptitudes différentes de la personnalité, une préparation spécifique et régulière reste la meilleure approche — ce n'est pas l'objet de ce site, centré sur les questionnaires de personnalité.",
      ],
    },
  ],
  faq: [
    {
      question: "Le PSY1 est-il éliminatoire ?",
      answer:
        "Oui, c'est une épreuve d'admission : ne pas l'obtenir met fin à cette tentative de concours. Le nombre de tentatives autorisées est limité, ce qui rend la préparation importante.",
    },
    {
      question: "Ce site propose-t-il le vrai questionnaire de personnalité du PSY1 ?",
      answer:
        "Non. Profilia est indépendant et n'est affilié à l'ENAC ni à aucun organisme de sélection. Nos tests (Bilan de Personnalité 360, entre autres) sont des créations originales pour t'entraîner sur ce type de format (échelle d'accord/désaccord), pas une reproduction de l'épreuve réelle.",
    },
    {
      question:
        "Le questionnaire de personnalité compte-t-il autant que les tests psychotechniques ?",
      answer:
        "Les seuils et pondérations exacts ne sont pas communiqués publiquement et peuvent évoluer d'une session à l'autre. Mieux vaut te préparer sérieusement sur chaque composante plutôt que de parier sur l'une d'elles.",
    },
  ],
});

GUIDES.push({
  slug: "psy2-air-france",
  testSlug: "td12-fr",
  title:
    "PSY2 Air France : comment se déroule la sélection (inventaires de personnalité, groupe, entretien)",
  metaDescription:
    "Comprendre le déroulement du PSY2 (sélection pilote Air France/HOP) : inventaires de personnalité, débat collectif, exercice de groupe, entretien individuel. Comment s'y préparer.",
  intro:
    "Le PSY2 est la phase orale de la sélection pilote chez Air France et HOP, qui suit le PSY1 (tests psychotechniques). Sur la base de retours de candidats et de préparateurs spécialisés, voici comment ce type d'évaluation se déroule généralement, et comment t'y préparer sans chercher à deviner un profil « idéal ».",
  sections: [
    {
      heading: "Les inventaires de personnalité",
      body: [
        "La journée démarre généralement par un ou plusieurs questionnaires de personnalité écrits, portant sur plusieurs centaines d'affirmations. Ces inventaires cherchent à dresser un profil sur des dimensions comme la gestion du stress, le travail en équipe ou la rigueur, à travers des formats variés (échelle d'accord, choix forcé, jugement situationnel).",
        "Les résultats de ces inventaires orientent largement le contenu de l'entretien individuel qui suit : les questions posées recoupent souvent ton profil écrit, ce qui rend la cohérence entre les deux essentielle.",
      ],
    },
    {
      heading: "Le débat collectif et l'exercice de groupe",
      body: [
        "Une partie de l'épreuve se déroule en collectif : chaque candidat anime à son tour une courte discussion sur un sujet d'actualité, ce qui permet d'observer l'aisance à l'oral, l'écoute et la capacité à faire participer le groupe.",
        "Un exercice de groupe plus long demande ensuite de résoudre collectivement un problème complexe, avec des contraintes et des données à croiser. Ce type d'exercice est souvent construit pour ne pas avoir de solution parfaite : l'objectif est d'observer la méthode et le comportement en équipe, pas seulement le résultat final.",
      ],
    },
    {
      heading: "L'entretien individuel",
      body: [
        "L'entretien couvre le parcours, les motivations et la compréhension du métier, et se termine fréquemment par une question d'auto-critique : qu'aurais-tu fait différemment sur telle ou telle situation ? Cette question teste ta capacité de recul sur toi-même, pas seulement tes résultats passés.",
      ],
    },
    {
      heading: "Comment s'y préparer",
      body: [
        "Le format écrit (inventaires de personnalité) est ce qui se travaille le mieux en amont : te familiariser avec ce type de questionnaire (échelle d'accord, choix forcé, jugement situationnel) t'évite d'être surpris par la mécanique le jour J, et connaître ton propre profil à l'avance t'aide à préparer un entretien cohérent avec tes réponses écrites.",
        "Pour la partie collective, il n'y a pas de « bonne » façon de se comporter dans l'absolu : l'essentiel est de rester toi-même tout en restant attentif aux autres, plutôt que de chercher à dominer ou à t'effacer complètement du groupe.",
      ],
    },
  ],
  faq: [
    {
      question: "Le PSY2 a-t-il une note de passage ?",
      answer:
        "D'après les retours de candidats, il s'agit d'une évaluation globale (analyse, décision, relationnel, aptitudes métier) plutôt que d'un examen à note unique. Les critères précis d'élimination ne sont pas communiqués publiquement par les compagnies.",

    },
    {
      question:
        "Ce site propose-t-il le vrai questionnaire de personnalité utilisé au PSY2 ?",
      answer:
        "Non. Profilia est indépendant et n'est affilié à Air France, HOP ni à aucune compagnie. Nos tests (TD12, SOSIE 2, ADAPT...) sont des créations originales inspirées de formats similaires, pour t'entraîner sur la mécanique de ce type d'épreuve, pas une reproduction du questionnaire réel.",
    },
    {
      question: "Combien de questions comportent les inventaires de personnalité ?",
      answer:
        "Les retours de candidats évoquent des questionnaires de plusieurs centaines d'affirmations. Le format exact varie selon les sessions et n'est pas communiqué officiellement.",
    },
  ],
});

GUIDES.push({
  slug: "test-process-communication",
  testSlug: "pcm",
  title: "Test de personnalité inspiré de la Process Communication : comment ça marche",
  metaDescription:
    "Comprendre le modèle de la Process Communication (Taibi Kahler), les 6 profils de personnalité (Empathique, Travaillomane, Persévérant, Rêveur, Rebelle, Promoteur), et comment lire ton résultat base/phase.",
  intro:
    "La Process Communication (PCM) est un modèle de personnalité né dans les années 1970, très utilisé en management, formation commerciale et développement personnel pour comprendre comment chacun communique et réagit sous stress. Voici comment fonctionne notre test inspiré de ce modèle et comment interpréter ton profil.",
  sections: [
    {
      heading: "Le modèle : 6 profils, une base et une phase",
      body: [
        "La Process Communication distingue six styles de personnalité — Empathique, Travaillomane, Persévérant, Rêveur, Rebelle, Promoteur — chacun avec sa façon de percevoir le monde, ses talents naturels et ses signaux de stress spécifiques. Personne n'appartient à un seul profil : chacun est un mélange des six, structuré comme un immeuble à étages.",
        "Le modèle distingue la « base » (le profil installé depuis l'enfance, stable toute la vie, celui qui structure ta façon de percevoir le monde) et la « phase » (l'étage où tu vis actuellement, qui peut évoluer au fil des périodes de vie et qui commande tes besoins psychologiques du moment).",
      ],
    },
    {
      heading: "Comment se déroule notre test",
      body: [
        "Le test comprend 72 affirmations réparties en deux parties : la première explore ta base (« depuis toujours »), la seconde ta phase actuelle (« ces douze derniers mois »). Une transition explicite entre les deux parties te rappelle de changer de point de référence pour répondre.",
        "Les 5 premières affirmations sont gratuites, sans engagement, pour te permettre de tester le format avant d'aller plus loin.",
      ],
    },
    {
      heading: "Lire ton résultat : base, phase et fiabilité",
      body: [
        "Ton rapport détaille ton profil de base (perception du monde, talents, ce qui te motive) et ton profil de phase (tes besoins psychologiques actuels, les signaux à surveiller si ce besoin n'est pas nourri, ce que tu peux demander), avec une explication si les deux coïncident ou diffèrent.",
        "Un indice de fiabilité vérifie la cohérence de tes réponses à partir de plusieurs signaux : l'accord entre affirmations jumelles (même idée, formulation différente), la variété de tes réponses, ton rythme de passation et un éventuel biais d'acquiescement.",
      ],
    },
  ],
  faq: [
    {
      question: "Ce test est-il l'outil officiel de certification PCM ?",
      answer:
        "Non. La Process Communication officielle s'évalue avec un inventaire propriétaire, dépouillé par un formateur certifié Kahler Communication. Ce test est une création originale inspirée du modèle théorique, pensée comme une invitation à s'observer, pas comme un inventaire certifié.",
    },
    {
      question: "Quelle différence entre la base et la phase ?",
      answer:
        "La base est stable toute la vie et détermine ta façon de percevoir le monde. La phase peut changer au fil des grandes périodes de vie et détermine tes besoins psychologiques du moment — les deux peuvent coïncider ou diverger.",
    },
    {
      question: "Quelle différence avec un test DISC ou MBTI ?",
      answer:
        "Le DISC et le MBTI situent ton profil sur des styles comportementaux ou cognitifs relativement stables. La Process Communication ajoute une dimension dynamique (la phase) qui peut évoluer indépendamment de ta base, ce qui en fait un outil plus orienté vers la communication interpersonnelle et la gestion du stress au quotidien.",
    },
  ],
});

GUIDES.push({
  slug: "test-raisonnement-logique",
  testSlug: "logic-8",
  title: "Test de raisonnement logique gratuit : les 8 familles de logique",
  metaDescription:
    "Le Test des 8 Logiques : 30 items chronométrés couvrant les huit grandes formes de raisonnement testées en recrutement. Score par domaine et corrigé détaillé, gratuit sur les 5 premières questions.",
  intro:
    "Les tests d'aptitude ou tests psychotechniques utilisés en recrutement ne mesurent presque jamais une seule forme de logique : ils combinent plusieurs familles d'items pour dresser un profil cognitif complet. Ce guide explique les huit familles couvertes par notre test et comment t'entraîner efficacement.",
  sections: [
    {
      heading: "Les huit familles de logique évaluées",
      body: [
        "Raisonnement inductif (trouver la règle qui gouverne une suite à partir d'exemples), aptitude numérique (pourcentages, proportions, vitesses), aptitude verbale (analogies, intrus, classement du général au particulier), raisonnement spatial (rotations, patrons de cube, symétries), raisonnement déductif (syllogismes, contraposées, déduction par élimination), organisation (planification, gestion de tâches et de stocks), attention et concentration (repérer une différence, comparer des séries), et raisonnement mécanique (engrenages, leviers).",
        "La plupart des batteries de sélection (recrutement grande entreprise, concours, sélection pilote) piochent dans ces mêmes huit familles, sous des formes et des noms différents selon l'éditeur du test.",
      ],
    },
    {
      heading: "Comment se déroule le test",
      body: [
        "30 items chronométrés sur 25 minutes, les huit logiques alternant au fil du test comme dans une épreuve réelle. Aucun point négatif : répondre au hasard en cas de doute est toujours préférable à laisser une question vide.",
        "Les 5 premières questions sont gratuites, sans engagement ni carte bancaire.",
      ],
    },
    {
      heading: "Lire ton résultat et progresser",
      body: [
        "Ton rapport affiche ton score global sur 30, ton score détaillé pour chacune des huit familles, et le corrigé complet des 30 questions avec une explication de la méthode de résolution pour chaque item.",
        "Le score brut compte moins que sa répartition : un candidat qui perd des points sur un seul domaine (le raisonnement spatial, par exemple) n'a pas un problème d'aptitude générale, il a un domaine précis à travailler — et c'est celui qui progresse le plus vite avec de l'entraînement ciblé.",
      ],
    },
  ],
  faq: [
    {
      question: "Faut-il une calculatrice pour ce test ?",
      answer:
        "Non. Les items numériques sont conçus pour être résolus de tête ou avec un brouillon, comme dans la plupart des épreuves réelles où la calculatrice est interdite.",
    },
    {
      question: "Ce score correspond-il à un QI ?",
      answer:
        "Non. Un QI suppose un étalonnage sur un échantillon représentatif et une passation encadrée par un psychologue. Ce test situe ta performance sur trente items d'entraînement, logique par logique, à titre indicatif.",
    },
    {
      question: "Pourquoi huit logiques et pas une seule note globale ?",
      answer:
        "Parce que la recherche sur les aptitudes cognitives distingue des facteurs largement indépendants les uns des autres : on peut exceller en raisonnement verbal et peiner en rotation mentale. Un score global masque ces écarts, alors que huit sous-scores te disent précisément quoi travailler.",
    },
  ],
});

GUIDES.push({
  slug: "test-salarie-ou-entrepreneur",
  testSlug: "salarie-entrepreneur",
  title: "Salarié ou entrepreneur ? Comment évaluer son appétence à entreprendre",
  metaDescription:
    "Le test Salarié ou entrepreneur : 18 questions sur 6 axes (incertitude, autonomie, initiative, sécurité financière, résilience, rapport au collectif) pour situer ton appétence entrepreneuriale.",
  intro:
    "« Est-ce que je serais fait pour entreprendre ? » est une question que beaucoup de salariés se posent sans avoir de moyen concret d'y répondre autrement qu'à l'intuition. Ce test décompose la question en six axes mesurables et te dit précisément de quel côté penche chacun, plutôt que de rendre un verdict binaire.",
  sections: [
    {
      heading: "Six axes, pas un verdict",
      body: [
        "Tolérance à l'incertitude, autonomie et auto-organisation, initiative et aisance commerciale, rapport à la sécurité financière, résilience face à l'échec, rapport au collectif et au cadre : chaque axe est indépendant des autres, et un profil entrepreneurial cohérent n'a pas besoin d'être extrême sur les six à la fois.",
        "Le test ne dit jamais qu'entreprendre est une bonne ou une mauvaise idée dans l'absolu : il indique ce qui, dans ton fonctionnement actuel, faciliterait ou coûterait dans un projet entrepreneurial — à toi de décider ce que tu en fais.",
      ],
    },
    {
      heading: "Comment se déroule le test",
      body: [
        "18 questions qui alternent deux formats : des paires de propositions opposées entre lesquelles il faut pencher (sans position neutre possible), et des affirmations à noter sur une échelle en 5 niveaux d'accord. Deux minutes suffisent en général.",
        "Réponds selon ce que tu fais réellement depuis un an, pas selon ce que tu aimerais être : « entrepreneur » sonne flatteur, mais le test n'a d'intérêt que si tes réponses reflètent ton comportement réel.",
      ],
    },
    {
      heading: "Lire ton résultat : score, profil et points de vigilance",
      body: [
        "Ton rapport affiche un score global sur 120, un profil parmi quatre (profil salarié, intrapreneur, indépendant, créateur d'entreprise), le détail par axe avec les arguments qui penchent vers le salariat ou vers l'indépendance, et des points de vigilance personnalisés quand certaines combinaisons d'axes le justifient — par exemple une appétence globale forte mais une faible tolérance à l'incertitude.",
        "Le profil « intrapreneur » (autonomie et initiative fortes, sans l'appétence pour le risque financier) est le plus fréquent et le plus mal servi par les tests qui ne posent qu'une question binaire salarié/entrepreneur.",
      ],
    },
  ],
  faq: [
    {
      question: "Ce test dit-il si mon projet va réussir ?",
      answer:
        "Non. Il mesure une appétence personnelle, pas une compétence ni une probabilité de réussite d'un projet donné. Un score élevé ne dit rien de la viabilité d'une idée ; un score bas n'interdit à personne d'entreprendre, il indique ce qu'il faudra compenser (un associé, un accompagnement, un démarrage progressif).",
    },
    {
      question: "Qu'est-ce qu'un profil « intrapreneur » ?",
      answer:
        "C'est un profil avec de l'autonomie et le goût de l'initiative, mais sans l'appétence pour le risque financier qui accompagne l'indépendance. La piste suggérée est souvent un poste à forte latitude (chef de projet, responsable d'une activité nouvelle) plutôt qu'un changement de statut.",
    },
    {
      question: "Le test tient-il compte de mon secteur ou de mon idée de projet ?",
      answer:
        "Non, volontairement : il mesure un fonctionnement personnel indépendant du projet envisagé, pour rester utile à n'importe qui se pose la question, quel que soit le secteur.",
    },
  ],
});

GUIDES.push({
  slug: "test-orientation-riasec",
  testSlug: "orientation",
  title: "Test d'orientation RIASEC : comment ça marche et comment lire ton profil",
  metaDescription:
    "Comprendre le modèle RIASEC (Réaliste, Investigateur, Artistique, Social, Entreprenant, Conventionnel) utilisé par la plupart des tests d'orientation, et comment notre test croise activités, intérêts, valeurs et compétences pour te proposer des métiers.",
  intro:
    "Le modèle RIASEC est le cadre le plus utilisé au monde pour l'orientation scolaire et professionnelle — c'est celui que reprennent la plupart des outils de l'Onisep et des conseillers d'orientation. Voici comment fonctionne notre test « Boussole » et comment interpréter ton résultat.",
  sections: [
    {
      heading: "Le modèle RIASEC : six grandes familles",
      body: [
        "RIASEC est l'acronyme de six types de personnalité professionnelle : Réaliste (le concret, la technique), Investigateur (l'analyse, la recherche), Artistique (la création), Social (la relation, l'aide), Entreprenant (l'initiative, la décision) et Conventionnel (la méthode, l'organisation). Chacun décrit un rapport différent au travail, pas un niveau de compétence.",
        "Personne n'est « pur » sur un seul type : ton profil est un dosage des six, et ce sont tes trois dominantes qui orientent le plus fortement les métiers qui te correspondent.",
      ],
    },
    {
      heading: "Ce que notre test croise en plus du modèle RIASEC",
      body: [
        "Contrairement à un test RIASEC classique qui ne mesure que les intérêts, notre test croise quatre dimensions : les activités qui t'attirent, les sujets qui t'intéressent (18 grands domaines professionnels), ce qui compte pour toi dans un travail (sécurité, autonomie, rémunération, utilité sociale...), et ce que tu sais déjà faire. Ce croisement permet de proposer un classement de 122 métiers, pas seulement un code à trois lettres.",
        "Le test propose deux lectures de ton résultat selon ta situation : lycée/post-bac (choix de spécialités, vœux Parcoursup) ou reconversion professionnelle (formations courtes, VAE, financement). Les scores sont identiques ; seuls les conseils et les formations affichées changent.",
      ],
    },
    {
      heading: "Lire ton résultat : profil, métiers et prochaines étapes",
      body: [
        "Ton rapport détaille ton score sur les six dimensions (intérêt et maîtrise), tes trois dominantes avec leurs environnements de travail et leurs métiers, un classement des 122 métiers filtrable par niveau d'études, tes valeurs prioritaires avec des conseils dédiés, et un plan d'action en cinq étapes concrètes.",
        "Un pourcentage élevé sur un métier n'est pas une recommandation à suivre les yeux fermés : c'est une invitation à aller lire la fiche du métier et à rencontrer quelqu'un qui l'exerce, comme le rappelle le test lui-même.",
      ],
    },
  ],
  faq: [
    {
      question: "Ce test remplace-t-il un rendez-vous avec un conseiller d'orientation ?",
      answer:
        "Non. C'est un support de réflexion à apporter à un rendez-vous, pas un diagnostic. Pour les lycéens, un psychologue de l'Éducation nationale au CIO est gratuit. Pour les adultes, le Conseil en évolution professionnelle (CEP) est gratuit et indépendant de l'employeur.",
    },
    {
      question: "Le résultat est-il définitif ?",
      answer:
        "Non. Un profil d'intérêts peut évoluer nettement en deux ou trois ans, surtout après une expérience nouvelle (stage, immersion, premier emploi). Considère ce résultat comme une hypothèse à vérifier sur le terrain, pas comme un verdict.",
    },
    {
      question: "Pourquoi mon score de maîtrise est-il plus bas que mon score d'intérêt sur un domaine ?",
      answer:
        "C'est très courant, et ce n'est pas un problème : l'intérêt précède presque toujours la compétence. Un score d'intérêt élevé avec une maîtrise encore faible signale un domaine à développer, pas un mauvais choix.",
    },
  ],
});

GUIDES.push({
  slug: "test-personnalite-gratuit",
  testSlug: "big-five-express",
  title: "Test de personnalité gratuit en ligne : comment ça marche",
  metaDescription:
    "Le test de personnalité express de Profilia : 20 affirmations, 5 minutes, gratuit et sans carte bancaire. Comment il fonctionne et ce que révèle ton profil sur 5 grandes dimensions.",
  intro:
    "Tu veux un premier aperçu de ta personnalité sans passer par un test de 100 questions ? Le test express de Profilia est pensé pour ça : rapide, gratuit, et basé sur 5 dimensions reconnues en psychologie de la personnalité.",
  sections: [
    {
      heading: "Un format court, inspiré du modèle Big Five",
      body: [
        "Le test présente 20 affirmations en paires opposées, réparties sur 5 grandes dimensions : ouverture d'esprit, organisation, extraversion, agréabilité et stabilité émotionnelle. Pour chaque paire, tu choisis l'affirmation qui te correspond le plus, sur une échelle en 5 niveaux.",
        "Ces 5 dimensions sont celles du modèle Big Five (OCEAN), le cadre le plus étudié et le plus utilisé en psychologie de la personnalité depuis plusieurs décennies — contrairement à des typologies plus commerciales, il fait l'objet d'un large consensus scientifique.",
      ],
    },
    {
      heading: "Gratuit, sans compte, résultat immédiat",
      body: [
        "Aucune création de compte n'est nécessaire : tu laisses simplement ton email à la fin du test pour voir ton résultat, sans mot de passe. Le test se lance automatiquement et prend environ 5 minutes.",
        "Ton profil principal (le trait qui ressort le plus nettement de tes réponses) t'est offert immédiatement. Le détail complet des 5 dimensions, avec l'explication de chaque tendance, se débloque ensuite pour 0,99€.",
      ],
    },
    {
      heading: "Et après ce test ?",
      body: [
        "Ce format express donne une première photographie de ta personnalité, mais reste volontairement court. Si tu veux un profil plus approfondi, Profilia propose des tests plus complets sur des angles différents : le modèle DISC, un bilan de personnalité à 360°, ou encore la Process Communication.",
      ],
    },
  ],
  faq: [
    {
      question: "Le test est-il vraiment gratuit ?",
      answer:
        "Oui : les 20 questions et ton profil principal sont entièrement gratuits, sans carte bancaire. Seul le détail complet des 5 dimensions (0,99€) est optionnel.",
    },
    {
      question: "Faut-il créer un compte ?",
      answer:
        "Non. Tu laisses juste ton email pour recevoir ton résultat — aucun mot de passe, aucun compte à créer.",
    },
    {
      question: "Quelle différence avec les autres tests de personnalité du site ?",
      answer:
        "C'est le format le plus court et le seul entièrement gratuit du site : 20 questions contre 50 à 150 pour les autres tests, qui explorent chacun un modèle différent (SOSIE 2, DISC, Process Communication...) avec un rapport plus détaillé.",
    },
  ],
});

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
