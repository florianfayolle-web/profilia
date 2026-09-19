// Shared across the wheel and the score bars so "D" always reads as the
// same red everywhere in the report, same for I/S/C.
export const DISC_COLORS: Record<"D" | "I" | "S" | "C", string> = {
  D: "#dc2626",
  I: "#eab308",
  S: "#16a34a",
  C: "#2563eb",
};

const QUADRANTS: Record<
  "D" | "I" | "S" | "C",
  { d: string; labelX: number; labelY: number; color: string }
> = {
  D: { d: "M160 160 L20 160 A140 140 0 0 1 160 20 Z", labelX: 100, labelY: 100, color: DISC_COLORS.D },
  I: { d: "M160 160 L160 20 A140 140 0 0 1 300 160 Z", labelX: 220, labelY: 100, color: DISC_COLORS.I },
  S: { d: "M160 160 L300 160 A140 140 0 0 1 160 300 Z", labelX: 220, labelY: 220, color: DISC_COLORS.S },
  C: { d: "M160 160 L160 300 A140 140 0 0 1 20 160 Z", labelX: 100, labelY: 220, color: DISC_COLORS.C },
};

// Position on the wheel from each style's share of picks (0..1, roughly
// centered on 0.25 since a 4-way forced choice averages there with no
// preference). Mirrors the purchased DISC widget's own placement formula so
// the visual reads the same way: right = extraverti/relationnel, top = actif.
export function scoresToPoint(scores: { D: number; I: number; S: number; C: number }) {
  const signed = (v: number) => Math.max(-1, Math.min(1, (v - 0.25) / 0.75));
  const x = (signed(scores.I) + signed(scores.S) - signed(scores.D) - signed(scores.C)) / 2;
  const y = (signed(scores.D) + signed(scores.I) - signed(scores.S) - signed(scores.C)) / 2;
  let px = x * 118;
  let py = -y * 118;
  const dist = Math.hypot(px, py);
  if (dist > 118) {
    px = (px / dist) * 118;
    py = (py / dist) * 118;
  }
  return { x: 160 + px, y: 160 + py };
}

export function DiscWheel({
  scores,
}: {
  scores: { D: number; I: number; S: number; C: number };
}) {
  const point = scoresToPoint(scores);

  return (
    <svg
      viewBox="-12 -12 344 344"
      role="img"
      aria-label="Roue DISC avec ta position"
      className="mx-auto h-auto w-full max-w-xs"
    >
      {(Object.keys(QUADRANTS) as Array<"D" | "I" | "S" | "C">).map((key) => {
        const q = QUADRANTS[key];
        return (
          <g key={key}>
            <path d={q.d} fill={q.color} />
            <text
              x={q.labelX}
              y={q.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="54"
              fontWeight="800"
              fill="#fff"
              opacity={0.55}
            >
              {key}
            </text>
          </g>
        );
      })}
      <line x1="160" y1="20" x2="160" y2="300" stroke="#f8fafc" strokeWidth="5" />
      <line x1="20" y1="160" x2="300" y2="160" stroke="#f8fafc" strokeWidth="5" />
      <text x="160" y="4" textAnchor="middle" fontSize="13" fill="#64748b">
        Actif · extraverti
      </text>
      <text x="160" y="320" textAnchor="middle" fontSize="13" fill="#64748b">
        Réservé · introverti
      </text>
      <text
        x="2"
        y="160"
        textAnchor="middle"
        fontSize="13"
        fill="#64748b"
        transform="rotate(-90 2 160)"
      >
        Tâches
      </text>
      <text
        x="318"
        y="160"
        textAnchor="middle"
        fontSize="13"
        fill="#64748b"
        transform="rotate(90 318 160)"
      >
        Relations
      </text>
      <circle cx={point.x} cy={point.y} r="15" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
      <circle cx={point.x} cy={point.y} r="5" fill="#0f172a" />
    </svg>
  );
}
