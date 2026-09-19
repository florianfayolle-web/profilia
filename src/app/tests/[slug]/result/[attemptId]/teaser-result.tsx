import type { ReactNode } from "react";
import { PaymentPendingNotice } from "@/components/payment-pending";
import { createUnlockCheckoutSession } from "@/app/actions/checkout";
import { RadarChart } from "@/components/dimension-charts";

// Deliberately NOT the real scoring.ts result type: this is a redacted view
// built server-side in page.tsx for the locked (unpaid) state. It must
// never carry the visitor's actual scores/percentages/commentary — those
// only exist client-side once `unlocked` is true, otherwise the "blur" is
// cosmetic only and the real result is readable from the page source /
// RSC payload regardless of the CSS.
export type TeaserData = {
  mainProfile: { trait: string; description: string } | null;
  dimensions: { key: string; name: string }[];
};

// Fixed, non-personal placeholder shape for the blurred preview chart — it
// must not encode anything about this visitor's real answers.
const PLACEHOLDER_CHART_VALUES = [0.6, 0.8, 0.45, 0.7, 0.55];

// One generic icon + a benefit-framed teaser line + a distinct vivid color
// per Big Five dimension — gives the locked list real texture instead of
// five identical lock icons, a flat "tendance et explication" repeated
// five times, and a single monochrome accent everywhere.
const DIMENSION_MEDIA: Record<
  string,
  { icon: ReactNode; hook: string; color: string }
> = {
  ouverture: {
    icon: (
      <path
        d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.5h6c0-1.2.4-1.9 1-2.5A6 6 0 0 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    hook: "ce que tu recherches vraiment dans une idée nouvelle",
    color: "#7c3aed",
  },
  organisation: {
    icon: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    hook: "comment tu réagis vraiment face à l'imprévu",
    color: "#2563eb",
  },
  extraversion: {
    icon: (
      <>
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M14.5 15.2c1.9.4 3.5 2 3.5 3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
    hook: "ce qui te ressource vraiment après une journée chargée",
    color: "#ea580c",
  },
  agreabilite: {
    icon: (
      <path
        d="M12 20s-7-4.4-9-8.4C1.6 8.6 3 5.5 6 5c2-.3 3.6.7 4.5 2.2.2.3.7.3.9 0C12.4 5.7 14 4.7 16 5c3 .5 4.4 3.6 3 6.6C19 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    hook: "ta façon de gérer un désaccord sans le fuir ni l'envenimer",
    color: "#e11d48",
  },
  stabilite: {
    icon: (
      <path
        d="M12 3l7 3v5c0 4.5-3 7.7-7 10-4-2.3-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    hook: "ce qui te fait vraiment perdre — ou garder — tes moyens",
    color: "#0d9488",
  },
};

function DimensionIcon({ dimKey }: { dimKey: string }) {
  const media = DIMENSION_MEDIA[dimKey];
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: `${media?.color ?? "#8B1E3F"}1a` }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4.5 w-4.5"
        style={{ color: media?.color ?? "var(--primary)" }}
        aria-hidden="true"
      >
        {media?.icon}
      </svg>
    </span>
  );
}

// Shown instead of the full ResultView for a guest attempt on the free test
// until the unlock micro-payment lands: one real, ungated detail (the main
// profile trait) as the hook, then a blurred preview of the rest behind a
// paywall card.
export function TeaserResult({
  result,
  testSlug,
  attemptId,
  pendingUnlock,
}: {
  result: TeaserData;
  testSlug: string;
  attemptId: string;
  pendingUnlock: boolean;
}) {
  if (pendingUnlock) {
    return (
      <div className="text-center">
        <PaymentPendingNotice />
      </div>
    );
  }

  return (
    <div className="text-left">
      {result.mainProfile && (
        <div className="rounded-2xl border border-card-border bg-card p-6 text-center shadow-sm">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Ton profil principal
          </span>
          <p className="mt-3 text-2xl font-bold text-foreground">
            {result.mainProfile.trait}
          </p>
          <p className="mt-2 text-sm text-foreground/80">
            {result.mainProfile.description}
          </p>
          <p className="mt-3 text-sm font-medium text-primary">
            Et ce n&apos;est qu&apos;un début : 5 dimensions complètes t&apos;attendent plus bas.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-card-border bg-card p-6">
        <p className="text-base font-semibold text-foreground">
          Un rapport qui va plus loin qu&apos;un simple résultat
        </p>
        <p className="mt-2 text-sm text-foreground/80">
          Ton rapport complet ne se contente pas de te donner un score par
          dimension : il t&apos;explique le pourquoi et le comment de chacune
          de tes tendances — en clair, ce que tu ne sais peut-être pas encore
          sur toi.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-foreground/80">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">✓</span>
            Comprendre tes points de vigilance pour mieux les anticiper.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">✓</span>
            Identifier les atouts sur lesquels t&apos;appuyer pour progresser.
          </li>
        </ul>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-card-border bg-card">
        <p className="pt-6 text-center text-sm font-semibold text-foreground">
          Ton graphique de personnalité
        </p>

        {/* Fixed-height stage: the chart blur and the unlock card both live
            in this one screen's-worth of height, so the CTA is visible
            immediately, no scrolling required to find it. */}
        <div className="relative flex h-[300px] items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none select-none opacity-90 blur-[3px]"
          >
            <RadarChart
              data={result.dimensions.map((d, i) => ({
                label: d.name,
                value: PLACEHOLDER_CHART_VALUES[i % PLACEHOLDER_CHART_VALUES.length],
              }))}
              size={260}
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-card/50 to-card">
            <div className="mx-4 w-full max-w-xs rounded-2xl border border-card-border bg-card p-5 text-center shadow-lg">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                >
                  <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <p className="mt-3 font-semibold">Ton profil te ressemble déjà.</p>
              <p className="mt-1 text-xs text-muted">Découvre à quel point.</p>
              <form
                action={createUnlockCheckoutSession.bind(null, testSlug, attemptId)}
                className="mt-3"
              >
                <button className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90">
                  Voir mon graphique — 0,99&nbsp;€
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-card-border bg-card px-6 py-5">
          <p className="text-base font-semibold">
            5 dimensions. 5 vérités sur toi. Prêt&#8239;?
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {result.dimensions.map((d) => (
              <li key={d.key} className="flex items-start gap-3">
                <DimensionIcon dimKey={d.key} />
                <span>
                  <span className="font-medium text-foreground">{d.name}</span> —{" "}
                  {DIMENSION_MEDIA[d.key]?.hook ?? "ta tendance, expliquée en détail"}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
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

          <form
            action={createUnlockCheckoutSession.bind(null, testSlug, attemptId)}
            className="mt-5"
          >
            <button className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90">
              Débloquer mon rapport complet — 0,99&nbsp;€
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Moins cher qu&apos;un café, pour te connaître un peu mieux.
          </p>
        </div>
      </div>
    </div>
  );
}
