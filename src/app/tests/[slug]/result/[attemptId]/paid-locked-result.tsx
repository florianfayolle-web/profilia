import { PaymentPendingNotice } from "@/components/payment-pending";
import { ConsentCheckoutButton } from "@/components/consent-checkout-button";
import { Illustration, motifForTest } from "@/components/illustration";
import { createTestCheckoutSession } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/types";
import Link from "next/link";

// Locked-result screen for every paid test (not just the free/guest one):
// the visitor answers every question for free, the report is scored and
// saved, but the actual result stays server-side until they pay — this
// component deliberately never receives the real result, only the test's
// own metadata, so there is nothing format-specific to redact and nothing
// real to leak regardless of which of the 12 assessment formats it is.
export function PaidLockedResult({
  testSlug,
  attemptId,
  testTitle,
  priceCents,
  currency,
  includedInSubscription,
  pendingUnlock,
}: {
  testSlug: string;
  attemptId: string;
  testTitle: string;
  priceCents: number;
  currency: string;
  includedInSubscription: boolean;
  pendingUnlock: boolean;
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

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-card-border">
        <div aria-hidden="true" className="pointer-events-none select-none opacity-90 blur-md">
          <Illustration motif={motifForTest(testSlug)} seed={attemptId} className="aspect-[2/1]" />
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
