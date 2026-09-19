import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: `Conditions générales de vente et d'utilisation de ${SITE_NAME}.`,
  alternates: { canonical: "/cgv" },
};

export default function CGVPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Conditions générales de vente
      </h1>
      <p className="mt-3 text-sm text-muted">
        Dernière mise à jour : 19 septembre 2026
      </p>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">1. Objet</h2>
          <p>
            Les présentes conditions générales de vente (CGV) régissent
            l&apos;achat de rapports de tests et la souscription à
            l&apos;abonnement du service {SITE_NAME}, un site de tests de
            personnalité et de jugement situationnel en ligne. Elles
            s&apos;appliquent à toute commande passée sur le site
            {" "}
            {SITE_NAME.toLowerCase()}-test.fr, édité par FlyUp-Selec,
            entreprise individuelle (micro-entreprise), immatriculée sous le
            numéro SIRET 989 290 283 00013.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            2. Description du service
          </h2>
          <p>
            {SITE_NAME} propose des tests de personnalité et de jugement
            situationnel, avec un test gratuit d&apos;introduction accessible
            sans compte. Le rapport détaillé de chaque test payant (résultat
            complet, analyse par dimension) est accessible soit à
            l&apos;unité, soit via un abonnement donnant un accès illimité à
            l&apos;ensemble des tests.
          </p>
          <p>
            {SITE_NAME} est un outil de connaissance de soi et
            d&apos;entraînement indépendant. Il ne remplace ni un bilan
            psychologique réalisé par un professionnel, ni un test officiel
            utilisé dans le cadre d&apos;un recrutement.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            3. Formules et tarifs
          </h2>
          <p>Deux façons d&apos;accéder aux rapports complets sont proposées :</p>
          <ul className="list-disc pl-5">
            <li>
              À l&apos;unité : 4,99 € TTC pour débloquer le rapport complet
              d&apos;un test, à vie. Depuis le résultat du test gratuit
              d&apos;introduction, un déblocage à 0,99 € TTC est également
              proposé, limité au rapport de ce test.
            </li>
            <li>
              Abonnement illimité : 9,99 € TTC par mois, sans engagement de
              durée, donnant accès à tous les tests du site, y compris les
              nouveaux tests ajoutés pendant la durée de l&apos;abonnement.
              Reconduction automatique chaque mois.
            </li>
          </ul>
          <p>
            Les tarifs sont indiqués en euros toutes taxes comprises.
            {" "}
            {SITE_NAME} se réserve le droit de faire évoluer ses tarifs ;
            toute modification est sans effet sur un achat déjà réglé ou sur
            un abonnement en cours jusqu&apos;à sa prochaine reconduction.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            4. Paiement et reconduction
          </h2>
          <p>
            Le paiement s&apos;effectue en ligne par carte bancaire via
            Stripe, prestataire de paiement sécurisé. {SITE_NAME} ne stocke
            aucune donnée de carte bancaire. Un achat à l&apos;unité est
            facturé une seule fois. L&apos;abonnement est reconduit
            automatiquement chaque mois, au tarif en vigueur, sauf
            résiliation par l&apos;abonné avant la date de renouvellement.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">5. Résiliation</h2>
          <p>
            L&apos;abonné peut résilier son abonnement à tout moment depuis
            la page « Mon compte » du site. La résiliation prend effet à la
            fin de la période en cours déjà payée ; aucun remboursement au
            prorata n&apos;est effectué pour la période entamée. Un
            déblocage à l&apos;unité (4,99 € ou 0,99 €) n&apos;est pas un
            abonnement et n&apos;est donc pas concerné par une résiliation.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            6. Droit de rétractation
          </h2>
          <p>
            Conformément à l&apos;article L221-28 du Code de la consommation,
            le droit de rétractation ne peut être exercé pour les contrats de
            fourniture de contenu numérique non fourni sur un support
            matériel dont l&apos;exécution a commencé après accord préalable
            exprès du consommateur et renoncement exprès à son droit de
            rétractation. En débloquant un rapport ou en souscrivant un
            abonnement et en accédant immédiatement au contenu, le client
            reconnaît et accepte cette renonciation.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            7. Responsabilité
          </h2>
          <p>
            {SITE_NAME} met à disposition des tests et rapports élaborés avec
            soin, à titre indicatif et de développement personnel. Ils ne
            constituent ni un diagnostic médical ou psychologique, ni une
            garantie de résultat dans le cadre d&apos;un recrutement ou d&apos;une
            orientation professionnelle, et ne sauraient engager la
            responsabilité de {SITE_NAME} à ce titre.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            8. Droit applicable et litiges
          </h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de
            litige, une solution amiable sera recherchée avant toute action
            judiciaire. À défaut d&apos;accord, les tribunaux français
            compétents seront seuls saisis.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">9. Médiation</h2>
          <p>
            En cas de litige, le client et FlyUp-Selec s&apos;efforceront de
            trouver une solution amiable. À défaut, le client consommateur
            peut recourir gratuitement à un médiateur de la consommation,
            dans les conditions prévues par le Code de la consommation.
          </p>
          <p>
            Ce recours n&apos;est ouvert qu&apos;après une réclamation écrite
            préalable adressée à 4F@icloud.com, restée sans solution
            satisfaisante pendant au moins un mois, et doit être exercé dans
            un délai d&apos;un an à compter de cette réclamation. Les
            coordonnées du médiateur compétent sont communiquées au client
            sur simple demande. Le recours à la médiation ne prive pas le
            client de la possibilité de saisir les tribunaux compétents.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            10. Engagement du client
          </h2>
          <p>
            En acceptant les présentes CGV, le client s&apos;engage à ne
            faire aucun usage commercial, ni aucune redistribution ou
            reproduction du contenu de {SITE_NAME.toLowerCase()}-test.fr.
            L&apos;accès aux contenus numériques (questions, résultats,
            rapports) demeure la propriété de FlyUp-Selec et est strictement
            réservé à l&apos;usage personnel et privé du client.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            11. Évolution des CGV
          </h2>
          <p>
            FlyUp-Selec peut modifier les présentes CGV à tout moment,
            notamment pour tenir compte de l&apos;évolution du service ou de
            la réglementation applicable. La version en vigueur est celle
            publiée sur cette page ; elle se substitue à toute version
            antérieure dès sa mise en ligne.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">12. Contact</h2>
          <p>Pour toute question relative aux présentes CGV : 4F@icloud.com.</p>
        </section>
      </div>
    </div>
  );
}
