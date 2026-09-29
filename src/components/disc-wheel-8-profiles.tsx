// Clean vector recreation of the reference "8-profile DISC wheel" — a
// crisp SVG instead of a screenshot, so it stays sharp at any size and
// matches the site's rendering (no compression artifacts, no moiré on the
// thin ring boundaries). Segment order/colors mirror discArchetype() in
// scoring.ts: Planificateur sits on the C/D border at the top, then
// clockwise Pilote (D), Entraîneur (D/I), Animateur (I), Pacificateur
// (I/S), Conseiller (S), Protecteur (S/C), Analyste (C).

type Segment = { label: string; outer: string; inner: string };

const SEGMENTS: Segment[] = [
  { label: "Planificateur", outer: "#8b6bb0", inner: "#cabfe1" },
  { label: "Pilote", outer: "#d8484a", inner: "#f0b6b4" },
  { label: "Entraîneur", outer: "#e57f34", inner: "#f6c9a0" },
  { label: "Animateur", outer: "#e6b430", inner: "#f5e2a0" },
  { label: "Pacificateur", outer: "#a9c23c", inner: "#dfe8ac" },
  { label: "Conseiller", outer: "#4caf50", inner: "#b9e0ba" },
  { label: "Protecteur", outer: "#37a68a", inner: "#a6d8cb" },
  { label: "Analyste", outer: "#3f7fc9", inner: "#aecdea" },
];

const CORNERS: { label: string; letter: string; bg: string; fg: string; x: number; y: number; anchor: "start" | "end" }[] = [
  { label: "Conformité", letter: "C", bg: "#dbeafe", fg: "#2563eb", x: 14, y: 30, anchor: "start" },
  { label: "Dominance", letter: "D", bg: "#fde2e2", fg: "#dc2626", x: 626, y: 30, anchor: "end" },
  { label: "Stabilité", letter: "S", bg: "#dcf5e0", fg: "#16a34a", x: 14, y: 618, anchor: "start" },
  { label: "Influence", letter: "I", bg: "#fdf0cf", fg: "#c99a1a", x: 626, y: 618, anchor: "end" },
];

const CX = 320;
const CY = 320;
const R_OUTER = 300;
const R_MID = 208;
const R_HOLE = 96;
const R_LABEL = 322;

function polar(r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function ringPath(rOuter: number, rInner: number, startDeg: number, endDeg: number) {
  const p1 = polar(rOuter, startDeg);
  const p2 = polar(rOuter, endDeg);
  const p3 = polar(rInner, endDeg);
  const p4 = polar(rInner, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
}

// Keeps every label right-side up: the raw tangent angle would flip text
// upside down on the left half of the wheel, so that half is rotated 180°
// back.
function labelRotation(centerDeg: number) {
  return centerDeg > 90 && centerDeg < 270 ? centerDeg - 180 : centerDeg;
}

export function DiscWheel8Profiles({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 640" className={className} role="img" aria-label="Roue DISC des 8 profils">
      <circle cx={CX} cy={CY} r={R_OUTER + 2} fill="none" stroke="#ffffff" strokeWidth="2" />
      {SEGMENTS.map((seg, i) => {
        const start = i * 45 - 22.5;
        const end = start + 45;
        return (
          <g key={seg.label}>
            <path d={ringPath(R_OUTER, R_MID, start, end)} fill={seg.outer} stroke="#ffffff" strokeWidth="2" />
            <path d={ringPath(R_MID, R_HOLE, start, end)} fill={seg.inner} stroke="#ffffff" strokeWidth="2" />
            <line
              x1={polar(R_MID, start + 22.5).x}
              y1={polar(R_MID, start + 22.5).y}
              x2={polar(R_HOLE, start + 22.5).x}
              y2={polar(R_HOLE, start + 22.5).y}
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity={0.6}
            />
            <line
              x1={polar(R_OUTER, start + 22.5).x}
              y1={polar(R_OUTER, start + 22.5).y}
              x2={polar(R_MID, start + 22.5).x}
              y2={polar(R_MID, start + 22.5).y}
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity={0.6}
            />
          </g>
        );
      })}

      <circle cx={CX} cy={CY} r={R_HOLE - 2} fill="var(--card, #ffffff)" />

      {SEGMENTS.map((seg, i) => {
        const centerDeg = i * 45;
        const p = polar(R_LABEL, centerDeg);
        const rot = labelRotation(centerDeg);
        return (
          <text
            key={seg.label}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="22"
            fontWeight="800"
            fill={seg.outer}
            transform={`rotate(${rot} ${p.x} ${p.y})`}
          >
            {seg.label}
          </text>
        );
      })}

      {CORNERS.map((c) => (
        <g key={c.label} transform={`translate(${c.x} ${c.y})`}>
          <rect
            x={c.anchor === "start" ? 0 : -158}
            y={-19}
            width={158}
            height={38}
            rx={19}
            fill={c.bg}
          />
          <text x={c.anchor === "start" ? 20 : -138} y={6} fontSize="19" fontWeight="800" fill={c.fg}>
            {c.letter}
          </text>
          <text x={c.anchor === "start" ? 42 : -116} y={6} fontSize="17" fontWeight="600" fill="#3b4657">
            {c.label.slice(1)}
          </text>
        </g>
      ))}
    </svg>
  );
}
