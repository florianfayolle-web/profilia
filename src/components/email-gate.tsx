"use client";

import { useState } from "react";

export function EmailGate({
  onSubmit,
  pending,
  error,
}: {
  onSubmit: (email: string, consent: boolean) => void;
  pending: boolean;
  error: string | null;
}) {
  const [email, setEmail] = useState("");
  // Unchecked by default: under GDPR/CNIL rules, marketing consent must be
  // an active opt-in, never pre-ticked.
  const [consent, setConsent] = useState(false);

  return (
    <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
      <p className="text-lg font-semibold tracking-tight">
        Ton profil est prêt 🎉
      </p>
      <p className="mt-2 text-sm text-muted">
        Entre ton email pour voir ton résultat complet — pas de mot de passe,
        pas de compte à créer.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!pending) onSubmit(email, consent);
        }}
        className="mt-4"
      >
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="toi@exemple.com"
          className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none focus:border-primary/50"
        />

        <label className="mt-3 flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-card-border"
          />
          <span>
            (Facultatif) J&apos;accepte de recevoir par email des conseils et
            des offres sur les autres tests Profilia. Désinscription possible
            à tout moment.
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Calcul de ton profil…" : "Voir mon résultat →"}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </form>

      <p className="mt-3 text-xs text-muted-foreground">
        Ton email ne sera jamais transmis à un tiers.
      </p>
    </div>
  );
}
