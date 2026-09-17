export function ProgressBar({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : Math.round(((step + 1) / total) * 100);

  return (
    <div className="mt-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-card-border/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-muted">
        Question {step + 1} / {total}
      </p>
    </div>
  );
}
