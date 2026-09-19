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
export function UpsellSection() {
  return (
    <div className="mt-12 rounded-2xl border border-card-border bg-card p-6 sm:p-8">
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
            4,99&nbsp;€
            <span className="text-base font-normal text-muted"> / test</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            ou 9,99&nbsp;€/mois pour tous les tests en illimité, sans
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
