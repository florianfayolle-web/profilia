import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site ${SITE_NAME}.`,
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Mentions légales</h1>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">Éditeur du site</h2>
          <p>
            Le site {SITE_NAME.toLowerCase()}-test.fr est édité par FlyUp-Selec,
            entreprise individuelle (micro-entreprise), immatriculée sous le
            numéro SIRET 989 290 283 00013 (SIREN 989 290 283). TVA non
            applicable, article 293 B du Code général des impôts.
          </p>
          <p>
            Directeur de la publication : FlyUp-Selec.
            <br />
            Contact : 4F@icloud.com.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">Hébergement</h2>
          <p>
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut,
            CA 91789, États-Unis.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble des contenus présents sur {SITE_NAME} (textes,
            questions, résultats types, illustrations, structure du site) est
            protégé par le droit d&apos;auteur. Toute reproduction ou
            représentation, totale ou partielle, sans autorisation préalable
            est interdite.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            Absence de lien officiel
          </h2>
          <p>
            {SITE_NAME} est un service indépendant. Il n&apos;est affilié à,
            ni mandaté par, aucun éditeur de test psychométrique, cabinet de
            recrutement, entreprise ou institution. Les tests proposés sont
            des créations originales, inspirées de formats connus en
            psychologie du travail, et ne reproduisent aucun instrument
            propriétaire existant.
          </p>
        </section>
      </div>
    </div>
  );
}
