import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GROUP_TEST_SLUGS } from "@/lib/groups";
import { createBillingPortalSession } from "@/app/actions/checkout";
import { formatPrice, type Purchase, type Subscription, type Test } from "@/lib/types";
import { PaymentPendingNotice } from "@/components/payment-pending";
import { AccountSettings } from "./account-settings";
import { GENDER_OPTIONS } from "@/lib/definitions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type PurchaseWithTest = Purchase & {
  tests: Pick<Test, "title" | "slug" | "price_cents" | "currency">;
};

type AttemptWithTest = {
  id: string;
  completed_at: string;
  tests: Pick<Test, "title" | "slug">;
};

export default async function AccountPage(props: PageProps<"/account">) {
  const searchParams = await props.searchParams;
  const subscriptionJustSucceeded = searchParams.checkout === "success";

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login?next=/account");
  }

  const [{ data: subscription }, { data: purchases }, { data: attempts }, { data: profile }] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .maybeSingle<Subscription>(),
      supabase
        .from("purchases")
        .select("*, tests(title, slug, price_cents, currency)")
        .eq("user_id", user.id)
        .eq("status", "paid")
        .returns<PurchaseWithTest[]>(),
      supabase
        .from("attempts")
        .select("id, completed_at, tests(title, slug)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .returns<AttemptWithTest[]>(),
      supabase
        .from("profiles")
        .select("first_name, last_name, gender, birth_date")
        .eq("id", user.id)
        .maybeSingle<{
          first_name: string | null;
          last_name: string | null;
          gender: string | null;
          birth_date: string | null;
        }>(),
    ]);

  const genderLabel = GENDER_OPTIONS.find((g) => g.value === profile?.gender)?.label;

  // Groups the user has joined with one of their results (comparison_groups,
  // see supabase/schema.sql). Quietly empty until that schema exists.
  const groups: { code: string; name: string | null; testTitle: string; count: number }[] = [];
  if (attempts && attempts.length > 0) {
    const admin = createAdminClient();
    const { data: mine, error: mineError } = await admin
      .from("comparison_members")
      .select("group_id")
      .in("attempt_id", attempts.map((a) => a.id));
    if (!mineError && mine && mine.length > 0) {
      const ids = [...new Set(mine.map((m) => m.group_id))];
      const [{ data: gs }, { data: members }] = await Promise.all([
        admin
          .from("comparison_groups")
          .select("id, code, name, tests(title)")
          .in("id", ids)
          .returns<{ id: string; code: string; name: string | null; tests: { title: string } | null }[]>(),
        admin.from("comparison_members").select("group_id").in("group_id", ids),
      ]);
      const counts = new Map<string, number>();
      for (const m of members ?? []) counts.set(m.group_id, (counts.get(m.group_id) ?? 0) + 1);
      for (const g of gs ?? []) {
        groups.push({ code: g.code, name: g.name, testTitle: g.tests?.title ?? "", count: counts.get(g.id) ?? 0 });
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Mon compte</h1>
      <p className="mt-1 text-muted">{user.email}</p>
      {(profile?.first_name || profile?.last_name) && (
        <p className="mt-1 text-sm text-muted-foreground">
          {[profile.first_name, profile.last_name].filter(Boolean).join(" ")}
          {genderLabel ? ` · ${genderLabel}` : ""}
          {profile.birth_date
            ? ` · ${new Date(profile.birth_date).toLocaleDateString("fr-FR")}`
            : ""}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium">Abonnement</h2>
        {subscription ? (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-card-border bg-card p-4">
            <p className="text-sm">
              Actif
              {subscription.current_period_end &&
                `, renouvellement le ${new Date(
                  subscription.current_period_end
                ).toLocaleDateString("fr-FR")}`}
            </p>
            <form action={createBillingPortalSession}>
              <button className="text-sm text-primary hover:underline">
                Gérer
              </button>
            </form>
          </div>
        ) : subscriptionJustSucceeded ? (
          <div className="mt-3 rounded-lg border border-card-border bg-card p-4">
            <PaymentPendingNotice />
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-card-border bg-card p-4">
            <p className="text-sm text-muted">
              Tu n&apos;as pas d&apos;abonnement actif.
            </p>
            <Link
              href="/pricing"
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              Voir l&apos;offre
            </Link>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Tests débloqués</h2>
        {purchases && purchases.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {purchases.map(
              (purchase) => (
                <li
                  key={purchase.id}
                  className="flex items-center justify-between rounded-lg border border-card-border bg-card p-4 text-sm"
                >
                  <span>{purchase.tests.title}</span>
                  <span className="text-muted-foreground">
                    {formatPrice(
                      purchase.tests.price_cents,
                      purchase.tests.currency
                    )}
                  </span>
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Aucun test débloqué à l&apos;unité pour le moment.
          </p>
        )}
      </section>

      {groups.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium">Mes groupes de comparaison</h2>
          <ul className="mt-3 space-y-2">
            {groups.map((g) => (
              <li key={g.code}>
                <Link
                  href={`/groupe/${g.code}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-card-border bg-card p-4 text-sm transition hover:border-primary/40"
                >
                  <span>
                    {g.name ? `« ${g.name} »` : "Groupe"} <span className="text-muted-foreground">· {g.testTitle}</span>
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {g.count} personne{g.count > 1 ? "s" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium">Historique de résultats</h2>
        {attempts && attempts.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {attempts.map(
              (attempt) => (
                <li key={attempt.id} className="rounded-lg border border-card-border bg-card transition hover:border-primary/40">
                  <Link
                    href={`/tests/${attempt.tests.slug}/result/${attempt.id}`}
                    className="flex items-center justify-between p-4 text-sm"
                  >
                    <span>{attempt.tests.title}</span>
                    <span className="text-muted-foreground">
                      {new Date(attempt.completed_at).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                  </Link>
                  {GROUP_TEST_SLUGS.has(attempt.tests.slug) && (
                    <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-card-border/60 px-4 py-2 text-xs">
                      <Link
                        href={`/tests/${attempt.tests.slug}/result/${attempt.id}#groupe`}
                        className="font-medium text-primary hover:underline"
                      >
                        Défier mes amis
                      </Link>
                      <Link
                        href={`/tests/${attempt.tests.slug}/result/${attempt.id}#partager`}
                        className="font-medium text-primary hover:underline"
                      >
                        Publier sur Instagram
                      </Link>
                    </div>
                  )}
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Tu n&apos;as pas encore passé de test.
          </p>
        )}
      </section>

      <AccountSettings />
    </div>
  );
}
