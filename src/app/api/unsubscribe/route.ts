import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/relance";

// One-click unsubscribe from the reminder email (HMAC-signed link).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("e") ?? "";
  const token = url.searchParams.get("t") ?? "";
  const ok = !!email && verifyUnsubscribeToken(email, token);
  if (ok) {
    await createAdminClient().from("marketing_leads").update({ consent: false }).ilike("email", email);
  }
  const msg = ok
    ? "Tu es bien désinscrit·e des emails Profilia."
    : "Lien invalide ou expiré.";
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><body style="font-family:system-ui;max-width:480px;margin:80px auto;padding:0 20px"><p>${msg}</p><p><a href="/">Retour à Profilia</a></p>`,
    { status: ok ? 200 : 400, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
