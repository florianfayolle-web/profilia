// A two-pan balance scale that tilts toward whichever side weighs more —
// ports the source widget's own SVG math (src/app/tests/[slug]/run has the
// content extraction script) so the report keeps the same visual metaphor.
const CX = 260,
  CY = 76,
  HALF = 182,
  MAX_DEG = 13,
  ROD = 52,
  BASE = 232,
  RAD = 40;

function pan(x: number, y: number, color: string, label: string | null) {
  const cy = y + ROD + RAD;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + ROD} stroke="var(--ink-scale, #16132A)" strokeWidth={4} />
      <circle cx={x} cy={cy} r={RAD} fill={color} />
      {label !== null && (
        <text
          x={x}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-sans, sans-serif)"
          fontWeight={900}
          fontSize={30}
          fill="#fff"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function BalanceScale({
  leftWeight,
  rightWeight,
  leftLabel,
  rightLabel,
  leftCount,
  rightCount,
  leftColor = "#2B3AC4",
  rightColor = "#E0338A",
  ink = "#16132A",
}: {
  leftWeight: number;
  rightWeight: number;
  leftLabel: string;
  rightLabel: string;
  leftCount: number;
  rightCount: number;
  leftColor?: string;
  rightColor?: string;
  ink?: string;
}) {
  const total = leftWeight + rightWeight;
  const t = total > 0 ? (rightWeight - leftWeight) / total : 0;
  const th = (t * MAX_DEG * Math.PI) / 180;
  const lx = CX - HALF * Math.cos(th);
  const ly = CY - HALF * Math.sin(th);
  const rx = CX + HALF * Math.cos(th);
  const ry = CY + HALF * Math.sin(th);

  return (
    <svg viewBox="0 0 520 260" role="img" aria-label={`Balance : ${leftCount} vers ${leftLabel}, ${rightCount} vers ${rightLabel}`}>
      <rect x={CX - 58} y={BASE - 9} width={116} height={9} fill={ink} />
      <path d={`M${CX},${CY} L${CX + 26},${BASE - 9} L${CX - 26},${BASE - 9} Z`} fill={ink} />
      <line
        x1={lx.toFixed(1)}
        y1={ly.toFixed(1)}
        x2={rx.toFixed(1)}
        y2={ry.toFixed(1)}
        stroke={ink}
        strokeWidth={11}
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r={13} fill={ink} />
      {pan(Math.round(lx), Math.round(ly), leftColor, String(leftCount))}
      {pan(Math.round(rx), Math.round(ry), rightColor, String(rightCount))}
      <text x={6} y={18} fontFamily="var(--font-sans, sans-serif)" fontWeight={700} fontSize={14} fill="var(--muted-foreground, #6E6890)">
        {leftLabel.toUpperCase()}
      </text>
      <text x={514} y={18} textAnchor="end" fontFamily="var(--font-sans, sans-serif)" fontWeight={700} fontSize={14} fill="var(--muted-foreground, #6E6890)">
        {rightLabel.toUpperCase()}
      </text>
    </svg>
  );
}
