# Contenu FlyUp

Ces fichiers sont les tests de personnalité/jugement fournis pour le site,
originaires du dossier `Test personnalité` (projet FlyUp). Ils ont été
conçus comme des **outils d'entraînement inspirés** de formats de tests
psychométriques professionnels (SOSIE 2, TD12, ADAPT) — pas des
reproductions des instruments propriétaires eux-mêmes. Chaque fichier porte
son propre avertissement dans `meta.disclaimer` (ou `instructions`), repris
automatiquement dans la description publique du test par
`scripts/import-assessments.mjs`.

| Fichier | Format (`tests.format`) | Items | Dimensions |
|---|---|---|---|
| `sosie2-fr.json` / `sosie2-en.json` | `forced_choice_pair` | 110 (100 + 10 contrôle) | 10 |
| `td12-fr.json` / `td12-en.json` | `situational_judgment` | 110 (100 + 10 contrôle) | 10 |
| `adapt-fr.json` / `adapt-en.json` | `forced_choice_quad` | 110 (100 + 10 contrôle) | 10 |
| `bp360.json` | `likert_scale` | 150 | 15 (+ 8 profils) |
| `test50.json` | `bipolar_pairs` | 50 | 5 |

Ces fichiers sont des **exports**, pas la source de vérité : si le contenu
(questions, dimensions, textes de rapport) doit changer, les scripts
Python générateurs originaux (livrés séparément, hors de ce dépôt) restent
la référence — éditez-les puis ré-exportez, plutôt que d'éditer ces JSON
à la main.

Pour les publier sur le site : voir `scripts/import-assessments.mjs` et la
section correspondante du [README](../../README.md) principal.
