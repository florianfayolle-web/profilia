"use client";

import { useId, useState } from "react";

// A digital-content purchase (unlocking a result right away) falls under
// the French Code de la consommation's withdrawal-right exception
// (art. L221-28): the buyer must expressly waive the 14-day right before
// paying, not just accept it buried in the CGV. This wraps any checkout
// server action with that checkbox, and keeps the submit button disabled
// until it's ticked — never pre-checked.
export function ConsentCheckoutButton({
  action,
  label,
  className,
  note,
}: {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  className: string;
  note?: string;
}) {
  const [consent, setConsent] = useState(false);
  const id = useId();

  return (
    <form action={action}>
      <label htmlFor={id} className="flex items-start gap-2 text-left text-xs text-muted">
        <input
          id={id}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-card-border"
        />
        <span>
          Je demande l&apos;accès immédiat à ce contenu numérique et je
          reconnais renoncer à mon droit de rétractation de 14 jours
          (article L221-28 du Code de la consommation).
        </span>
      </label>
      <button
        type="submit"
        disabled={!consent}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {label}
      </button>
      {note && <p className="mt-2 text-center text-xs text-muted-foreground">{note}</p>}
    </form>
  );
}
