"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";

// Split out of SiteHeader so the header's static nav (and every page that
// renders it) can be cached: this is the only part that needs to know
// whether the visitor is logged in, and it finds out in the browser instead
// of on the server, so rendering the page itself never touches cookies.
// `compact`: used next to the mobile hamburger, where there's only room for
// one small control — a link to the account, or a single "sign up" pill.
export function AuthNav({ compact = false }: { compact?: boolean }) {
  const [user, setUser] = useState<{ email?: string } | null | undefined>(
    undefined
  );
  const pathname = usePathname();

  // The header is part of the persistent root layout, so it never remounts
  // on an in-app navigation (e.g. the redirect a login Server Action does).
  // Re-checking on every pathname change is what actually notices a login
  // or logout that just happened server-side — without it, the nav only
  // ever picked up the real state after a full page load (leaving through
  // Stripe checkout and back counts; a plain client-side redirect doesn't).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Undefined = not resolved yet: render nothing rather than guessing, to
  // avoid a flash of the wrong state before the browser confirms it.
  if (user === undefined) {
    return <span className="h-8 w-8 shrink-0" aria-hidden="true" />;
  }

  if (compact) {
    return user ? (
      <Link
        href="/account"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-card-border text-foreground/80"
        aria-label="Mon compte"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            fill="currentColor"
          />
        </svg>
      </Link>
    ) : (
      <Link
        href="/signup"
        className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition hover:opacity-90"
      >
        Créer un compte
      </Link>
    );
  }

  if (user) {
    return (
      <>
        <Link href="/account" className="text-muted hover:text-foreground">
          Mon compte
        </Link>
        <form action={logout} className="shrink-0">
          <button className="rounded-full border border-card-border px-4 py-1.5 text-foreground/80 transition hover:border-primary/40 hover:text-foreground">
            Déconnexion
          </button>
        </form>
      </>
    );
  }

  return (
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
  );
}
