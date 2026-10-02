"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup, joinGroup } from "@/app/actions/groups";
import { clearPendingGroup, getPendingGroup, saveMemberToken } from "@/components/group-client";

// Shown on the result page of an eligible test: either "join the group you
// were invited to" (if the visitor came from a group link) or "compare with
// friends" (create a group). Nothing is shared until the box is ticked.
export function GroupCard({ attemptId, testSlug }: { attemptId: string; testSlug: string }) {
  const router = useRouter();
  const [pendingGroup, setPendingGroup] = useState<{ code: string; name: string | null } | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = getPendingGroup();
    if (p && p.testSlug === testSlug) {
      setPendingGroup({ code: p.code, name: p.name });
      setOpen(true);
    }
  }, [testSlug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = pendingGroup
      ? await joinGroup(attemptId, pendingGroup.code, name, consent)
      : await createGroup(attemptId, name, consent, groupName);
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    saveMemberToken(res.memberId, res.token);
    clearPendingGroup();
    router.push(`/groupe/${res.code}`);
  }

  const input =
    "mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <div className="mt-10 rounded-xl border border-primary/30 bg-card p-6 text-left print:hidden">
      <p className="text-lg font-semibold">
        {pendingGroup ? `Rejoindre le groupe${pendingGroup.name ? ` « ${pendingGroup.name} »` : ""}` : "Compare ton profil avec tes amis"}
      </p>
      <p className="mt-1 text-sm text-muted">
        {pendingGroup
          ? "Tu as été invité·e à comparer ce test : ajoute ton profil au groupe pour voir les autres."
          : "Invite des proches à faire ce test et comparez vos profils côte à côte, en couple, entre amis ou en équipe."}
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
        >
          Créer un groupe et inviter
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <label className="text-sm font-medium">
            Ton prénom ou pseudo
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required className={input} />
          </label>
          {!pendingGroup && (
            <label className="text-sm font-medium">
              Nom du groupe <span className="font-normal text-muted-foreground">(facultatif)</span>
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)} maxLength={30} placeholder="Ex. : La bande, Famille, Équipe" className={input} />
            </label>
          )}
          <label className="flex items-start gap-2 text-xs text-muted">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            <span>
              J&apos;accepte que mon prénom et un <strong>résumé</strong> de mon résultat (profil et scores par
              dimension, jamais mes réponses) soient visibles par les personnes qui ont le lien du groupe. Je
              pourrai me retirer à tout moment.
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy || !consent || !name.trim()}
            className="self-start rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "…" : pendingGroup ? "Rejoindre le groupe" : "Créer le groupe"}
          </button>
        </form>
      )}
    </div>
  );
}
