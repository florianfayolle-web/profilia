import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { AuthNav } from "@/components/auth-nav";
import { MobileMenu } from "@/components/mobile-menu";
import { ProfiliaMark } from "@/components/profilia-mark";

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
          className="flex shrink-0 items-center gap-2 text-xl font-semibold tracking-tight"
        >
          <ProfiliaMark size={36} className="shrink-0" />
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
