import { ImageResponse } from "next/og";
import { loadShareableAttempt } from "@/lib/shareable-attempt";
import { SITE_NAME } from "@/lib/site";
import { ProfiliaMark } from "@/components/profilia-mark";

// A 1080x1920 (Instagram story) card for one person's own result: test name,
// the profile headline and a few top scores, plus a call to take the test.
// Built from the stored result, never from query text, and only for the
// owner of a viewable result on an allow-listed personality test — so
// nobody can print arbitrary words under the brand.
export async function GET(_req: Request, ctx: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await ctx.params;
  const loaded = await loadShareableAttempt(attemptId);
  if (loaded.error !== undefined) {
    return new Response(loaded.error, { status: 403 });
  }
  const { test, summary } = loaded;

  const headline = summary.headline.length > 60 ? `${summary.headline.slice(0, 57)}…` : summary.headline;
  const top = [...summary.bars].sort((a, b) => b.value - a.value).slice(0, 4);
  const notes = summary.notes.slice(0, 3);
  const title = test.title.length > 70 ? `${test.title.slice(0, 67)}…` : test.title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "150px 90px 280px",
          background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 45%, #be185d 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -200, right: -160, width: 700, height: 700, borderRadius: 999, background: "#f59e0b", opacity: 0.18, display: "flex" }} />
        <div style={{ position: "absolute", bottom: 200, left: -240, width: 600, height: 600, borderRadius: 999, background: "#38bdf8", opacity: 0.15, display: "flex" }} />

        <div style={{ display: "flex", alignItems: "center", fontSize: 54, fontWeight: 800 }}>
          <div style={{ marginRight: 20, display: "flex" }}>
            <ProfiliaMark size={64} />
          </div>
          {SITE_NAME}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", opacity: 0.8, display: "flex" }}>
            Mon profil
          </div>
          <div style={{ marginTop: 24, fontSize: headline.length > 28 ? 92 : 120, fontWeight: 900, lineHeight: 1.05, display: "flex" }}>
            {headline || title}
          </div>
          {headline && (
            <div style={{ marginTop: 28, fontSize: 38, opacity: 0.85, display: "flex" }}>{title}</div>
          )}

          {top.length > 0 && (
            <div style={{ marginTop: 70, display: "flex", flexDirection: "column" }}>
              {top.map((b) => (
                <div key={b.label} style={{ display: "flex", flexDirection: "column", marginBottom: 34 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 36, fontWeight: 600 }}>
                    <span style={{ display: "flex" }}>{b.label.length > 30 ? `${b.label.slice(0, 28)}…` : b.label}</span>
                    <span style={{ display: "flex" }}>{Math.round(b.value * 100)}%</span>
                  </div>
                  <div style={{ marginTop: 12, height: 18, borderRadius: 999, background: "rgba(255,255,255,0.22)", display: "flex" }}>
                    <div style={{ width: `${Math.max(4, Math.round(b.value * 100))}%`, height: 18, borderRadius: 999, background: "#fde68a", display: "flex" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {top.length === 0 && notes.length > 0 && (
            <div style={{ marginTop: 60, display: "flex", flexDirection: "column" }}>
              {notes.map((n) => (
                <div key={n.label} style={{ display: "flex", flexDirection: "column", marginBottom: 30 }}>
                  <div style={{ fontSize: 30, opacity: 0.75, display: "flex" }}>{n.label}</div>
                  <div style={{ fontSize: 38, fontWeight: 700, display: "flex" }}>
                    {n.text.length > 48 ? `${n.text.slice(0, 46)}…` : n.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", padding: 48, borderRadius: 40, background: "rgba(255,255,255,0.14)" }}>
          <div style={{ fontSize: 56, fontWeight: 900, display: "flex" }}>Et toi, tu es quel profil ?</div>
          <div style={{ marginTop: 14, fontSize: 38, opacity: 0.9, display: "flex" }}>
            Défie tes amis et ta famille · profilia-test.fr
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
