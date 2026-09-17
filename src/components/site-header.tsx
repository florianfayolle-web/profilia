import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { SITE_NAME } from "@/lib/site";

function PlaneMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0 text-primary"
      aria-hidden="true"
    >
      <path
        d="M21 12l-7-2-2-7-2 1 1 6.5L4 9l-2 1 5.5 4L6 17l2-.5 2-2.5 5 3 1-2-4-3.5L21 12z"
        fill="currentColor"
      />
    </svg>
  );
}

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="sticky top-0 z-20 border-b border-card-border/80 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <PlaneMark />
          <span>{SITE_NAME}</span>
        </Link>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-3 overflow-x-auto text-sm whitespace-nowrap sm:gap-5">
          <Link href="/tests" className="text-muted hover:text-foreground">
            Tests
          </Link>
          <Link href="/pricing" className="text-muted hover:text-foreground">
            Abonnement
          </Link>
          {user ? (
            <>
              <Link
                href="/account"
                className="text-muted hover:text-foreground"
              >
                Mon compte
              </Link>
              <form action={logout} className="shrink-0">
                <button className="rounded-full border border-card-border px-4 py-1.5 text-foreground/80 transition hover:border-primary/40 hover:text-foreground">
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-foreground">
                Connexion
              </Link>
              <Link
                href="/signup"
                className="shrink-0 rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground shadow-sm shadow-primary/20 transition hover:opacity-90"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
