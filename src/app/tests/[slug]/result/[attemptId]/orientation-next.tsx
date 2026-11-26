import Link from "next/link";

// Right under a Boussole result: she/he knows which jobs fit, the open
// question is how they work. Two paid tests that answer it, with the price.
const CARDS = [
  {
    slug: "salarie-entrepreneur",
    title: "Salarié ou entrepreneur ?",
    hook: "Ces métiers, plutôt en poste ou à ton compte ? Un test d'auto-positionnement pour trancher.",
  },
  {
    slug: "pcm",
    title: "Six façons d'habiter sa vie",
    hook: "Ta base de personnalité et ce qui te motive vraiment : la clé pour choisir un métier qui tient dans la durée.",
  },
];

export function OrientationNext() {
  return (
    <div id="suite" className="mt-8 scroll-mt-20 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-left print:hidden">
      <p className="text-lg font-semibold tracking-tight">
        Tu sais quels métiers te correspondent. Reste à savoir comment tu fonctionnes.
      </p>
      <p className="mt-1 text-sm text-muted">
        Deux rapports qui complètent ta Boussole, sans abonnement, à lire en PDF.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.slug}
            href={`/tests/${c.slug}?utm_source=boussole&utm_medium=result&utm_campaign=next`}
            className="flex flex-col rounded-xl border border-card-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
          >
            <span className="text-sm font-semibold leading-snug">{c.title}</span>
            <span className="mt-1 flex-1 text-xs text-muted">{c.hook}</span>
            <span className="mt-3 text-xs font-semibold text-primary">Faire le test, 1,99&nbsp;€ →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
