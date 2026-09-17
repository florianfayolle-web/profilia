"use client";

const STEPS = [
  {
    title: "Analyse de tes réponses",
    subtitle: "Lecture de chaque réponse donnée",
  },
  {
    title: "Calcul par dimension",
    subtitle: "Agrégation des scores par thème",
  },
  {
    title: "Vérification de la cohérence",
    subtitle: "Contrôle de la fiabilité des réponses",
  },
  {
    title: "Génération du rapport",
    subtitle: "Rédaction de ton profil personnalisé",
  },
];

export function QuizLoading() {
  return (
    <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
      <p className="text-lg font-semibold tracking-tight">
        Analyse de ton profil...
      </p>
      <div className="mt-6 space-y-5">
        {STEPS.map((step, i) => (
          <div key={step.title}>
            <p className="text-sm font-medium">{step.title}</p>
            <p className="text-xs text-muted">{step.subtitle}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-card-border/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                style={{
                  animation: `quiz-loading-bar 1.1s ease-out ${i * 0.35}s forwards`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
