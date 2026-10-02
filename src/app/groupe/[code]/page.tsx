import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { MAX_GROUP_MEMBERS, type GroupSummary } from "@/lib/groups";
import { LeaveButton, RememberGroup, ShareLinks } from "@/components/group-client";

// Private by design: reached only through the group's unguessable link.
export const metadata: Metadata = {
  title: "Comparer vos profils",
  robots: { index: false, follow: false },
};

const COLORS = ["#4f46e5", "#e11d48", "#16a34a", "#d97706", "#0891b2", "#9333ea", "#475569", "#db2777", "#65a30d", "#ea580c", "#0d9488", "#7c3aed"];

type Member = { id: string; display_name: string; summary: GroupSummary; consented_at: string };

export default async function GroupPage(props: PageProps<"/groupe/[code]">) {
  const { code } = await props.params;
  const admin = createAdminClient();

  const { data: group } = await admin
    .from("comparison_groups")
    .select("id, name, test_id")
    .eq("code", code)
    .maybeSingle();
  if (!group) notFound();

  const [{ data: test }, { data: rows }] = await Promise.all([
    admin.from("tests").select("slug, title").eq("id", group.test_id).single(),
    admin
      .from("comparison_members")
      .select("id, display_name, summary, consented_at")
      .eq("group_id", group.id)
      .order("consented_at", { ascending: true }),
  ]);
  if (!test) notFound();
  const members = (rows ?? []) as Member[];

  const url = `${SITE_URL}/groupe/${code}`;
  const title = group.name ? `« ${group.name} »` : "Notre groupe";

  const barLabels: string[] = [];
  for (const m of members) for (const b of m.summary.bars) if (!barLabels.includes(b.label)) barLabels.push(b.label);
  const noteLabels: string[] = [];
  for (const m of members) for (const n of m.summary.notes) if (!noteLabels.includes(n.label)) noteLabels.push(n.label);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <RememberGroup code={code} testSlug={test.slug} name={group.name} />
      <p className="text-sm text-muted">Comparaison de profils · {test.title}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>

      <div className="mt-8 rounded-xl border border-primary/30 bg-card p-6">
        <p className="font-medium">Invite d&apos;autres personnes</p>
        <p className="mt-1 text-sm text-muted">
          Envoie ce lien : chacun fait le test (gratuit pour répondre), puis choisit de rejoindre le groupe. Rien
          n&apos;est visible ici sans son accord.
        </p>
        <p className="mt-3 break-all rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">{url}</p>
        <div className="mt-3">
          <ShareLinks url={url} text={`Fais le test « ${test.title} » et compare ton profil avec le nôtre :`} />
        </div>
        <Link
          href={`/tests/${test.slug}`}
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition hover:opacity-90"
        >
          Faire le test pour rejoindre
        </Link>
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        Dans le groupe ({members.length}/{MAX_GROUP_MEMBERS})
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {members.map((m, i) => (
          <div key={m.id} className="rounded-xl border border-card-border bg-card p-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <p className="font-semibold">{m.display_name}</p>
            </div>
            {m.summary.headline && <p className="mt-2 text-sm text-muted">{m.summary.headline}</p>}
            <div className="mt-2">
              <LeaveButton memberId={m.id} />
            </div>
          </div>
        ))}
        {members.length === 0 && <p className="text-sm text-muted">Personne n&apos;a encore rejoint ce groupe.</p>}
      </div>

      {members.length >= 2 && barLabels.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-semibold tracking-tight">Comparaison</h2>
          <div className="mt-4 space-y-6">
            {barLabels.map((label) => (
              <div key={label}>
                <p className="text-sm font-medium">{label}</p>
                <div className="mt-2 space-y-1.5">
                  {members.map((m, i) => {
                    const bar = m.summary.bars.find((b) => b.label === label);
                    if (!bar) return null;
                    return (
                      <div key={m.id} className="flex items-center gap-3 text-xs">
                        <span className="w-20 shrink-0 truncate text-muted">{m.display_name}</span>
                        <div className="h-2 flex-1 rounded-full bg-card-border/50">
                          <div className="h-2 rounded-full" style={{ width: `${Math.max(3, Math.round(bar.value * 100))}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                        <span className="w-9 shrink-0 text-right tabular-nums text-muted-foreground">{Math.round(bar.value * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {members.length >= 2 && noteLabels.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-semibold tracking-tight">Tendances par dimension</h2>
          <div className="mt-4 space-y-5">
            {noteLabels.map((label) => (
              <div key={label}>
                <p className="text-sm font-medium">{label}</p>
                <ul className="mt-1.5 space-y-1 text-sm">
                  {members.map((m, i) => {
                    const note = m.summary.notes.find((n) => n.label === label);
                    if (!note) return null;
                    return (
                      <li key={m.id} className="flex gap-2">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span>
                          <span className="font-medium">{m.display_name}</span>
                          <span className="text-muted"> : {note.text}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-12 text-xs text-muted-foreground">
        Seuls le prénom et un résumé du résultat sont partagés, avec l&apos;accord de chacun, jamais les réponses.
        Chaque personne peut retirer son profil à tout moment depuis le navigateur où elle l&apos;a ajouté.
      </p>
    </div>
  );
}
