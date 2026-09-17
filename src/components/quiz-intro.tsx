"use client";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
      aria-hidden="true"
    >
      <path
        d="M4 10.5l3.5 3.5L16 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QuizIntro({
  onStart,
  isPreview,
}: {
  onStart: () => void;
  isPreview: boolean;
}) {
  return (
    <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
      <p className="text-lg font-semibold tracking-tight">
        Avant de commencer
      </p>
      <ul className="mt-4 space-y-3 text-sm text-muted">
        <li className="flex items-start gap-2">
          <CheckIcon />
          <span>
            Réponds à chaque affirmation avec spontanéité : il n&apos;y a pas
            de bonne ou de mauvaise réponse.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckIcon />
          <span>
            {isPreview
              ? "Les 5 premières questions sont gratuites, sans engagement."
              : "Réponds à toutes les questions pour accéder à ton rapport personnalisé."}
          </span>
        </li>
      </ul>
      <button
        onClick={onStart}
        className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
      >
        Commencer le test →
      </button>
    </div>
  );
}
