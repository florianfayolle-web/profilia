"use client";

import { useId, useState } from "react";
import { createPackCheckoutSession } from "@/app/actions/checkout";
import { trackEvent } from "@/lib/track-event";

// "2 reports for 2,99 EUR" on a locked paid result, logged-in buyers only.
export function PackOffer({
  testSlug,
  returnPath,
  options,
}: {
  testSlug: string;
  returnPath: string;
  options: { slug: string; title: string }[];
}) {
  const [second, setSecond] = useState(options[0]?.slug ?? "");
  const [consent, setConsent] = useState(false);
  const [hint, setHint] = useState(false);
  const id = useId();
  if (options.length === 0) return null;

  return (
    <form
      action={createPackCheckoutSession.bind(null, testSlug, returnPath)}
      className="mt-5 rounded-xl border border-card-border bg-background p-4 text-left"
    >
      <p className="text-sm font-semibold">Pack 2 rapports : 2,99 € au lieu de 3,98 €</p>
      <p className="mt-1 text-xs text-muted">Ajoute un deuxième rapport pour 1 € de plus, débloqué tout de suite.</p>
      <select
        name="second"
        value={second}
        onChange={(e) => setSecond(e.target.value)}
        className="mt-3 w-full rounded-md border border-card-border bg-card px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.title}
          </option>
        ))}
      </select>
      <label htmlFor={id} className="mt-3 flex items-start gap-2 text-xs text-muted">
        <input
          id={id}
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setHint(false);
          }}
          className="mt-0.5 h-4 w-4 shrink-0 rounded"
        />
        <span>
          Je demande l&apos;accès immédiat à ces contenus numériques et je renonce à mon droit de rétractation de 14
          jours (article L221-28 du Code de la consommation).
        </span>
      </label>
      {hint && <p className="mt-2 text-xs font-medium text-red-600">Coche la case pour continuer.</p>}
      <button
        type="submit"
        onClick={(e) => {
          if (!consent) {
            e.preventDefault();
            setHint(true);
          } else {
            trackEvent("pack_click", testSlug);
          }
        }}
        className={`mt-3 w-full rounded-full border border-primary px-6 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/5 ${consent ? "" : "opacity-60"}`}
      >
        Débloquer les 2 rapports, 2,99 €
      </button>
    </form>
  );
}
