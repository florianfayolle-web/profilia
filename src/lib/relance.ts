import { createHmac, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";

// J+1 reminder to visitors who left their email on a free test AND ticked the
// opt-in box (marketing_leads.consent = true), and who have not unlocked
// their report. Never sent to anyone who did not opt in (CNIL / L34-5 CPCE).
// Needs: column marketing_leads.relance_sent_at (supabase/schema.sql), env
// ICLOUD_SMTP_USER / ICLOUD_SMTP_PASSWORD / RELANCE_SECRET, and
// RELANCE_ENABLED=1 to really send (otherwise dry-run only).

const MIN_AGE_H = 20;
const MAX_AGE_D = 7;

function secret() {
  return process.env.RELANCE_SECRET || process.env.CRON_SECRET || "";
}
export function unsubscribeToken(email: string) {
  return createHmac("sha256", secret()).update(email.toLowerCase()).digest("hex").slice(0, 32);
}
export function verifyUnsubscribeToken(email: string, token: string) {
  if (!secret()) return false;
  const a = Buffer.from(unsubscribeToken(email));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function buildMail(opts: { title: string; resultUrl: string; unsubUrl: string }) {
  const subject = `Ton profil « ${opts.title} » t'attend`;
  const text = `Salut,

Hier, tu as passé le test « ${opts.title} » sur Profilia. Ton profil principal est offert, et le détail complet de tes dimensions (avec le rapport PDF) est à 1,99 €, sans abonnement.

Retrouve ton résultat : ${opts.resultUrl}

Se désinscrire : ${opts.unsubUrl}
Profilia, profilia-test.fr`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#1c1c28;line-height:1.5">
<p>Salut,</p>
<p>Hier, tu as passé le test « ${esc(opts.title)} » sur Profilia. Ton profil principal est offert, et le détail complet de tes dimensions (avec le rapport PDF) est à <strong>1,99 €</strong>, sans abonnement.</p>
<p><a href="${esc(opts.resultUrl)}" style="display:inline-block;background:#8B1E3F;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Retrouver mon résultat</a></p>
<p style="font-size:12px;color:#777">Tu reçois ce message car tu as accepté de recevoir des conseils par email. <a href="${esc(opts.unsubUrl)}">Se désinscrire</a></p></div>`;
  return { subject, text, html };
}

export async function runRelance({ dryRun }: { dryRun: boolean }) {
  const admin = createAdminClient();
  const now = Date.now();
  const { data: leads, error } = await admin
    .from("marketing_leads")
    .select("id, email, test_slug, attempt_id, created_at")
    .eq("consent", true)
    .is("relance_sent_at", null)
    .lte("created_at", new Date(now - MIN_AGE_H * 3600_000).toISOString())
    .gte("created_at", new Date(now - MAX_AGE_D * 86400_000).toISOString())
    .not("attempt_id", "is", null);
  if (error) {
    return { eligible: 0, sent: [] as string[], errors: [`relance disabled: ${error.message}`], dryRun };
  }

  const sent: string[] = [];
  const errors: string[] = [];
  let eligible = 0;
  const enabled = process.env.RELANCE_ENABLED === "1" && !dryRun;
  const user = process.env.ICLOUD_SMTP_USER;
  const pass = process.env.ICLOUD_SMTP_PASSWORD;
  const transporter =
    enabled && user && pass && secret()
      ? nodemailer.createTransport({
          host: "smtp.mail.me.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: { user, pass },
          connectionTimeout: 15_000,
          socketTimeout: 15_000,
        })
      : null;
  if (enabled && !transporter) errors.push("SMTP or RELANCE_SECRET missing");

  for (const lead of leads ?? []) {
    const { data: attempt } = await admin
      .from("attempts")
      .select("unlocked")
      .eq("id", lead.attempt_id!)
      .maybeSingle();
    if (!attempt || attempt.unlocked) continue;
    eligible++;
    if (!transporter) continue;
    const { data: test } = await admin.from("tests").select("title").eq("slug", lead.test_slug).maybeSingle();
    const mail = buildMail({
      title: test?.title ?? "Profilia",
      resultUrl: `${SITE_URL}/tests/${lead.test_slug}/result/${lead.attempt_id}?utm_source=email&utm_medium=relance&utm_campaign=j1`,
      unsubUrl: `${SITE_URL}/api/unsubscribe?e=${encodeURIComponent(lead.email)}&t=${unsubscribeToken(lead.email)}`,
    });
    try {
      await transporter.sendMail({ from: `"Profilia" <${user}>`, to: lead.email, ...mail });
      await admin.from("marketing_leads").update({ relance_sent_at: new Date().toISOString() }).eq("id", lead.id);
      sent.push(lead.id);
    } catch (e) {
      errors.push(`lead ${lead.id}: ${(e as Error).message}`);
    }
  }
  return { eligible, sent, errors, dryRun: !enabled };
}
