import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}, tests de personnalité en ligne`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Tests de personnalité et de jugement situationnel en ligne, pour te connaître ou t'entraîner avant une sélection en compagnie aérienne, dans l'armée (EOPN, ALAT, AOPAN) ou en grande entreprise.",
  keywords: [
    "test de personnalité en ligne",
    "test de personnalité pilote",
    "préparation entretien compagnie aérienne",
    "test de jugement situationnel",
    "test SOSIE 2",
    "test TD12",
    "recrutement pilote de ligne",
    "recrutement hôtesse de l'air steward",
    "test de personnalité EOPN",
    "test de personnalité ALAT",
    "test de personnalité AOPAN",
    "test psychotechnique pilote militaire",
    "test de personnalité recrutement grande entreprise",
    "test de personnalité recrutement Airbus",
    "test de personnalité recrutement Thales",
    "test de personnalité recrutement Société Générale",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
    title: `${SITE_NAME}, tests de personnalité en ligne`,
    description:
      "Des tests de personnalité et de jugement situationnel sérieux, pour toi ou pour préparer un entretien de sélection.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}, tests de personnalité en ligne`,
    description:
      "Des tests de personnalité et de jugement situationnel sérieux, pour toi ou pour préparer un entretien de sélection.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/tests?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
