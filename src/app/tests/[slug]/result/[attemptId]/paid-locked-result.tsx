import type { ReactNode } from "react";
import { PaymentPendingNotice } from "@/components/payment-pending";
import { ConsentCheckoutButton } from "@/components/consent-checkout-button";
import { Illustration, motifForTest } from "@/components/illustration";
import { createTestCheckoutSession } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/types";
import Link from "next/link";

// A single safe, real fact pulled from the visitor's own result — a
// dominant style/type/trait *name*, never a score, percentage, or
// pass/fail-style verdict — plus the plain names of the dimensions the full
// report covers. See buildPartialTeaser() in page.tsx for how this is
// derived per format; some formats (adhd_screener) deliberately produce
// none of this because even a yes/no here would give away the one thing
// paying for the report is meant to reveal.
export type PartialTeaser = {
  headline: { label: string; value: string } | null;
  dimensionNames: string[];
};

// Locked-result screen for every paid test (not just the free/guest one):
// the visitor answers every question for free, the report is scored and
// saved, but the detailed result stays server-side until they pay. Unlike
// the old all-blur version, this now surfaces one real, ungated hook (see
// PartialTeaser above) so there's something concrete to want more of, not
// just a locked box — the actual scores/percentages/narrative never reach
// the client until the attempt is unlocked.
export function PaidLockedResult({
  testSlug,
  attemptId,
  testTitle,
  priceCents,
  currency,
  includedInSubscription,
  pendingUnlock,
  teaser,
  visual,
}: {
  testSlug: string;
  attemptId: string;
  testTitle: string;
  priceCents: number;
  currency: string;
  includedInSubscription: boolean;
  pendingUnlock: boolean;
  teaser?: PartialTeaser;
  // Overrides the generic themed Illustration blur below with something
  // more specific to this result (e.g. the animal-totem graphic) — still
  // rendered blurred by this component, so callers pass the real visual at
  // full opacity and let the lock screen do the blurring.
  visual?: ReactNode;
}) {
  if (pendingUnlock) {
    return (
      <div className="text-center">
        <PaymentPendingNotice />
      </div>
    );
  }

  const returnPath = `/tests/${testSlug}/result/${attemptId}`;

  return (
    <div className="text-left">
      {teaser?.headline ? (
        <div className="rounded-2xl border border-card-border bg-card p-6 text-center shadow-sm">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {teaser.headline.label}
          </span>
          <p className="mt-3 text-2xl font-bold text-foreground">{teaser.headline.value}</p>
          <p className="mt-3 text-sm text-foreground/80">
            Et ce n&apos;est qu&apos;un aperçu : ton profil complet t&apos;attend plus bas.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-card-border bg-card p-6 text-center shadow-sm">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Ton rapport est prêt
          </span>
          <p className="mt-3 text-2xl font-bold text-foreground">{testTitle}</p>
          <p className="mt-2 text-sm text-foreground/80">
            Tes réponses ont été enregistrées et ton profil a été calculé.
            Débloque ton rapport pour voir ton résultat détaillé, tes scores
            par dimension et les explications qui vont avec.
          </p>
        </div>
      )}

      {teaser?.dimensionNames && teaser.dimensionNames.length > 0 && (
        <div className="mt-6 rounded-2xl border border-card-border bg-card p-6">
          <p className="text-base font-semibold text-foreground">
            Ton rapport complet couvre {teaser.dimensionNames.length} dimensions
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-foreground/80 sm:grid-cols-2">
            {teaser.dimensionNames.map((name) => (
              <li key={name} className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">✓</span>
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-card-border">
        <div aria-hidden="true" className="pointer-events-none select-none opacity-90 blur-md">
          {visual ?? <Illustration motif={motifForTest(testSlug)} seed={attemptId} className="aspect-[2/1]" />}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-card/40 to-card/80">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary" aria-hidden="true">
              <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/30 bg-card p-6">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted">
            Résultat immédiat
          </span>
          <span className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted">
            Rapport PDF
          </span>
          <span className="rounded-full border border-card-border px-2.5 py-1 text-[11px] text-muted">
            Paiement sécurisé Stripe
          </span>
        </div>

        <div className="mt-5">
          <ConsentCheckoutButton
            action={createTestCheckoutSession.bind(null, testSlug, returnPath)}
            label={`Débloquer mon rapport complet, ${formatPrice(priceCents, currency)}`}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
          />
        </div>

        {includedInSubscription && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Ou{" "}
            <Link href="/pricing" className="font-medium text-primary hover:underline">
              abonne-toi
            </Link>{" "}
            pour débloquer tous les tests en illimité.
          </p>
        )}
      </div>
    </div>
  );
}
