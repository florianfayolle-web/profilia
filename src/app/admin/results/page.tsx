import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin-nav";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const RESULTS_LIMIT = 150;

// Every scoring function (see src/lib/assessments/scoring.ts) returns a
// different shape — there's no one field common to all 12 formats. This
// picks whichever of the usual "headline" fields exists, best-effort, so
// the table has something short to show without special-casing every
// format. The full stored result JSON is always available in the
// expandable <details> below it regardless.
function summarize(result: Record<string, unknown> | null): string {
  if (!result) return "—";
  const r = result;
  const parts: string[] = [];
  if (typeof r.band === "string") parts.push(r.band as string);
  if (typeof r.iqScore === "number") parts.push(`score ${r.iqScore}`);
  else if (typeof r.score === "number" && typeof r.total === "number") {
    parts.push(`${r.score}/${r.total}`);
  }
  if (typeof r.archetype === "string") parts.push(r.archetype as string);
  if (typeof r.dominant === "string") parts.push(r.dominant as string);
  if (typeof r.primaryType === "string") parts.push(r.primaryType as string);
  if (parts.length > 0) return parts.join(" · ");
  if (typeof r.title === "string") return r.title as string;
  return "Voir le détail";
}

export default async function AdminResultsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!isAdmin(userData.user?.email)) {
    notFound();
  }

  const admin = createAdminClient();

  const [{ data: attempts }, { data: tests }] = await Promise.all([
    admin
      .from("attempts")
      .select("id, user_id, guest_email, test_id, result, completed_at, unlocked")
      .order("completed_at", { ascending: false })
      .limit(RESULTS_LIMIT),
    admin.from("tests").select("id, slug, title"),
  ]);

  const titleById = new Map((tests ?? []).map((t) => [t.id, t.title]));
  const slugById = new Map((tests ?? []).map((t) => [t.id, t.slug]));

  const userIds = [...new Set((attempts ?? []).map((a) => a.user_id).filter((id): id is string => !!id))];
  const { data: profiles } =
    userIds.length > 0
      ? await admin.from("profiles").select("id, email").in("id", userIds)
      : { data: [] };
  const emailById = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <AdminNav active="results" />
      <h1 className="text-2xl font-semibold tracking-tight">
        Résultats des tests ({attempts?.length ?? 0})
      </h1>
      <p className="mt-2 text-sm text-muted">
        Les {RESULTS_LIMIT} tests terminés les plus récents, du plus récent au plus ancien.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-card-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Personne</th>
              <th className="px-4 py-3 font-medium">Test</th>
              <th className="px-4 py-3 font-medium">Résultat</th>
              <th className="px-4 py-3 font-medium">Payé</th>
              <th className="px-4 py-3 font-medium"></th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {(attempts ?? []).map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {new Date(a.completed_at).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  {a.user_id ? (emailById.get(a.user_id) ?? a.user_id) : (
                    <span className="text-muted-foreground">
                      invité{a.guest_email ? `: ${a.guest_email}` : ""}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  {titleById.get(a.test_id) ?? slugById.get(a.test_id) ?? a.test_id}
                </td>
                <td className="px-4 py-3">
                  {summarize(a.result as Record<string, unknown> | null)}
                </td>
                <td className="px-4 py-3">
                  {a.unlocked ? (
                    <span className="text-green-600 dark:text-green-400">Oui</span>
                  ) : (
                    <span className="text-muted-foreground">Non</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {slugById.get(a.test_id) && (
                    <Link
                      href={`/tests/${slugById.get(a.test_id)}/result/${a.id}`}
                      target="_blank"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Voir le résultat →
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3">
                  <details>
                    <summary className="cursor-pointer text-xs text-primary hover:underline">
                      JSON
                    </summary>
                    <pre className="mt-2 max-w-md overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-background p-3 text-xs text-muted-foreground">
                      {JSON.stringify(a.result, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
            {(!attempts || attempts.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted">
                  Aucun résultat pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
