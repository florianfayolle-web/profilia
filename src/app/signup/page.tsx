"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { GENDER_OPTIONS } from "@/lib/definitions";

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

        <form action={action} className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="testSlug" value={testSlug} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium">
                Prénom
              </label>
              <input
                id="firstName"
                name="firstName"
                className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
              />
              {state?.errors?.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {state.errors.firstName[0]}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium">
                Nom
              </label>
              <input
                id="lastName"
                name="lastName"
                className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
              />
              {state?.errors?.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {state.errors.lastName[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="gender" className="text-sm font-medium">
              Sexe
            </label>
            <select
              id="gender"
              name="gender"
              defaultValue=""
              className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
            >
              <option value="" disabled>
                Choisis une option
              </option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {state?.errors?.gender && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.gender[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="birthDate" className="text-sm font-medium">
              Date de naissance
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              className="mt-1 w-full rounded-md border border-card-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            {state?.errors?.birthDate && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.birthDate[0]}
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
