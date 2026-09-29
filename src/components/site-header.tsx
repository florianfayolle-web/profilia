import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { AuthNav } from "@/components/auth-nav";
import { MobileMenu } from "@/components/mobile-menu";

function PlaneMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-6 w-6 shrink-0" aria-hidden="true">
      <g transform="translate(1.5 0)">
        <rect x="14" y="10" width="9" height="44" rx="4.5" fill="#0b6e7a" />
        <path
          d="M18.5 14.5H30a11.5 11.5 0 0 1 0 23H18.5"
          fill="none"
          stroke="#0b6e7a"
          strokeWidth="9"
        />
        <circle cx="30" cy="26" r="4" fill="#e8590c" />
      </g>
    </svg>
  );
}

const NAV_LINKS = (
  <>
    <Link href="/" className="text-muted hover:text-foreground">
      Accueil
    </Link>
    <Link href="/tests" className="text-muted hover:text-foreground">
      Tests
    </Link>
    <Link href="/guides" className="text-muted hover:text-foreground">
      Guides
    </Link>
    <Link href="/blog" className="text-muted hover:text-foreground">
      Blog
    </Link>
  </>
);

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-card-border/80 bg-background/85 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <PlaneMark />
          <span>{SITE_NAME}</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-end gap-5 text-sm whitespace-nowrap sm:flex">
          {NAV_LINKS}
          <AuthNav />
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:hidden">
          <AuthNav compact />
          <MobileMenu>
            {NAV_LINKS}
            <div className="flex flex-col gap-3 border-t border-card-border pt-3">
              <AuthNav />
            </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
