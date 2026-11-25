"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/track-event";

// Zero-friction share of the test itself (no image, no unlocked result
// needed): WhatsApp / native share sheet / copy link, all with UTM tags so
// the visits it brings show up in /admin/stats.
export function ShareLinkButtons({
  testSlug,
  testTitle,
  className = "",
}: {
  testSlug: string;
  testTitle: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  function link(source: string) {
    return `${window.location.origin}/tests/${testSlug}?utm_source=${source}&utm_medium=share&utm_campaign=result`;
  }
  const text = `Je viens de faire le test « ${testTitle} » sur Profilia. Fais-le aussi et dis-moi ton profil :`;

  function whatsapp() {
    trackEvent("share_click", testSlug);
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${link("whatsapp")}`)}`, "_blank", "noopener");
  }
  async function copy() {
    trackEvent("share_click", testSlug);
    try {
      await navigator.clipboard.writeText(`${text} ${link("copy")}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        type="button"
        onClick={whatsapp}
        className="rounded-full border border-card-border bg-card px-4 py-2 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
      >
        Envoyer à un ami (WhatsApp)
      </button>
      <button
        type="button"
        onClick={copy}
        className="rounded-full border border-card-border bg-card px-4 py-2 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary"
      >
        {copied ? "Lien copié !" : "Copier le lien"}
      </button>
    </div>
  );
}
