import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Comment ${SITE_NAME} collecte et utilise tes données personnelles.`,
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Politique de confidentialité
      </h1>
      <p className="mt-3 text-sm text-muted">
        Dernière mise à jour : 19 septembre 2026
      </p>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            Données collectées
          </h2>
          <p>Selon la façon dont tu utilises {SITE_NAME}, nous collectons :</p>
          <ul className="list-disc pl-5">
            <li>
              si tu fais un test gratuit sans créer de compte : ton adresse
              email (pour t&apos;envoyer ton résultat et, si tu l&apos;acceptes,
              des informations sur nos tests) et tes réponses au test ;
            </li>
            <li>
              si tu crées un compte : ton adresse email et ton mot de passe
              (stocké de façon chiffrée), ton prénom, ton nom, ta date de
              naissance et ton sexe ;
            </li>
            <li>tes réponses et résultats aux tests que tu passes ;</li>
            <li>
              les informations nécessaires au paiement, traitées directement
              par Stripe — {SITE_NAME} n&apos;a jamais accès à ton numéro de
              carte bancaire.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            Utilisation des données
          </h2>
          <p>
            Ces données servent uniquement à faire fonctionner le service :
            authentification, calcul et affichage de tes résultats, gestion de
            tes achats et de ton abonnement, et support en cas de besoin.
            Lorsque tu acceptes de recevoir des informations sur nos tests
            (case à cocher, jamais pré-cochée), ton adresse email peut être
            utilisée pour t&apos;envoyer ces communications ; tu peux te
            désinscrire à tout moment. Tes données ne sont jamais vendues ni
            cédées à des tiers à des fins commerciales.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">Sous-traitants</h2>
          <p>
            {SITE_NAME} fait appel aux prestataires suivants pour
            fonctionner : Supabase (authentification et base de données),
            Stripe (paiement), Vercel (hébergement et mesure d&apos;audience
            anonymisée, sans cookie). Ces prestataires peuvent héberger des
            données en dehors de l&apos;Union européenne ; ils présentent des
            garanties reconnues en matière de protection des données.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">Cookies</h2>
          <p>
            Le site utilise uniquement des cookies strictement nécessaires à
            son fonctionnement (maintien de la session de connexion, mémoire
            de ta première visite). Aucun cookie publicitaire ou de mesure
            d&apos;audience tiers n&apos;est déposé à ce jour.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">
            Tes droits (RGPD)
          </h2>
          <p>
            Conformément au Règlement général sur la protection des données,
            tu disposes d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement et de portabilité de tes données, ainsi que
            d&apos;un droit d&apos;opposition. Tu peux exercer ces droits en
            écrivant à 4F@icloud.com, ou supprimer ton compte et tes données
            directement depuis la page « Mon compte » si tu es inscrit.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">Conservation</h2>
          <p>
            Les réponses et résultats d&apos;un test réalisé sans compte sont
            conservés le temps nécessaire pour te permettre d&apos;accéder à
            ton résultat. Pour un compte créé, tes données sont conservées le
            temps de ton inscription au service, puis supprimées dans un
            délai raisonnable après la clôture de ton compte, sauf obligation
            légale de conservation plus longue (facturation notamment).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium text-foreground">Contact</h2>
          <p>
            Pour toute question relative à tes données personnelles :
            4F@icloud.com.
          </p>
        </section>
      </div>
    </div>
  );
}
