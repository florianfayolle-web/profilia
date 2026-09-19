"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { deleteAccount, updateAccountPassword } from "@/app/actions/account";

export function AccountSettings() {
  return (
    <>
      <Suspense>
        <PasswordSection />
      </Suspense>
      <DeleteAccountSection />
    </>
  );
}

function PasswordSection() {
  const [state, action, pending] = useActionState(updateAccountPassword, undefined);
  const searchParams = useSearchParams();
  const justUpdated = searchParams.get("password") === "success";

  return (
    <section className="mt-10">
      <h2 className="text-lg font-medium">Mot de passe</h2>
      <form action={action} className="mt-3 flex flex-col gap-3 rounded-lg border border-card-border bg-card p-4">
        <div>
          <label htmlFor="password" className="text-sm font-medium">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirme le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {state?.errors?.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{state.errors.confirmPassword[0]}</p>
          )}
        </div>
        {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
        {justUpdated && !state?.message && (
          <p className="text-sm text-green-600">Mot de passe mis à jour.</p>
        )}
        <button
          disabled={pending}
          type="submit"
          className="self-start rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </button>
      </form>
    </section>
  );
}

function DeleteAccountSection() {
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);
  const canDelete = confirmText.trim().toUpperCase() === "SUPPRIMER";

  return (
    <section className="mt-10">
      <h2 className="text-lg font-medium">Supprimer mon compte</h2>
      <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-muted">
          Cette action est définitive : ton profil, tes tests débloqués et
          ton historique de résultats seront supprimés. Ton abonnement, s&apos;il
          est actif, ne sera pas résilié automatiquement — annule-le d&apos;abord
          depuis la section Abonnement ci-dessus.
        </p>

        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 rounded-full border border-red-500/40 px-5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
          >
            Supprimer mon compte
          </button>
        ) : (
          <form action={deleteAccount} className="mt-3 flex flex-col gap-3">
            <label htmlFor="confirmDelete" className="text-sm">
              Tape <span className="font-semibold">SUPPRIMER</span> pour confirmer.
            </label>
            <input
              id="confirmDelete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full max-w-xs rounded-md border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-red-500"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!canDelete}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirmer la suppression
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirmText("");
                }}
                className="rounded-full border border-card-border px-5 py-2 text-sm font-medium transition hover:border-primary/40"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
