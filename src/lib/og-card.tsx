import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";
import { ProfiliaMark } from "@/components/profilia-mark";

export const OG_SIZE = { width: 1200, height: 630 };

// One shared layout for the per-page social images: brand, a kicker line,
// the page's real title, and soft decorative circles (no external assets).
export function ogCard({
  kicker,
  title,
  accent = "#2f5fae",
}: {
  kicker: string;
  title: string;
  accent?: string;
}) {
  const shown = title.length > 110 ? `${title.slice(0, 107)}…` : title;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 60%, #fff7ed 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -120, right: -80, width: 420, height: 420, borderRadius: 999, background: accent, opacity: 0.14, display: "flex" }} />
        <div style={{ position: "absolute", bottom: -140, right: 260, width: 320, height: 320, borderRadius: 999, background: "#f59e0b", opacity: 0.14, display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 700, color: "#13254a" }}>
          <div style={{ marginRight: 16, display: "flex" }}>
            <ProfiliaMark size={40} />
          </div>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: 2, display: "flex" }}>
            {kicker}
          </div>
          <div style={{ marginTop: 20, fontSize: shown.length > 70 ? 54 : 64, fontWeight: 800, color: "#0f172a", lineHeight: 1.12, display: "flex" }}>
            {shown}
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#475569", display: "flex" }}>
          Tests de personnalité en ligne · profilia-test.fr
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
