import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTestAccess } from "@/lib/access";
import { formatPrice, type Test } from "@/lib/types";
import { createTestCheckoutSession } from "@/app/actions/checkout";
import { PaymentPendingNotice } from "@/components/payment-pending";
import { SITE_URL } from "@/lib/site";
import { getTestThemeStyle } from "@/lib/test-theme";

const getTestBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tests")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<Test>();
  return data;
});

export async function generateMetadata(
  props: PageProps<"/tests/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const test = await getTestBySlug(slug);
  if (!test) return {};

  return {
    title: test.title,
    description: test.description,
    alternates: { canonical: `/tests/${test.slug}` },
    openGraph: {
      title: test.title,
      description: test.description,
      url: `${SITE_URL}/tests/${test.slug}`,
      type: "website",
    },
  };
}

export default async function TestDetailPage(
  props: PageProps<"/tests/[slug]">
) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const paymentJustSucceeded = searchParams.checkout === "success";
  const previewDone = searchParams.preview === "done";

  const test = await getTestBySlug(slug);

  if (!test) {
    notFound();
  }

  const access = await getTestAccess(
    test.id,
    test.price_cents,
    test.included_in_subscription
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: test.title,
    description: test.description,
    offers: {
      "@type": "Offer",
      price: (test.price_cents / 100).toFixed(2),
      priceCurrency: test.currency.toUpperCase(),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/tests/${test.slug}`,
    },
  };

  return (
    <div
      className="mx-auto max-w-2xl px-6 py-16"
      style={getTestThemeStyle(test.slug)}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-semibold tracking-tight">{test.title}</h1>
      <p className="mt-4 whitespace-pre-line text-muted">
        {test.description}
      </p>

      <div className="mt-10 rounded-xl border border-card-border bg-card p-6">
        {access.hasAccess ? (
          <>
            <p className="text-sm text-muted">
              {access.isFree
                ? "Ce test est gratuit."
                : access.hasActiveSubscription
                  ? "Inclus dans ton abonnement."
                  : "Tu as déjà débloqué ce test."}
            </p>
            <Link
              href={`/tests/${test.slug}/run`}
              className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
            >
              Commencer le test
            </Link>
          </>
        ) : paymentJustSucceeded ? (
          <PaymentPendingNotice />
        ) : previewDone ? (
          <>
            <p className="font-medium">
              Alors, qu&apos;est-ce que tu en penses ?
            </p>
            <p className="mt-1 text-sm text-muted">
              Tu viens de voir un aperçu de {test.title}. Débloque le test
              complet pour découvrir ton profil en détail, avec un rapport
              complet par dimension.
            </p>
            <p className="mt-4 text-sm text-muted">
              Prix pour débloquer ce test :{" "}
              <span className="font-medium text-foreground">
                {formatPrice(test.price_cents, test.currency)}
              </span>
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <form
                action={createTestCheckoutSession.bind(null, test.slug)}
              >
                <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90">
                  Débloquer ce test
                </button>
              </form>
              {test.included_in_subscription && (
                <Link
                  href="/pricing"
                  className="rounded-full border border-card-border px-6 py-2.5 text-sm font-medium transition hover:border-primary/40"
                >
                  Voir l&apos;abonnement illimité
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              Essaie gratuitement les 5 premières questions, sans engagement.
            </p>
            <Link
              href={`/tests/${test.slug}/run`}
              className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
            >
              Commencer l&apos;aperçu gratuit
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
