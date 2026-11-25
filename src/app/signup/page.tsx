"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const testSlugMatch = next.match(/^\/tests\/([^/?]+)/);
  const testSlug = testSlugMatch?.[1] ?? "";

  return (
    <div className="sky-gradient flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-card-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Créer un compte
        </h1>
        <p className="mt-2 text-sm text-muted">
          Déjà inscrit ?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="text-primary hover:underline"
          >
            Connecte-toi
          </Link>
        </p>

        <div className="mt-6">
          <GoogleAuthButton next={next || undefined} />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-card-border" />
          ou avec ton email
          <div className="h-px flex-1 bg-card-border" />
        </div>

        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="testSlug" value={testSlug} />
          <div>
            <label htmlFor="firstName" className="text-sm font-medium">
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            {state?.errors?.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.firstName[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              autoComplete="email"
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
            <label htmlFor="password" className="text-sm font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {state?.message && (
            <p
              className={
                state.success
                  ? "text-sm text-green-600"
                  : "text-sm text-red-600"
              }
            >
              {state.message}
            </p>
          )}

          <button
            disabled={pending}
            type="submit"
            className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Création..." : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
