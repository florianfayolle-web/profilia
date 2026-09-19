"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined
  );

  return (
    <div className="sky-gradient flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-card-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-sm text-muted">
          Indique ton email, on t&apos;envoie un lien pour choisir un nouveau
          mot de passe.
        </p>

        {state?.success ? (
          <p className="mt-6 text-sm text-green-600">{state.message}</p>
        ) : (
          <form action={action} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoFocus
                className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
              />
              {state?.errors?.email && (
                <p className="mt-1 text-sm text-red-600">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {state?.message && (
              <p className="text-sm text-red-600">{state.message}</p>
            )}

            <button
              disabled={pending}
              type="submit"
              className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-muted">
          <Link href="/login" className="text-primary hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
