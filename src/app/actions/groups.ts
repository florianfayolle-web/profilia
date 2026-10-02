"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTestAccess } from "@/lib/access";
import {
  GROUP_TEST_SLUGS,
  MAX_GROUP_MEMBERS,
  newGroupCode,
  newManageToken,
  summarizeResult,
} from "@/lib/groups";

type Joined = { code: string; memberId: string; token: string };
type ActionResult = Joined | { error: string };

const cleanName = (n: string) => n.trim().replace(/\s+/g, " ").slice(0, 30);

// Shared by create/join: the attempt must be the caller's, belong to an
// eligible test and be viewable by them (a locked result must not be
// shareable around the paywall). Returns the summary to store.
async function loadShareableAttempt(attemptId: string) {
  const admin = createAdminClient();
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, user_id, test_id, result, result_profile_id, unlocked")
    .eq("id", attemptId)
    .maybeSingle();
  if (!attempt) return { error: "Résultat introuvable." } as const;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (attempt.user_id && attempt.user_id !== userData.user?.id) {
    return { error: "Ce résultat n'est pas le tien." } as const;
  }

  const { data: test } = await admin
    .from("tests")
    .select("id, slug, format, title, price_cents, included_in_subscription")
    .eq("id", attempt.test_id)
    .single();
  if (!test || !GROUP_TEST_SLUGS.has(test.slug)) {
    return { error: "Ce test ne peut pas être comparé en groupe." } as const;
  }

  if (test.price_cents === 0) {
    if (!attempt.unlocked) return { error: "Débloque d'abord ton résultat." } as const;
  } else {
    const access = await getTestAccess(test.id, test.price_cents, test.included_in_subscription);
    if (!access.hasAccess) return { error: "Débloque d'abord ton résultat." } as const;
  }

  let profileTitle: string | null = null;
  if (attempt.result_profile_id) {
    const { data: rp } = await admin
      .from("result_profiles")
      .select("title")
      .eq("id", attempt.result_profile_id)
      .maybeSingle();
    profileTitle = rp?.title ?? null;
  }
  const summary = summarizeResult(test.format, attempt.result, profileTitle);
  if (!summary.headline && summary.bars.length === 0 && summary.notes.length === 0) {
    return { error: "Impossible de résumer ce résultat." } as const;
  }
  return { attempt, test, summary } as const;
}

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
