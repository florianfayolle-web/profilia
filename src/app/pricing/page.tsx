import type { Metadata } from "next";
import Link from "next/link";
import { createSubscriptionCheckoutSession } from "@/app/actions/checkout";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "4,99€ pour débloquer un test à l'unité, ou 9,99€/mois pour débloquer tous les tests en illimité. Annulable à tout moment.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <div className="sky-gradient">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Nos tarifs</h1>
        <p className="mt-4 text-muted">
          Débloque le test de ton choix à l&apos;unité, ou{" "}
          <strong className="text-foreground">tous les tests</strong> en
          illimité avec l&apos;abonnement.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-card-border bg-card p-8 shadow-sm">
            <p className="text-sm font-medium text-muted">À l&apos;unité</p>
            <p className="mt-2 text-4xl font-semibold">
              4,99&nbsp;€
              <span className="text-base font-normal text-muted">
                {" "}
                / test
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-left text-sm text-muted">
              <li>Le test de ton choix, débloqué à vie</li>
              <li>Rapport détaillé et résultat sauvegardé dans ton compte</li>
              <li>Aucun engagement</li>
            </ul>
            <Link
              href="/tests"
              className="mt-8 w-full rounded-full border border-card-border px-6 py-3 text-sm font-medium transition hover:border-primary/40"
            >
              Choisir un test
            </Link>
          </div>

          <div className="relative flex flex-col rounded-xl border border-primary/40 bg-card p-8 shadow-sm">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Le plus avantageux
            </span>
            <p className="text-sm font-medium text-muted">
              Abonnement illimité
            </p>
            <p className="mt-2 text-4xl font-semibold">
              9,99&nbsp;€
              <span className="text-base font-normal text-muted">
                {" "}
                / mois
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-left text-sm text-muted">
              <li>Tous les tests débloqués, sans limite de nombre</li>
              <li>
                Nouveaux tests ajoutés régulièrement, inclus automatiquement
              </li>
              <li>Annulable à tout moment</li>
            </ul>
            <form action={createSubscriptionCheckoutSession} className="mt-8">
              <button className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90">
                S&apos;abonner
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
