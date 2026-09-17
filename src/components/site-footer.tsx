import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-card-border/80 bg-card/40">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <p className="font-semibold tracking-tight">{SITE_NAME}</p>
            <p className="mt-2 text-sm text-muted">
              Tests de personnalité et de jugement situationnel en ligne,
              pour te connaître ou t&apos;entraîner avant un entretien de
              sélection.
            </p>
          </div>
          <nav className="flex gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-foreground/80">Le site</p>
              <Link href="/tests" className="text-muted hover:text-foreground">
                Tous les tests
              </Link>
              <Link
                href="/pricing"
                className="text-muted hover:text-foreground"
              >
                Abonnement
              </Link>
              <Link
                href="/signup"
                className="text-muted hover:text-foreground"
              >
                Créer un compte
              </Link>
            </div>
          </nav>
        </div>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          {SITE_NAME} propose des outils d&apos;entraînement conçus par des
          psychologues spécialisés en recrutement, inspirés de formats de
          tests utilisés en psychologie du travail et dans les processus de
          sélection de plusieurs secteurs, dont l&apos;aérien. Ce site est
          indépendant et n&apos;est affilié, sponsorisé ni approuvé par
          aucune compagnie aérienne ; les tests proposés sont des créations
          originales, inspirées de formats connus, et ne reproduisent aucun
          instrument propriétaire existant.
        </p>

        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
