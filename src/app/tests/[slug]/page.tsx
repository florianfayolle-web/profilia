import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTestAccess } from "@/lib/access";
import { formatPrice, type Test } from "@/lib/types";
import { createTestCheckoutSession } from "@/app/actions/checkout";
import { ConsentCheckoutButton } from "@/components/consent-checkout-button";
import { PaymentPendingNotice } from "@/components/payment-pending";
import { clipDescription, clipTitle } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { getTestThemeStyle } from "@/lib/test-theme";
import { GUIDES } from "@/lib/guides";
import { getCategory, getTestCategory } from "@/lib/test-category";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { DiscWheel8Profiles } from "@/components/disc-wheel-8-profiles";

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

const getActiveTests = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tests")
    .select("slug, title")
    .eq("is_active", true)
    .returns<Pick<Test, "slug" | "title">[]>();
  return data ?? [];
});

export async function generateMetadata(
  props: PageProps<"/tests/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const test = await getTestBySlug(slug);
  if (!test) return {};

  return {
    title: clipTitle(test.title),
    description: clipDescription(test.description),
    alternates: { canonical: `/tests/${test.slug}` },
    openGraph: {
      title: test.title,
      description: clipDescription(test.description),
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

  // Generic but test-accurate FAQ, generated from this test's own
  // price/access fields rather than hand-written per test (20+ tests) —
  // gives every /tests/[slug] page an FAQPage rich-result opportunity,
  // which only the category hub pages had until now.
  const testFaq = [
    {
      question: "Ce test est-il gratuit ?",
      answer:
        test.price_cents === 0
          ? "Oui, toutes les questions et ton résultat complet sont gratuits, sans carte bancaire."
          : `Les questions sont gratuites : tu réponds sans payer. Seul le rapport détaillé est payant (${formatPrice(test.price_cents, test.currency)})${test.included_in_subscription ? ", ou inclus dans l'abonnement illimité" : ""}.`,
    },
    {
      question: "Faut-il créer un compte pour passer ce test ?",
      answer:
        test.price_cents === 0
          ? "Non : tu réponds sans compte, une simple adresse email suffit pour voir ton résultat."
          : "Tu peux répondre à toutes les questions sans créer de compte. Un compte gratuit est seulement nécessaire pour voir et débloquer ton rapport détaillé à la fin.",
    },
    {
      question: "Puis-je repasser ce test plus tard ?",
      answer:
        "Oui, autant de fois que tu veux. Le contenu ne change pas, mais garde en tête que ton contexte du jour (fatigue, humeur, familiarité avec le format) peut légèrement influencer le résultat d'une fois sur l'autre.",
    },
  ];

  const category = getCategory(getTestCategory(test.slug));
  const relatedTests = category
    ? (await getActiveTests())
        .filter(
          (t) => t.slug !== test.slug && getTestCategory(t.slug) === category.slug
        )
        .slice(0, 4)
    : [];

  return (
    <div
      className="mx-auto max-w-2xl px-6 py-16"
      style={getTestThemeStyle(test.slug)}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: testFaq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />
      {category && (
        <BreadcrumbJsonLd
          items={[
            { name: "Tous les tests", path: "/tests" },
            { name: category.title, path: `/tests/${category.slug}` },
            { name: test.title, path: `/tests/${test.slug}` },
          ]}
        />
      )}
      {category && (
        <p className="text-sm text-muted">
          <Link href="/tests" className="hover:text-foreground">
            Tous les tests
          </Link>
          {" / "}
          <Link href={`/tests/${category.slug}`} className="hover:text-foreground">
            {category.title}
          </Link>
        </p>
      )}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{test.title}</h1>
      {test.slug === "disc" && (
        <div className="mx-auto mt-6 max-w-xs">
          <DiscWheel8Profiles className="w-full" />
        </div>
      )}
      <p className="mt-4 whitespace-pre-line text-muted">
        {test.description}
      </p>
      {(() => {
        const guide = GUIDES.find((g) => g.testSlug === test.slug);
        return guide ? (
          <Link
            href={`/guides/${guide.slug}`}
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            Lire le guide : comment se déroule ce test et comment s&apos;y
            préparer →
          </Link>
        ) : null;
      })()}

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
            <div className="mt-4 flex flex-wrap items-start gap-3">
              <div className="max-w-xs">
                <ConsentCheckoutButton
                  action={createTestCheckoutSession.bind(null, test.slug, undefined)}
                  label="Débloquer ce test"
                  className="w-full rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
                />
              </div>
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
              Réponds à toutes les questions gratuitement, sans engagement : seul ton rapport complet est payant, à la fin.
            </p>
            <Link
              href={`/tests/${test.slug}/run`}
              className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
            >
              Commencer le test
            </Link>
          </>
        )}
      </div>

      <div className="mt-12 border-t border-card-border/60 pt-10">
        <h2 className="text-xl font-semibold tracking-tight">Questions fréquentes</h2>
        <div className="mt-5 space-y-5">
          {testFaq.map((item) => (
            <div key={item.question}>
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-1 text-sm text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {relatedTests.length > 0 && category && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Autres tests dans {category.title.toLowerCase()}
          </h2>
          <ul className="mt-3 space-y-2">
            {relatedTests.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tests/${t.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
