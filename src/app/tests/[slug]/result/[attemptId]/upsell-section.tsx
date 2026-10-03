import Link from "next/link";

const BENEFITS = [
  "Des tests bien plus poussés : DISC, bilan de personnalité à 360°, Process Communication, SOSIE 2...",
  "Un rapport détaillé par dimension, avec tes points forts et tes axes de progression",
  "Un indice de fiabilité qui vérifie la cohérence de tes réponses",
  "Ton résultat téléchargeable en PDF, sauvegardé dans ton compte",
];

// Shown only under the result of a fully free test (price_cents === 0) —
// the low-friction entry point earns its keep by pointing toward the paid
// catalog right when the visitor is most curious about their profile.
export type NextTest = { slug: string; title: string; priceCents: number; hook: string };

// Short, honest reasons to take each test next — shown instead of a generic
// "see the catalogue", since the most useful next step differs per test.
export const NEXT_TEST_HOOKS: Record<string, string> = {
  orientation: "Quels métiers te correspondent ? Un test d'orientation complet, offert.",
  disc: "Ton style de communication et de travail, sur la roue des 8 profils.",
  pcm: "Ta base de personnalité, et la phase que tu traverses en ce moment.",
  "animal-totem": "Quel animal es-tu ? Court, fun, parfait à faire à plusieurs.",
  "type-cognitif-16": "Ton type parmi 16 profils cognitifs (façon MBTI).",
  bp360: "Le bilan le plus complet : 15 dimensions et un profil dominant.",
  "personnalite-50": "50 paires d'affirmations pour cerner tes 5 grandes dimensions.",
};

export function UpsellSection({
  suggestions = [],
  isGuest = false,
  currentPath,
}: {
  suggestions?: NextTest[];
  isGuest?: boolean;
  currentPath?: string;
}) {
  return (
    <div className="mt-12 rounded-2xl border border-card-border bg-card p-6 sm:p-8">
      {suggestions.length > 0 && (
        <div className="mb-8">
          <p className="text-xl font-semibold tracking-tight">Ta prochaine étape</p>
          <p className="mt-1 text-sm text-muted">
            Chaque test éclaire un autre angle de toi. Voici ceux qui complètent le mieux celui-ci.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {suggestions.map((t) => (
              <Link
                key={t.slug}
                href={`/tests/${t.slug}`}
                className="flex flex-col rounded-xl border border-card-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <span className="text-sm font-semibold leading-snug">{t.title}</span>
                <span className="mt-1 flex-1 text-xs text-muted">{t.hook}</span>
                <span className="mt-3 text-xs font-semibold text-primary">
                  {t.priceCents === 0 ? "Gratuit" : `${(t.priceCents / 100).toFixed(2).replace(".", ",")} €`} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isGuest && (
        <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <p className="font-medium">Crée ton compte gratuit</p>
          <p className="mt-1 text-sm text-muted">
            Retrouve tous tes prochains résultats au même endroit, garde tes groupes de comparaison et débloque les
            autres tests en un clic.
          </p>
          <Link
            href={currentPath ? `/signup?next=${encodeURIComponent(currentPath)}` : "/signup"}
            className="mt-3 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
          >
            Créer mon compte
          </Link>
        </div>
      )}

      <p className="text-xl font-semibold tracking-tight">
        Envie d&apos;aller plus loin ?
      </p>
      <p className="mt-2 text-muted">
        Ce test express n&apos;est qu&apos;un aperçu. Nos autres tests
        creusent beaucoup plus loin, avec un vrai rapport professionnel.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-sm font-medium text-muted-foreground">
            À partir de
          </p>
          <p className="mt-1 text-3xl font-semibold">
            0,99&nbsp;€
            <span className="text-base font-normal text-muted"> / test</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            ou 5,99&nbsp;€/mois pour tous les tests en illimité, sans
            engagement.
          </p>
          <Link
            href="/tests"
            className="mt-4 inline-block w-full rounded-full bg-primary px-6 py-3 text-center text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
          >
            Voir les autres tests
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Paiement sécurisé par Stripe. Résiliable à tout moment pour
            l&apos;abonnement.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Ce que tu obtiens en plus</p>
          <ul className="mt-3 space-y-2.5 text-sm text-muted">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10.5l3.5 3.5L16 5.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
