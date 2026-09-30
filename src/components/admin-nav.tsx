import Link from "next/link";

const LINKS = [
  { href: "/admin/stats", label: "Stats" },
  { href: "/admin/results", label: "Résultats" },
  { href: "/admin/leads", label: "Leads & inscriptions" },
];

export function AdminNav({ active }: { active: "stats" | "results" | "leads" }) {
  return (
    <nav className="mb-10 flex gap-2 border-b border-card-border pb-4">
      {LINKS.map((l) => {
        const key = l.href.split("/").pop();
        const isActive = key === active;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:bg-card-border/40"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
