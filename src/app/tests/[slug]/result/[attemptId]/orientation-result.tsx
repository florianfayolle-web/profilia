"use client";

import { useMemo, useState } from "react";
import type { scoreOrientation } from "@/lib/assessments/scoring";

type OrientationResultData = ReturnType<typeof scoreOrientation>;

function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-card-border/60">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: color ?? "linear-gradient(to right, var(--primary), var(--accent))",
        }}
      />
    </div>
  );
}

const LEVEL_LABELS: Record<number, string> = { 0: "CAP à bac", 2: "Bac+2", 3: "Bac+3", 5: "Bac+5" };
const TAG_LABELS: Record<string, string> = {
  tension: "recrute beaucoup",
  horaires: "horaires décalés",
  indep: "à son compte possible",
  utile: "utile aux personnes",
  reconv: "accessible en reconversion",
};

export function OrientationResult({ result }: { result: OrientationResultData }) {
  const universLabels = result.universLabels;
  const [audience, setAudience] = useState<"lyc" | "adu">("lyc");
  const [levelFilter, setLevelFilter] = useState<"tous" | "court" | "long" | "reconv">("tous");
  const [visibleCount, setVisibleCount] = useState(15);

  const jobs = audience === "lyc" ? result.jobsLyc : result.jobsAdu;
  const univers = audience === "lyc" ? result.universLyc : result.universAdu;
  const combo = audience === "lyc" ? result.comboLyc : result.comboAdu;
  const action = audience === "lyc" ? result.actionLyc : result.actionAdu;

  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (levelFilter === "court") list = list.filter((j) => j.level <= 2);
    if (levelFilter === "long") list = list.filter((j) => j.level >= 3);
    if (levelFilter === "reconv") list = list.filter((j) => j.tags.includes("reconv"));
    return list;
  }, [jobs, levelFilter]);

  const shownJobs = filteredJobs.slice(0, visibleCount);

  return (
    <div className="text-left">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Pistes affichées pour :</span>
        <button
          type="button"
          onClick={() => setAudience("lyc")}
          className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
            audience === "lyc" ? "border-primary bg-primary/10 text-primary" : "border-card-border text-muted-foreground"
          }`}
        >
          Lycée / post-bac
        </button>
        <button
          type="button"
          onClick={() => setAudience("adu")}
          className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
            audience === "adu" ? "border-primary bg-primary/10 text-primary" : "border-card-border text-muted-foreground"
          }`}
        >
          Reconversion
        </button>
      </div>

      <h2 className="mt-6 text-3xl font-semibold tracking-tight">
        Votre profil : {result.topCode}
      </h2>
      <p className="mt-1 text-muted">
        {result.domainResults
          .filter((d) => result.top3.includes(d.code))
          .sort((a, b) => result.top3.indexOf(a.code) - result.top3.indexOf(b.code))
          .map((d) => d.label)
          .join(" · ")}
      </p>

      <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
        <p className="text-lg font-semibold">Vos domaines, du plus fort au plus faible</p>
        <div className="mt-4 space-y-4">
          {result.domainResults.map((d) => (
            <div key={d.code}>
              <div className="flex items-center justify-between text-sm font-medium">
                <span style={{ color: d.color }}>{d.label}</span>
                <span className="text-muted-foreground">
                  {d.interestPercent}% intérêt · {d.masteryPercent}% maîtrise
                </span>
              </div>
              <div className="mt-1">
                <Bar value={d.interestPercent} color={d.color} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          L&apos;intérêt dit ce qui vous attire, la maîtrise ce que vous estimez savoir faire aujourd&apos;hui. Un écart entre les deux n&apos;est pas un problème : l&apos;intérêt précède presque toujours la compétence.
        </p>
      </div>

      {result.profileSections.map((p) => (
        <div key={p.code} className="mt-8 rounded-xl border border-card-border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {p.rank === 0 ? "Dominante principale" : p.rank === 1 ? "Deuxième dominante" : "Troisième dominante"} · {p.interestPercent}%
          </p>
          <h3 className="mt-1 text-xl font-semibold">
            {p.label} — {p.tag}
          </h3>
          <p className="mt-3 text-muted">{p.desc}</p>
          <p className="mt-3 text-sm">
            <span className="font-medium">Environnements de travail : </span>
            <span className="text-muted">{p.env}</span>
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold">Métiers à explorer</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted">
                {p.metiers.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">
                {audience === "lyc" ? "Formations correspondantes" : "Voies de reconversion"}
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted">
                {(audience === "lyc" ? p.formationsLyc : p.formationsAdu).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
        <p className="text-lg font-semibold">Ce que dit la combinaison {result.topCode}</p>
        <p className="mt-2 text-muted">{combo}</p>
      </div>

      <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
        <p className="text-lg font-semibold">Les sujets qui vous attirent</p>
        <p className="mt-1 text-sm text-muted">
          Vos goûts déclarés, indépendamment de vos aptitudes. Ils pèsent pour un quart dans le classement des métiers ci-dessous.
        </p>
        <div className="mt-4 space-y-3">
          {result.tasteResults.slice(0, 8).map((t) => (
            <div key={t.univers}>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{t.label}</span>
                <span className="text-muted-foreground">{t.percent}%</span>
              </div>
              <div className="mt-1">
                <Bar value={t.percent} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
        <p className="text-lg font-semibold">Vos univers professionnels</p>
        <p className="mt-1 text-sm text-muted">
          Les familles de métiers où votre profil trouve le plus de correspondances. Commencez vos recherches par les deux premières.
        </p>
        <div className="mt-4 space-y-3">
          {univers.slice(0, 6).map((u) => (
            <div key={u.univers}>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{u.label}</span>
                <span className="text-muted-foreground">{u.score}%</span>
              </div>
              <div className="mt-1">
                <Bar value={u.score} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Les métiers qui vous correspondent</h3>
        <p className="mt-1 text-sm text-muted">
          Classement par compatibilité avec vos activités, vos intérêts, vos compétences et vos valeurs. Un pourcentage élevé n&apos;est pas une recommandation : c&apos;est une invitation à aller lire la fiche du métier et à rencontrer quelqu&apos;un qui l&apos;exerce.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["tous", "Tous les métiers"],
              ["court", "Jusqu'à bac+2"],
              ["long", "Bac+3 et plus"],
              ["reconv", "Formation courte"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setLevelFilter(key);
                setVisibleCount(15);
              }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                levelFilter === key ? "border-primary bg-primary/10 text-primary" : "border-card-border text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 divide-y divide-card-border">
          {shownJobs.map((m) => (
            <div key={m.name} className="flex items-start gap-4 py-4">
              <div className="w-14 shrink-0 text-right text-lg font-semibold text-primary">
                {m.score}
                <span className="text-xs font-medium text-muted-foreground">%</span>
              </div>
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="mt-0.5 text-sm text-muted">{m.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded border border-card-border px-2 py-0.5 text-xs text-foreground">
                    {universLabels[m.univers] ?? m.univers}
                  </span>
                  <span className="rounded border border-card-border px-2 py-0.5 text-xs text-muted-foreground">
                    {LEVEL_LABELS[m.level]}
                  </span>
                  <span className="rounded border border-primary/40 px-2 py-0.5 text-xs font-semibold tracking-wide text-primary">
                    {m.code}
                  </span>
                  {m.tags
                    .filter((t) => t !== "reconv" || audience === "adu")
                    .map((t) => (
                      <span key={t} className="rounded border border-card-border px-2 py-0.5 text-xs text-muted-foreground">
                        {TAG_LABELS[t]}
                      </span>
                    ))}
                </div>
                {m.notes.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">{m.notes.join(" · ")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {filteredJobs.length > visibleCount && (
          <button
            type="button"
            onClick={() => setVisibleCount((n) => n + 15)}
            className="mt-4 rounded-full border border-card-border px-4 py-2 text-sm font-medium hover:border-primary/40"
          >
            Voir {Math.min(15, filteredJobs.length - visibleCount)} métiers de plus
          </button>
        )}
        {filteredJobs.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">Aucun métier dans ce filtre. Revenez à « tous les métiers ».</p>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
        <p className="text-lg font-semibold">Ce qui compte pour vous au travail</p>
        <div className="mt-4 space-y-3">
          {result.valueResults.map((v) => (
            <div key={v.code}>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{v.label}</span>
                <span className="text-muted-foreground">{v.percent}%</span>
              </div>
              <div className="mt-1">
                <Bar value={v.percent} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {result.valueAdviceTop.map((v) => (
            <p key={v.code} className="text-sm">
              <span className="font-medium">{v.label}. </span>
              <span className="text-muted">{audience === "lyc" ? v.textLyc : v.textAdu}</span>
            </p>
          ))}
        </div>
        <p className="mt-4 border-l-2 border-card-border pl-4 text-sm text-muted">
          Vous accordez nettement moins d&apos;importance à : {result.valueLowLabel}. C&apos;est une information utile : ne choisissez pas un métier pour ces raisons-là, elles ne vous retiendront pas.
        </p>
      </div>

      {(result.appuiCodes.length > 0 || result.devCodes.length > 0 || result.cacheCodes.length > 0) && (
        <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
          <p className="text-lg font-semibold">Points d&apos;appui et compétences à construire</p>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="font-semibold">Points d&apos;appui</p>
              <p className="text-muted">
                {result.appuiCodes.length
                  ? "Intérêt et compétence se rejoignent. C'est là que vous serez crédible tout de suite : mettez ces domaines en avant dans un dossier, une lettre ou un entretien."
                  : "Vos scores sont trop proches les uns des autres pour trancher sur cette ligne."}
              </p>
            </div>
            <div>
              <p className="font-semibold">À développer</p>
              <p className="text-muted">
                {result.devCodes.length
                  ? "L'envie est là, la maîtrise pas encore. Ce n'est pas un obstacle mais un programme : ce sont les compétences à travailler en priorité dans les deux ans qui viennent."
                  : "Vos scores sont trop proches les uns des autres pour trancher sur cette ligne."}
              </p>
            </div>
            <div>
              <p className="font-semibold">Compétences dormantes</p>
              <p className="text-muted">
                {result.cacheCodes.length
                  ? "Vous savez faire, mais ça ne vous motive pas. Utile pour être recruté, risqué comme cœur de métier."
                  : "Vos scores sont trop proches les uns des autres pour trancher sur cette ligne."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
        <p className="text-lg font-semibold">Vos cinq prochaines étapes</p>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-muted">
          {action.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ol>
      </div>

      <p className="mt-8 rounded-lg border border-dashed border-card-border p-4 text-sm text-muted">
        Ce résultat décrit des préférences, pas des capacités ni un avenir. Un profil peut évoluer nettement en deux ou trois ans, surtout après une expérience nouvelle. Considérez-le comme une hypothèse à vérifier sur le terrain.
      </p>
    </div>
  );
}
