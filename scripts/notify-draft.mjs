// Sends the daily "new draft article, please review" email, with a link to
// the (GET-safe, no side effect) preview page — publishing itself happens
// from a POST-only form on that page, never from the emailed link directly.
// Run with:
//   node --env-file=.env.local scripts/notify-draft.mjs <id> <token> "<title>" "<oneLineSummary>"
import nodemailer from "nodemailer";

const [, , id, token, title, summary] = process.argv;
if (!id || !token || !title) {
  console.error('Usage: notify-draft.mjs <id> <token> "<title>" "<summary>"');
  process.exit(1);
}

const siteUrl = process.env.SITE_PUBLIC_URL;
const to = process.env.REPORT_TO_EMAIL || "florian.fayolle@icloud.com";
const user = process.env.ICLOUD_SMTP_USER;
const pass = process.env.ICLOUD_SMTP_PASSWORD;
if (!siteUrl || !user || !pass) {
  console.error("Missing SITE_PUBLIC_URL / ICLOUD_SMTP_USER / ICLOUD_SMTP_PASSWORD");
  process.exit(1);
}

const previewUrl = `${siteUrl}/blog/preview/${id}?token=${token}`;

const transporter = nodemailer.createTransport({
  host: "smtp.mail.me.com",
  port: 587,
  secure: false,
  auth: { user, pass },
  // Fail fast instead of hanging forever — this runs unattended, nobody is
  // around to notice or interrupt a stuck connection at 7am.
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 15_000,
});

await transporter.sendMail({
  from: `"SEO quotidien" <${user}>`,
  to,
  subject: `Nouvel article à valider — ${title}`,
  html: `
    <div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
      <h2 style="margin:0 0 12px">Nouvel article prêt pour relecture</h2>
      <p><strong>${title}</strong></p>
      ${summary ? `<p style="color:#555">${summary}</p>` : ""}
      <p style="margin-top:24px">
        <a href="${previewUrl}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">
          Voir le brouillon et publier
        </a>
      </p>
      <p style="color:#999;font-size:12px;margin-top:24px">Le lien ouvre un aperçu — la publication ne se déclenche que si tu cliques le bouton sur la page.</p>
    </div>
  `,
});

console.log("Email envoyé:", previewUrl);
