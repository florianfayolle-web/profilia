// The Wechsler classification bands (WAIS scale, mean 100 / SD 15) as a
// normal-distribution curve — showing where a score sits against the
// population's actual bell curve reads more honestly than a bare "X/60"
// fraction, which invites comparing this indicative test to a school quiz
// rather than to the standardized scale it's borrowing its number from.
// Band edges (70/80/90/110/120/130) are the published classification
// cutoffs; the population shares under each are the real normal-CDF values
// at those cutoffs for a mean-100/SD-15 distribution — not eyeballed.
const IQ_BANDS: { max: number; label: string; share: string }[] = [
  { max: 70, label: "< 70", share: "2,3 %" },
  { max: 80, label: "70-79", share: "6,9 %" },
  { max: 90, label: "80-89", share: "16 %" },
  { max: 110, label: "90-109", share: "49,7 %" },
  { max: 120, label: "110-119", share: "16 %" },
  { max: 130, label: "120-129", share: "6,9 %" },
  { max: 145, label: "130+", share: "2,3 %" },
];
const IQ_SCALE_MIN = 55;
const IQ_SCALE_MAX = 145;
const IQ_MEAN = 100;
const IQ_SD = 15;

function gaussian(x: number) {
  return Math.exp(-0.5 * Math.pow((x - IQ_MEAN) / IQ_SD, 2));
}

// SVG geometry: x in [IQ_SCALE_MIN, IQ_SCALE_MAX] maps to px [20, 620];
// curve density maps to px [BASELINE_Y, BASELINE_Y - CURVE_HEIGHT].
const SVG_W = 640;
const PAD_X = 20;
const BASELINE_Y = 190;
const CURVE_HEIGHT = 150;

function xToPx(x: number) {
  return PAD_X + ((x - IQ_SCALE_MIN) / (IQ_SCALE_MAX - IQ_SCALE_MIN)) * (SVG_W - 2 * PAD_X);
}
function densityToPx(d: number) {
  return BASELINE_Y - d * CURVE_HEIGHT;
}

function curvePoints(from: number, to: number, step = 1) {
  const pts: [number, number][] = [];
  for (let x = from; x <= to; x += step) {
    pts.push([xToPx(x), densityToPx(gaussian(x))]);
  }
  pts.push([xToPx(to), densityToPx(gaussian(to))]);
  return pts;
}

// `compact` drops the per-band percentages and the x-axis tick labels, for
// small decorative placements (e.g. the homepage teaser) where that much
// text would just be noise — the curve, the bands and the score marker
// still tell the same story at a glance.
export function IqScale({ iqScore, compact = false }: { iqScore: number; compact?: boolean }) {
  const bounds = [IQ_SCALE_MIN, ...IQ_BANDS.map((b) => b.max)];
  const clampedScore = Math.max(IQ_SCALE_MIN, Math.min(IQ_SCALE_MAX, iqScore));
  const markerX = xToPx(clampedScore);
  const markerY = densityToPx(gaussian(clampedScore));
  const ticks = [60, 70, 80, 90, 100, 110, 120, 130, 140];

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${compact ? 205 : 230}`}
      className="w-full"
      role="img"
      aria-label="Position sur l'échelle de Wechsler"
    >
      {IQ_BANDS.map((band, i) => {
        const from = bounds[i];
        const to = bounds[i + 1];
        const top = curvePoints(from, to);
        const path =
          `M ${xToPx(from)} ${BASELINE_Y} ` +
          top.map(([x, y]) => `L ${x} ${y}`).join(" ") +
          ` L ${xToPx(to)} ${BASELINE_Y} Z`;
        const opacity = 0.22 + (i / (IQ_BANDS.length - 1)) * 0.68;
        const midX = xToPx((from + to) / 2);
        const labelY = Math.min(densityToPx(gaussian((from + to) / 2)) + 22, BASELINE_Y - 10);
        return (
          <g key={band.label}>
            <path d={path} fill="var(--primary)" opacity={opacity} />
            {!compact && to - from >= 10 && (
              <text x={midX} y={labelY} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                {band.share}
              </text>
            )}
          </g>
        );
      })}

      <path
        d={`M ${curvePoints(IQ_SCALE_MIN, IQ_SCALE_MAX).map(([x, y]) => `${x} ${y}`).join(" L ")}`}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
      />
      <line x1={PAD_X} y1={BASELINE_Y} x2={SVG_W - PAD_X} y2={BASELINE_Y} stroke="var(--card-border)" strokeWidth="1" />

      {!compact &&
        ticks.map((t) => (
          <text key={t} x={xToPx(t)} y={BASELINE_Y + 18} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
            {t}
          </text>
        ))}

      <line x1={markerX} y1={BASELINE_Y + 6} x2={markerX} y2={markerY} stroke="var(--foreground)" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx={markerX} cy={markerY} r="6" fill="var(--foreground)" stroke="var(--card, #fff)" strokeWidth="2" />
      <text x={markerX} y={Math.max(16, markerY - 14)} textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--foreground)">
        {iqScore}
      </text>
    </svg>
  );
}
