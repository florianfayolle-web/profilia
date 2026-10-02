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

function BarList({
  items,
}: {
  items: { key: string; label: string; value: number; suffix?: string; sub?: string }[];
}) {
  const max = Math.max(1, ...items.map((it) => it.value));
  return (
    <div className="mt-4 space-y-3">
      {items.map((it) => (
        <div key={it.key}>
          <div className="flex items-center justify-between text-sm font-medium">
            <span>
              {it.label} {it.sub && <span className="ml-1 text-xs font-normal text-muted-foreground">{it.sub}</span>}
            </span>
            <span className="text-muted-foreground">
              {it.suffix ? it.suffix : it.value}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-card-border/50">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${Math.max(4, (it.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-muted">Rien pour le moment.</p>}
    </div>
  );
}

const euros = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const DAYS_TREND = 14;

const SOURCE_NAMES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/duckduckgo\.com$/, "DuckDuckGo"],
  [/ecosia\.org$/, "Ecosia"],
  [/qwant\.com$/, "Qwant"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)(facebook|fb)\.com$|^l\.facebook\.com$|^lm\.facebook\.com$/, "Facebook"],
  [/instagram\.com$/, "Instagram"],
  [/^t\.co$|(^|\.)(twitter|x)\.com$/, "X / Twitter"],
  [/linkedin\.com$|^lnkd\.in$/, "LinkedIn"],
  [/youtube\.com$|^youtu\.be$/, "YouTube"],
  [/tiktok\.com$/, "TikTok"],
  [/pinterest\./, "Pinterest"],
  [/reddit\.com$/, "Reddit"],
  [/whatsapp\.com$/, "WhatsApp"],
];

function sourceLabel(e: { referrer_host: string | null; utm_source: string | null }) {
  if (e.utm_source) return `${e.utm_source} (UTM)`;
  if (!e.referrer_host) return "Direct / inconnu";
  return SOURCE_NAMES.find(([re]) => re.test(e.referrer_host!))?.[1] ?? e.referrer_host;
}

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
  const dTrend = new Date(now.getTime() - DAYS_TREND * 24 * 3600_000).toISOString();

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
    { count: leadsTotal },
    { count: leads30 },
    { data: paidPurchases },
    { data: attemptsByTest },
    { data: tests },
    { data: recentAttempts },
    { data: entries, error: entriesError },
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
    admin.from("marketing_leads").select("id", { count: "exact", head: true }),
    admin.from("marketing_leads").select("id", { count: "exact", head: true }).gte("created_at", d30),
    admin.from("purchases").select("amount_cents, created_at, test_id").eq("status", "paid"),
    admin.from("attempts").select("test_id"),
    admin.from("tests").select("id, slug, title, price_cents"),
    admin.from("attempts").select("completed_at").gte("completed_at", dTrend),
    admin
      .from("page_views")
      .select("referrer_host, utm_source")
      .eq("is_entry", true)
      .gte("viewed_at", d30),
  ]);

  const countBySource = new Map<string, number>();
  for (const e of entries ?? []) {
    const label = sourceLabel(e);
    countBySource.set(label, (countBySource.get(label) ?? 0) + 1);
  }
  const sources = [...countBySource.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, value]) => ({ key: label, label, value }));

  const titleById = new Map((tests ?? []).map((t) => [t.id, t.title]));
  const priceById = new Map((tests ?? []).map((t) => [t.id, t.price_cents]));

  const revenueTotal = (paidPurchases ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const revenue30 = (paidPurchases ?? [])
    .filter((p) => p.created_at >= d30)
    .reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const purchasesCount = paidPurchases?.length ?? 0;
  const avgOrderCents = purchasesCount > 0 ? Math.round(revenueTotal / purchasesCount) : 0;

  const countByTest = new Map<string, number>();
  for (const a of attemptsByTest ?? []) {
    countByTest.set(a.test_id, (countByTest.get(a.test_id) ?? 0) + 1);
  }
  const topTests = [...countByTest.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([id, count]) => ({
      key: id,
      label: titleById.get(id) ?? id,
      value: count,
      sub: (priceById.get(id) ?? 0) > 0 ? "(payant)" : undefined,
    }));

  const revenueByTest = new Map<string, number>();
  for (const p of paidPurchases ?? []) {
    if (!p.test_id) continue;
    revenueByTest.set(p.test_id, (revenueByTest.get(p.test_id) ?? 0) + (p.amount_cents ?? 0));
  }
  const topRevenue = [...revenueByTest.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, cents]) => ({
      key: id,
      label: titleById.get(id) ?? id,
      value: cents,
      suffix: euros(cents),
    }));

  // Simple day-by-day attempts count for the trend list (most recent day
  // first) — grouped in JS since it's a small window (14 days) and this
  // page isn't hit often enough to justify a SQL date_trunc round trip.
  const countByDay = new Map<string, number>();
  for (const a of recentAttempts ?? []) {
    const day = a.completed_at.slice(0, 10);
    countByDay.set(day, (countByDay.get(day) ?? 0) + 1);
  }
  const trend = Array.from({ length: DAYS_TREND }, (_, i) => {
    const d = new Date(now.getTime() - i * 24 * 3600_000);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      value: countByDay.get(key) ?? 0,
    };
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <AdminNav active="stats" />
      <h1 className="text-2xl font-semibold tracking-tight">Statistiques</h1>
      <p className="mt-2 text-sm text-muted">Vue d&apos;ensemble de l&apos;activité du site.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Comptes créés" value={String(usersTotal ?? 0)} sub={`+${users7 ?? 0} sur 7j · +${users30 ?? 0} sur 30j`} />
        <StatCard label="Tests passés" value={String(attemptsTotal ?? 0)} sub={`+${attempts7 ?? 0} sur 7j · +${attempts30 ?? 0} sur 30j`} />
        <StatCard label="Pages vues" value={String(views30 ?? 0)} sub={`sur 30j · ${views7 ?? 0} sur 7j`} />
        <StatCard label="Revenu total" value={euros(revenueTotal)} sub={`${purchasesCount} paiement${purchasesCount > 1 ? "s" : ""} à l'unité`} />
        <StatCard label="Revenu 30j" value={euros(revenue30)} sub="paiements à l'unité" />
        <StatCard label="Panier moyen" value={euros(avgOrderCents)} sub="par paiement à l'unité" />
        <StatCard label="Abonnements actifs" value={String(activeSubs ?? 0)} sub="actifs ou en essai" />
        <StatCard label="Leads marketing" value={String(leadsTotal ?? 0)} sub={`+${leads30 ?? 0} sur 30j`} />
      </div>

      <h2 className="mt-14 text-xl font-semibold tracking-tight">Activité — {DAYS_TREND} derniers jours</h2>
      <BarList items={trend} />

      <h2 className="mt-14 text-xl font-semibold tracking-tight">D&apos;où viennent les visites (30j)</h2>
      {entriesError ? (
        <p className="mt-4 text-sm text-muted">
          Le suivi de provenance n&apos;est pas encore activé : lance le bloc « Traffic source
          tracking » de supabase/schema.sql dans l&apos;éditeur SQL de Supabase.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-muted-foreground">
            Une visite = une arrivée sur le site. Les données commencent à l&apos;activation du suivi.
          </p>
          <BarList items={sources} />
        </>
      )}

      <h2 className="mt-14 text-xl font-semibold tracking-tight">Tests les plus passés</h2>
      <BarList items={topTests} />

      <h2 className="mt-14 text-xl font-semibold tracking-tight">Revenu par test</h2>
      <BarList items={topRevenue} />
    </div>
  );
}
