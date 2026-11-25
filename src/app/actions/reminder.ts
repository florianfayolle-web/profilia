"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Opt-in given on the result screen: the visitor explicitly asks to receive
// the reminder email. Only works for a guest attempt (no account) that has a
// marketing lead row; the attempt id is an unguessable uuid.
export async function optInReminder(attemptId: string): Promise<{ ok: boolean }> {
  if (!/^[0-9a-f-]{36}$/i.test(attemptId)) return { ok: false };
  const admin = createAdminClient();
  const { data: attempt } = await admin
    .from("attempts")
    .select("user_id")
    .eq("id", attemptId)
    .maybeSingle();
  if (!attempt || attempt.user_id !== null) return { ok: false };
  const { data, error } = await admin
    .from("marketing_leads")
    .update({ consent: true })
    .eq("attempt_id", attemptId)
    .select("id");
  return { ok: !error && (data?.length ?? 0) > 0 };
}
