import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createBillingPortalSession } from "@/app/actions/checkout";
import { formatPrice, type Purchase, type Subscription, type Test } from "@/lib/types";
import { PaymentPendingNotice } from "@/components/payment-pending";

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

  const [{ data: subscription }, { data: purchases }, { data: attempts }] =
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
    ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Mon compte</h1>
      <p className="mt-1 text-muted">{user.email}</p>

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

      <section className="mt-10">
        <h2 className="text-lg font-medium">Historique de résultats</h2>
        {attempts && attempts.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {attempts.map(
              (attempt) => (
                <li key={attempt.id}>
                  <Link
                    href={`/tests/${attempt.tests.slug}/result/${attempt.id}`}
                    className="flex items-center justify-between rounded-lg border border-card-border bg-card p-4 text-sm transition hover:border-primary/40"
                  >
                    <span>{attempt.tests.title}</span>
                    <span className="text-muted-foreground">
                      {new Date(attempt.completed_at).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                  </Link>
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
    </div>
  );
}
