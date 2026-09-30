import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin-nav";

export const metadata: Metadata = { robots: { index: false, follow: false } };

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const euros = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export default async function AdminStatsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!isAdmin(userData.user?.email)) {
    notFound();
  }

  const admin = createAdminClient();
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 24 * 3600_000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 24 * 3600_000).toISOString();

  const [
    { count: usersTotal },
    { count: users7 },
    { count: users30 },
    { count: attemptsTotal },
    { count: attempts7 },
    { count: attempts30 },
    { count: views7 },
    { count: views30 },
    { count: activeSubs },
    { data: paidPurchases },
    { data: attemptsByTest },
    { data: tests },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", d7),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", d30),
    admin.from("attempts").select("id", { count: "exact", head: true }),
    admin.from("attempts").select("id", { count: "exact", head: true }).gte("completed_at", d7),
    admin.from("attempts").select("id", { count: "exact", head: true }).gte("completed_at", d30),
    admin.from("page_views").select("id", { count: "exact", head: true }).gte("viewed_at", d7),
    admin.from("page_views").select("id", { count: "exact", head: true }).gte("viewed_at", d30),
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "trialing"]),
    admin.from("purchases").select("amount_cents, created_at").eq("status", "paid"),
    admin.from("attempts").select("test_id"),
    admin.from("tests").select("id, slug, title, price_cents"),
  ]);

  const titleById = new Map((tests ?? []).map((t) => [t.id, t.title]));
  const priceById = new Map((tests ?? []).map((t) => [t.id, t.price_cents]));

  const revenueTotal = (paidPurchases ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const revenue30 = (paidPurchases ?? [])
    .filter((p) => p.created_at >= d30)
    .reduce((s, p) => s + (p.amount_cents ?? 0), 0);

  const countByTest = new Map<string, number>();
  for (const a of attemptsByTest ?? []) {
    countByTest.set(a.test_id, (countByTest.get(a.test_id) ?? 0) + 1);
  }
  const topTests = [...countByTest.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([id, count]) => ({
      id,
      title: titleById.get(id) ?? id,
      count,
      isPaid: (priceById.get(id) ?? 0) > 0,
    }));
  const maxCount = topTests[0]?.count ?? 1;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <AdminNav active="stats" />
      <h1 className="text-2xl font-semibold tracking-tight">Statistiques</h1>
      <p className="mt-2 text-sm text-muted">Vue d&apos;ensemble de l&apos;activité du site.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Comptes créés" value={String(usersTotal ?? 0)} sub={`+${users7 ?? 0} sur 7j · +${users30 ?? 0} sur 30j`} />
        <StatCard label="Tests passés" value={String(attemptsTotal ?? 0)} sub={`+${attempts7 ?? 0} sur 7j · +${attempts30 ?? 0} sur 30j`} />
        <StatCard label="Pages vues" value={String(views30 ?? 0)} sub={`sur 30j · ${views7 ?? 0} sur 7j`} />
        <StatCard label="Revenu total" value={euros(revenueTotal)} sub="paiements à l'unité" />
        <StatCard label="Revenu 30j" value={euros(revenue30)} sub="paiements à l'unité" />
        <StatCard label="Abonnements actifs" value={String(activeSubs ?? 0)} sub="actifs ou en essai" />
      </div>

      <h2 className="mt-14 text-xl font-semibold tracking-tight">Tests les plus passés</h2>
      <div className="mt-4 space-y-3">
        {topTests.map((t) => (
          <div key={t.id}>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>
                {t.title} {t.isPaid && <span className="ml-1 text-xs font-normal text-muted-foreground">(payant)</span>}
              </span>
              <span className="text-muted-foreground">{t.count}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-card-border/50">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.max(4, (t.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        ))}
        {topTests.length === 0 && (
          <p className="text-sm text-muted">Aucun test passé pour le moment.</p>
        )}
      </div>
    </div>
  );
}
