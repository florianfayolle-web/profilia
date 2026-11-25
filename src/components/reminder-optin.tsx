"use client";

import { useState, useTransition } from "react";
import { optInReminder } from "@/app/actions/reminder";
import { trackEvent } from "@/lib/track-event";

// Shown at the top of a guest's result, the moment they care most: one
// explicit click (never pre-ticked) to get the result link + advice by email.
export function ReminderOptIn({ attemptId }: { attemptId: string }) {
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <div className="mb-6 rounded-xl border border-green-600/30 bg-green-600/5 px-4 py-3 text-sm text-green-700 dark:text-green-400 print:hidden">
        C&apos;est noté : tu recevras le lien de ton résultat demain par email.
      </div>
    );
  }
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-card-border bg-card px-4 py-3 text-left print:hidden sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-foreground/80">
        <span className="font-medium text-foreground">Garde ton résultat sous la main.</span>{" "}
        Reçois-le par email demain, avec quelques conseils pour aller plus loin. Désinscription en un clic.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await optInReminder(attemptId);
            if (r.ok) {
              trackEvent("reminder_optin");
              setDone(true);
            } else setFailed(true);
          })
        }
        className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "…" : failed ? "Réessayer" : "Oui, envoie-moi mon résultat"}
      </button>
    </div>
  );
}
