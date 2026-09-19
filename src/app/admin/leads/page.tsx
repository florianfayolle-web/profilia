import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Only the site owner can see this — everyone else gets a plain 404, same
// as a route that doesn't exist, rather than a "forbidden" page that would
// reveal there's something here to protect.
function isAdmin(email: string | undefined) {
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allowed.includes(email.toLowerCase());
}

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!isAdmin(userData.user?.email)) {
    notFound();
  }

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("email, full_name, interested_test_slug, created_at")
    .order("created_at", { ascending: false });

  const { data: tests } = await admin.from("tests").select("slug, title");
  const titleBySlug = new Map((tests ?? []).map((t) => [t.slug, t.title]));

  const { data: leads } = await admin
    .from("marketing_leads")
    .select("email, test_slug, consent, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Inscriptions ({profiles?.length ?? 0})
      </h1>
      <p className="mt-2 text-sm text-muted">
        Email et test qui a motivé l&apos;inscription (quand connu), du plus
        récent au plus ancien.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-card-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Test qui l&apos;intéresse</th>
              <th className="px-4 py-3 font-medium">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {(profiles ?? []).map((p) => (
              <tr key={p.email}>
                <td className="px-4 py-3">{p.email}</td>
                <td className="px-4 py-3 text-muted">{p.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {p.interested_test_slug
                    ? (titleBySlug.get(p.interested_test_slug) ??
                      p.interested_test_slug)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  Aucune inscription pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 text-2xl font-semibold tracking-tight">
        Leads marketing — tests gratuits ({leads?.length ?? 0})
      </h2>
      <p className="mt-2 text-sm text-muted">
        Emails laissés pour voir le résultat d&apos;un test gratuit, sans
        création de compte. &quot;Opt-in&quot; = a coché la case
        d&apos;accord pour recevoir des communications marketing.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-card-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Test</th>
              <th className="px-4 py-3 font-medium">Opt-in</th>
              <th className="px-4 py-3 font-medium">Laissé le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {(leads ?? []).map((l, i) => (
              <tr key={`${l.email}-${i}`}>
                <td className="px-4 py-3">{l.email}</td>
                <td className="px-4 py-3 text-muted">
                  {(l.test_slug && titleBySlug.get(l.test_slug)) ?? l.test_slug ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {l.consent ? (
                    <span className="text-green-600 dark:text-green-400">Oui</span>
                  ) : (
                    <span className="text-muted-foreground">Non</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(l.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {(!leads || leads.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  Aucun lead pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
