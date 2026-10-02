"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_GROUP_MEMBERS, newGroupCode, newManageToken } from "@/lib/groups";
import { loadShareableAttempt } from "@/lib/shareable-attempt";

type Joined = { code: string; memberId: string; token: string };
type ActionResult = Joined | { error: string };

const cleanName = (n: string) => n.trim().replace(/\s+/g, " ").slice(0, 30);

async function addMember(groupId: string, attemptId: string, displayName: string, summary: unknown): Promise<Joined | { error: string }> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("comparison_members")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId);
  if ((count ?? 0) >= MAX_GROUP_MEMBERS) return { error: `Ce groupe est complet (${MAX_GROUP_MEMBERS} personnes).` };

  const token = newManageToken();
  const { data: member, error } = await admin
    .from("comparison_members")
    .insert({ group_id: groupId, attempt_id: attemptId, display_name: displayName, summary, manage_token: token })
    .select("id")
    .single();
  if (error || !member) {
    return { error: error?.code === "23505" ? "Tu es déjà dans ce groupe." : "Impossible de t'ajouter au groupe." };
  }
  const { data: g } = await admin.from("comparison_groups").select("code").eq("id", groupId).single();
  return { code: g!.code, memberId: member.id, token };
}

export async function createGroup(
  attemptId: string,
  displayName: string,
  consent: boolean,
  groupName?: string
): Promise<ActionResult> {
  const name = cleanName(displayName);
  if (!name) return { error: "Indique un prénom ou un pseudo." };
  if (!consent) return { error: "Il faut accepter de partager ton résumé pour créer un groupe." };

  const loaded = await loadShareableAttempt(attemptId);
  if (loaded.error !== undefined) return { error: loaded.error };

  const admin = createAdminClient();
  for (let i = 0; i < 5; i++) {
    const { data: group, error } = await admin
      .from("comparison_groups")
      .insert({ code: newGroupCode(), test_id: loaded.test.id, name: cleanName(groupName ?? "") || null })
      .select("id")
      .single();
    if (error?.code === "23505") continue; // code collision, try another
    if (error || !group) return { error: "Impossible de créer le groupe pour le moment." };
    const added = await addMember(group.id, attemptId, name, loaded.summary);
    if ("error" in added) await admin.from("comparison_groups").delete().eq("id", group.id);
    return added;
  }
  return { error: "Impossible de créer le groupe pour le moment." };
}

export async function joinGroup(
  attemptId: string,
  code: string,
  displayName: string,
  consent: boolean
): Promise<ActionResult> {
  const name = cleanName(displayName);
  if (!name) return { error: "Indique un prénom ou un pseudo." };
  if (!consent) return { error: "Il faut accepter de partager ton résumé pour rejoindre le groupe." };

  const admin = createAdminClient();
  const { data: group } = await admin.from("comparison_groups").select("id, test_id").eq("code", code).maybeSingle();
  if (!group) return { error: "Groupe introuvable." };

  const loaded = await loadShareableAttempt(attemptId);
  if (loaded.error !== undefined) return { error: loaded.error };
  if (loaded.test.id !== group.test_id) return { error: "Ce groupe correspond à un autre test." };

  return addMember(group.id, attemptId, name, loaded.summary);
}

export async function leaveGroup(memberId: string, token: string): Promise<{ ok: boolean }> {
  const { error, count } = await createAdminClient()
    .from("comparison_members")
    .delete({ count: "exact" })
    .eq("id", memberId)
    .eq("manage_token", token);
  return { ok: !error && (count ?? 0) > 0 };
}
