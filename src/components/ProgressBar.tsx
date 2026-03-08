"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          Step {current} of {total}
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--gold)" }}>
          {pct}%
        </span>
      </div>
      <div
        className="w-full h-1 rounded-full"
        style={{ background: "rgba(240,235,224,0.12)" }}
      >
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "var(--gold)",
          }}
        />
      </div>
    </div>
  );
}
