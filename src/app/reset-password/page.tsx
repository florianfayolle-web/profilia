"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash") ?? "";
  const type = searchParams.get("type") ?? "";

  return (
    <div className="sky-gradient flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-card-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-sm text-muted">
          Choisis ton nouveau mot de passe.
        </p>

        <form action={action} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />

          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.password[0]}
              </p>
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
              className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            {state?.errors?.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.confirmPassword[0]}
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
            {pending ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
