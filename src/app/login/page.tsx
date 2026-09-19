"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/tests";
  const resetSuccess = searchParams.get("reset") === "success";
  const linkError = searchParams.get("error");

  return (
    <div className="sky-gradient flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-card-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="mt-2 text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link
            href={
              next !== "/tests"
                ? `/signup?next=${encodeURIComponent(next)}`
                : "/signup"
            }
            className="text-primary hover:underline"
          >
            Inscris-toi
          </Link>
        </p>

        {resetSuccess && (
          <p className="mt-4 text-sm text-green-600">
            Mot de passe mis à jour, tu peux te connecter.
          </p>
        )}
        {linkError && <p className="mt-4 text-sm text-red-600">{linkError}</p>}

        <form action={action} className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.password[0]}
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
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
