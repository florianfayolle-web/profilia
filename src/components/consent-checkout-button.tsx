"use client";

import { useId, useState } from "react";

// A digital-content purchase (unlocking a result right away) falls under
// the French Code de la consommation's withdrawal-right exception
// (art. L221-28): the buyer must expressly waive the 14-day right before
// paying, not just accept it buried in the CGV. This wraps any checkout
// server action with that checkbox, and keeps the submit button disabled
// from going through until it's ticked — never pre-checked.
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
  const [showHint, setShowHint] = useState(false);
  const id = useId();

  return (
    <form action={action}>
      <label htmlFor={id} className="flex items-start gap-2 text-left text-xs text-muted">
        <input
          id={id}
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setShowHint(false);
          }}
          className={`mt-0.5 h-4 w-4 shrink-0 rounded ${showHint ? "border-red-500 outline outline-2 outline-red-500" : "border-card-border"}`}
        />
        <span>
          Je demande l&apos;accès immédiat à ce contenu numérique et je
          reconnais renoncer à mon droit de rétractation de 14 jours
          (article L221-28 du Code de la consommation).
        </span>
      </label>
      {showHint && (
        <p className="mt-2 text-left text-xs font-medium text-red-600">
          Coche la case ci-dessus pour continuer vers le paiement.
        </p>
      )}
      {/* Not `disabled`: a greyed-out button gave no hint why it did nothing.
          The waiver still has to be ticked — submitting without it just
          shows what's missing. */}
      <button
        type="submit"
        onClick={(e) => {
          if (!consent) {
            e.preventDefault();
            setShowHint(true);
          }
        }}
        aria-disabled={!consent}
        className={`${className} ${consent ? "" : "opacity-60"}`}
      >
        {label}
      </button>
      {note && <p className="mt-2 text-center text-xs text-muted-foreground">{note}</p>}
    </form>
  );
}
