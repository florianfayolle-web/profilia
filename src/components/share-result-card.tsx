"use client";

import { useState } from "react";

// "Post my result on Instagram": builds the story image from the stored
// result (/api/share-card), then hands it to the phone's share sheet, where
// Instagram (story / message) is offered. Where file sharing isn't
// supported (desktop), the image is downloaded and the caption copied.
// The link carries UTM tags so the visits show up in /admin/stats.
export function ShareResultCard({
  attemptId,
  testSlug,
  testTitle,
}: {
  attemptId: string;
  testSlug: string;
  testTitle: string;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function share() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/share-card/${attemptId}`);
      if (!res.ok) throw new Error("image");
      const blob = await res.blob();
      const file = new File([blob], "mon-profil-profilia.png", { type: "image/png" });
      const link = `${window.location.origin}/tests/${testSlug}?utm_source=instagram&utm_medium=share&utm_campaign=result`;
      const caption = `J'ai fait le test « ${testTitle} » sur Profilia. Et toi, quel profil es-tu ? Viens me défier : ${link}`;
      try {
        await navigator.clipboard.writeText(caption);
      } catch {}

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: caption });
          setMessage(
            "Dans une story Instagram, ajoute le sticker « Lien » et colle le texte copié pour que tes amis puissent cliquer."
          );
          return;
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mon-profil-profilia.png";
      a.click();
      setMessage(
        "Image téléchargée et texte copié. Ouvre Instagram, ajoute l'image à ta story, puis le sticker « Lien » avec le lien copié."
      );
    } catch {
      setError("Impossible de préparer l'image pour le moment. Réessaie dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="partager" className="mt-10 scroll-mt-24 rounded-xl border border-card-border bg-card p-6 text-left print:hidden">
      <div className="flex gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/share-card/${attemptId}`}
          alt="Aperçu de ta carte à partager"
          className="hidden h-40 w-auto shrink-0 rounded-lg border border-card-border sm:block"
          loading="lazy"
        />
        <div>
          <p className="text-lg font-semibold">Montre ton profil sur Instagram</p>
          <p className="mt-1 text-sm text-muted">
            Une belle carte avec ton résultat, prête pour ta story : tes amis cliquent sur le lien et te défient
            de faire le même test.
          </p>
          <button
            type="button"
            onClick={share}
            disabled={busy}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Préparation…" : "Publier sur Instagram"}
          </button>
          {message && <p className="mt-3 text-sm text-muted">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
