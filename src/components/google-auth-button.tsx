"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Same button/flow for both login and signup — Supabase's OAuth sign-in
// creates the account on first use, so there's no separate "sign up with
// Google" action to write. The profile row is filled in by the same
// database trigger that handles email/password signup (id + email only);
// first name/last name/gender/birth date stay empty for a Google account
// since Google only ever hands over name + email + avatar.
export function GoogleAuthButton({ next }: { next?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (next) redirectTo.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });

    if (error) {
      setError("Impossible de démarrer la connexion avec Google.");
      setPending(false);
    }
    // On success the browser is redirected to Google immediately — no
    // further client-side state change happens on this page.
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2.5 rounded-md border border-card-border bg-background px-3 py-2.5 text-sm font-medium transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.66Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3.01c-1.08.72-2.46 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.27a12 12 0 0 0 0 10.75l4-3.11Z" />
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1c.95-2.85 3.6-4.98 6.73-4.98Z" />
        </svg>
        {pending ? "Redirection…" : "Continuer avec Google"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
