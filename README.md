# MonSite Tests

Site pour publier vos tests de personnalité en ligne : création de compte,
paiement à l'unité ou par abonnement (Stripe), et calcul automatique du
résultat.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript + Tailwind
- [Supabase](https://supabase.com/) : authentification + base de données Postgres
- [Stripe](https://stripe.com/) : paiement à l'unité et abonnement

## 1. Installer les dépendances

```bash
npm install
```

Node.js a été installé localement pour cette session dans
`~/.local/node` (pas besoin de Homebrew). Si vous ouvrez un nouveau
terminal et que la commande `node` n'est pas trouvée, ajoutez ceci à votre
`~/.zshrc` :

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

## 2. Créer le projet Supabase

1. Créez un compte et un projet sur [supabase.com](https://supabase.com/).
2. Dans **Project Settings > API**, récupérez :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secrète, jamais côté client)
3. Ouvrez **SQL Editor**, copiez-collez le contenu de
   [`supabase/schema.sql`](supabase/schema.sql) et exécutez-le. Cela crée
   toutes les tables et les règles de sécurité (RLS).
4. (Optionnel, pour voir un exemple fonctionnel) Exécutez ensuite
   [`supabase/seed.sql`](supabase/seed.sql) : il ajoute un test de
   démonstration complet.

### Ajouter vos tests

Deux façons d'ajouter un test, selon sa complexité :

**Test simple (une question, plusieurs choix, trait dominant)** — format
`single_choice` : une ligne dans `tests`, ses questions dans `questions`,
les choix de réponse dans `question_options` (avec un score par trait dans
la colonne `scores`), et les résultats possibles dans `result_profiles`.
Copiez le modèle dans `supabase/seed.sql` et adaptez-le.

**Tests FlyUp (SOSIE 2, TD12, ADAPT, BP360, 50 paires)** — déjà prêts dans
`content/flyup/*.json`, avec leur propre moteur de scoring dans
`src/lib/assessments/scoring.ts` (choix forcé par paires/quadruplets,
jugement situationnel, échelle de Likert, paires bipolaires). Pour les
publier :

```bash
npm run import:assessments
```

Ce script lit les fichiers JSON et crée/actualise les lignes `tests` +
`test_content` correspondantes dans Supabase (il faut que `.env.local`
contienne vos vraies clés Supabase — voir étape 2). Il attribue un prix
provisoire de 4,99 € à chacun : ajustez `price_cents` (et `stripe_price_id`
une fois le produit créé côté Stripe, voir étape 3) directement dans la
table `tests` selon vos tarifs réels. Voir
[`content/flyup/README.md`](content/flyup/README.md) pour le détail de
chaque test.

Si vous ajoutez un nouveau test qui ne correspond à aucun de ces formats,
dites-le-moi — la logique de calcul est dans `src/lib/assessments/scoring.ts`
(nouveaux formats) ou `src/app/actions/attempts.ts` (`single_choice`).

## 3. Configurer Stripe

1. Créez un compte sur [stripe.com](https://stripe.com/) (le mode **Test**
   est activé par défaut, aucune vraie carte n'est nécessaire pour développer).
2. Dans **Developers > API keys**, récupérez la clé secrète →
   `STRIPE_SECRET_KEY`.
3. Pour chaque test payant à l'unité : **Product catalog > Add product**,
   créez un prix unique (one-time), copiez son `price_xxx` dans la colonne
   `stripe_price_id` du test correspondant (table `tests`).
4. Pour l'abonnement illimité : créez un produit avec un prix récurrent
   (recurring), copiez son id dans `STRIPE_SUBSCRIPTION_PRICE_ID`.
5. Webhook (indispensable pour valider les paiements) :
   - En local : installez la [Stripe CLI](https://docs.stripe.com/stripe-cli),
     puis lancez `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
     Elle affiche un secret `whsec_...` → `STRIPE_WEBHOOK_SECRET`.
   - En production : **Developers > Webhooks > Add endpoint**, URL
     `https://votredomaine.com/api/webhooks/stripe`, événements à écouter :
     `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`.

## 4. Variables d'environnement

Copiez `.env.local.example` vers `.env.local` et remplissez les valeurs
récupérées aux étapes précédentes.

```bash
cp .env.local.example .env.local
```

## 5. Lancer le site en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

Pour tester un paiement, utilisez une carte de test Stripe, par exemple
`4242 4242 4242 4242`, une date future, et n'importe quel CVC.

## 6. Déployer

Le plus simple est [Vercel](https://vercel.com/) (créé par l'équipe
Next.js) : connectez votre dépôt Git, ajoutez les mêmes variables
d'environnement dans les réglages du projet Vercel, et pensez à mettre à
jour `NEXT_PUBLIC_SITE_URL` avec votre vrai domaine ainsi que le webhook
Stripe en production (voir étape 3).

## Structure du projet

- `src/app/tests` — catalogue, page de vente, prise du test, résultat
- `src/app/account` — tableau de bord utilisateur (abonnement, achats, historique)
- `src/app/pricing` — page d'abonnement
- `src/app/actions` — Server Actions (auth, checkout Stripe, calcul du résultat)
- `src/app/api/webhooks/stripe` — réception des événements Stripe
- `src/lib/access.ts` — logique centrale qui décide qui a accès à quel test
- `supabase/schema.sql` — schéma de base de données + sécurité (RLS)
- `supabase/seed.sql` — exemple de test, modèle pour en ajouter
