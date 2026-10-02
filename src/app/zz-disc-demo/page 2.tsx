import { createAdminClient } from "@/lib/supabase/admin";
import { scoreDisc } from "@/lib/assessments/scoring";
import { ResultView } from "@/app/tests/[slug]/result/[attemptId]/result-view";
import { getTestThemeStyle } from "@/lib/test-theme";

const TH = { D: 45, I: 135, S: 225, C: 315 } as const;
const ANGLE: Record<string, number> = { Planificateur: 0, Pilote: 45, "Entraîneur": 90, Animateur: 135, Pacificateur: 180, Conseiller: 225, Protecteur: 270, Analyste: 315 };
const gum = () => -Math.log(-Math.log(Math.random()));

export default async function Demo(props: { searchParams: Promise<{ p?: string }> }) {
  const { p = "Entraîneur" } = await props.searchParams;
  const ang = ANGLE[p] ?? 90;
  const { data: t } = await createAdminClient().from("tests").select("id").eq("slug", "disc").single();
  const { data: c } = await createAdminClient().from("test_content").select("definition").eq("test_id", t!.id).single();
  const def = c!.definition;
  const w: Record<string, number> = {};
  for (const k of Object.keys(TH) as (keyof typeof TH)[]) w[k] = 2 * Math.cos(((ang - TH[k]) * Math.PI) / 180);
  const answers: Record<string, { plus: string; minus: string; timeMs: number }> = {};
  for (const it of def.items) {
    const u = it.options.map((o: { dimension: string }) => w[o.dimension] + 1.2 * gum());
    let mx = 0, mn = 0;
    u.forEach((v: number, i: number) => { if (v > u[mx]) mx = i; if (v < u[mn]) mn = i; });
    answers[String(it.id)] = { plus: it.options[mx].key, minus: it.options[mn].key, timeMs: 6000 + Math.random() * 4000 };
  }
  const result = scoreDisc(def, answers as unknown as Parameters<typeof scoreDisc>[1], "fr");
  return (
    <div className="sky-gradient mx-auto max-w-2xl px-6 py-10" style={getTestThemeStyle("disc")}>
      <p className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center text-xs text-primary">
        Simulation : réponses générées automatiquement pour un profil « {p} »
      </p>
      <ResultView format="disc_quad" result={result} language="fr" testSlug="disc" />
    </div>
  );
}
