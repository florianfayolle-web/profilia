import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}, tests de personnalité en ligne`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 72,
            fontWeight: 700,
            color: "#1d2b64",
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ marginTop: 24, fontSize: 34, color: "#475569" }}>
          Tests de personnalité en ligne
        </div>
        <div style={{ marginTop: 12, fontSize: 24, color: "#64748b" }}>
          SOSIE 2 · TD12 · ADAPT · Jugement situationnel
        </div>
      </div>
    ),
    { ...size }
  );
}
