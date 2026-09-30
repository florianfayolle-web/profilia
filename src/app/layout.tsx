import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import PageViewTracker from "@/components/page-view-tracker";
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
    default: `${SITE_NAME}, tests de personnalité, QI et profil cognitif en ligne`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Test de QI, DISC, Big Five, orientation RIASEC, repérage TDAH et HPI : des tests de personnalité et de raisonnement sérieux, pour mieux te connaître ou t'entraîner avant une sélection (compagnie aérienne, armée, grande entreprise). Réponses gratuites, rapport détaillé.",
  keywords: [
    "test de personnalité",
    "test de personnalité en ligne",
    "test de personnalité gratuit",
    "test de personnalité pilote",
    "test pilote de ligne",
    "préparation entretien compagnie aérienne",
    "test de jugement situationnel",
    "test SOSIE 2",
    "test TD12",
    "test PSY2",
    "test PSY2 Air France",
    "PSY2 Air France débrief",
    "PSY1 ENAC EPL",
    "test de personnalité Ryanair",
    "test de personnalité easyJet",
    "sélection PNC easyJet",
    "sélection PNC Ryanair",
    "CSO EOPN ALAT AOPAN",
    "sélection pilote militaire test personnalité",
    "concours EOPAN Marine nationale",
    "test de personnalité ENAC",
    "test de personnalité EPLS",
    "concours ENAC EPL préparation",
    "inventaire de personnalité Air France",
    "inventaire de personnalité pilote",
    "préparation PSY2",
    "sélection Air France test personnalité",
    "sélection HOP test personnalité",
    "sélection Transavia test personnalité",
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
    "test DISC",
    "test de personnalité DISC",
    "profil DISC gratuit",
    "test DISC gratuit",
    "test DISC en ligne",
    "inventaire de personnalité",
    "test MBTI",
    "test 16 personnalités",
    "test Big Five",
    "test OCEAN",
    "modèle OCEAN personnalité",
    "test process communication",
    "test PCM gratuit",
    "process communication model",
    "test personnalité Taibi Kahler",
    "test de raisonnement logique gratuit",
    "test psychotechnique gratuit",
    "test aptitude raisonnement logique",
    "test logique recrutement",
    "test raisonnement spatial",
    "test salarié ou entrepreneur",
    "test appétence entrepreneuriale",
    "suis-je fait pour entreprendre",
    "test envie de créer une entreprise",
    "test d'orientation",
    "test orientation RIASEC",
    "test orientation scolaire",
    "test orientation professionnelle",
    "quel métier me correspond",
    "test métier gratuit",
    "réorientation Parcoursup",
    "test reconversion professionnelle",
    "test de personnalité amusant",
    "test personnalité entre amis",
    "test personnalité en famille",
    "quiz personnalité rigolo",
    "jeu de personnalité entre amis",
    "quel est mon profil de personnalité",
    "test pour se connaître soi-même",
    "pourquoi les entreprises font passer un test de personnalité",
    "test de personnalité recrutement explication",
    "test de QI",
    "test de QI gratuit",
    "test de QI en ligne",
    "test de raisonnement",
    "test TDAH adulte",
    "test TDAH en ligne",
    "questionnaire TDAH adulte",
    "DSM-5 TDAH",
    "repérage TDAH",
    "symptômes TDAH adulte",
    "suis-je HPI",
    "test HPI",
    "haut potentiel intellectuel",
    "adulte surdoué test",
    "zèbre HPI",
    "test quel animal je suis",
    "test personnalité animal",
    "quel animal me correspond",
  ],
  alternates: { canonical: "/" },
  verification: {
    google: [
      "Gxt1j0DS7zZFCRFyzw4_rht4zM4U7z9NxZREgIVMsag",
      "DCmW5O8xLOkdmGoXfofHQQNoNp36uMep4TiCFATwmDU",
    ],
    other: {
      "msvalidate.01": "E567891C2A92F252051116BCAD13A19A",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
    title: `${SITE_NAME}, tests de personnalité, QI et profil cognitif en ligne`,
    description:
      "Test de QI, DISC, Big Five, orientation RIASEC, repérage TDAH et HPI : des tests de personnalité et de raisonnement sérieux, pour mieux te connaître ou t'entraîner avant une sélection.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}, tests de personnalité, QI et profil cognitif en ligne`,
    description:
      "Test de QI, DISC, Big Five, orientation RIASEC, repérage TDAH et HPI : des tests de personnalité et de raisonnement sérieux, pour mieux te connaître ou t'entraîner avant une sélection.",
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
              // No SearchAction: /tests has no working ?q= search, and
              // claiming one in structured data that doesn't actually work
              // gets this markup discounted rather than rewarded.
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/brand/profilia-mark-512.png`,
              description:
                "Tests de personnalité, de QI et de profil cognitif en ligne : DISC, Big Five, orientation RIASEC, repérage TDAH et HPI, conçus par des professionnels du recrutement.",
            }),
          }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
        <PageViewTracker />
      </body>
    </html>
  );
}
