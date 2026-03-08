"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  cashBuyerCost,
  comfortPlanNet,
  compoundGrowth,
  getActiveRepairs,
} from "@/lib/financial-math";
import type { UtilityConfig } from "@/types";

interface FinancialCompareProps {
  systemPrice: number;
  monthlyPayment: number;
  termYears: number;
  utilityInfo: UtilityConfig | null;
  onSelectPlan: () => void;
}

function fmt(n: number): string {
  return Math.abs(n).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const colors = ["#c9a84c", "#4caf6e", "#f0ebe0", "#e05555", "#6ec9f0"];
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
    }));
    setPieces(newPieces);
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 w-2 h-2 rounded-sm"
          style={{
            left: `${p.x}%`,
            background: p.color,
            animationName: "confettiFall",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "ease-in",
            animationFillMode: "both",
          }}
        />
      ))}
    </div>
  );
}

export default function FinancialCompare({
  systemPrice,
  monthlyPayment,
  termYears,
  utilityInfo,
  onSelectPlan,
}: FinancialCompareProps) {
  const maxYear = termYears;
  const [year, setYear] = useState(Math.min(25, maxYear));
  const [spRate, setSpRate] = useState(10.5);
  const [showConfetti, setShowConfetti] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartYear = useRef(year);

  // Confetti at final year
  useEffect(() => {
    if (year === maxYear) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [year, maxYear]);

  // --- Desktop vertical drag ---
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      dragStartY.current = e.clientY;
      dragStartYear.current = year;
      e.preventDefault();
    },
    [year]
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current || !dragRef.current) return;
      const container = dragRef.current.closest(".drag-container") as HTMLElement;
      if (!container) return;
      const height = container.clientHeight;
      const deltaY = e.clientY - dragStartY.current;
      const deltaYear = -Math.round((deltaY / height) * maxYear);
      const newYear = Math.min(
        maxYear,
        Math.max(0, dragStartYear.current + deltaYear)
      );
      setYear(newYear);
    }
    function onMouseUp() {
      dragging.current = false;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [maxYear]);

  // Financial calculations
  const cashTotal = cashBuyerCost(year, systemPrice);
  const invested = compoundGrowth(year, spRate, systemPrice);
  const comfortNet = comfortPlanNet(year, spRate, systemPrice, monthlyPayment);
  const activeRepairs = getActiveRepairs(year);
  const tuneUpCost = 200 * Math.floor(year);
  const comfortPayments = 12 * monthlyPayment * year;
  const delta = cashTotal - comfortNet;

  const handlePercent = maxYear > 0 ? (year / maxYear) * 100 : 0;

  return (
    <div className="flex flex-col gap-8">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div>
        <h2
          className="text-2xl md:text-3xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Cash vs. Comfort Plan
        </h2>
        {utilityInfo?.rateNote && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {utilityInfo.rateNote} — this calculator shows why financing can actually
            come out ahead.
          </p>
        )}
      </div>

      {/* Mobile slider — sticky top */}
      <div className="md:hidden sticky top-0 z-10 py-3" style={{ background: "var(--bg)" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Year</span>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--gold)" }}
          >
            {year}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxYear}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full accent-yellow-500"
          style={{ accentColor: "var(--gold)" }}
        />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Cash spent" value={`$${fmt(cashTotal)}`} color="var(--red)" />
        <StatCard
          label={`S&P invested (${spRate}%)`}
          value={`$${fmt(invested)}`}
          color="var(--gold)"
        />
        <StatCard
          label="Comfort advantage"
          value={delta >= 0 ? `+$${fmt(delta)}` : `-$${fmt(Math.abs(delta))}`}
          color={delta >= 0 ? "var(--green)" : "var(--red)"}
        />
      </div>

      {/* Delta bar */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted)" }}>
          <span>Cash ahead</span>
          <span>Comfort ahead</span>
        </div>
        <div
          className="relative h-3 rounded-full overflow-hidden"
          style={{ background: "rgba(240,235,224,0.08)" }}
        >
          <div
            className="absolute top-0 bottom-0 transition-all duration-300"
            style={{
              left: delta >= 0 ? "50%" : `${Math.max(5, 50 - (Math.abs(delta) / Math.max(cashTotal, 1)) * 50)}%`,
              right: delta >= 0 ? `${Math.max(5, 50 - (delta / Math.max(cashTotal, 1)) * 50)}%` : "50%",
              background: delta >= 0 ? "var(--green)" : "var(--red)",
              borderRadius: "9999px",
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-full"
            style={{ left: "50%", background: "rgba(240,235,224,0.2)" }}
          />
        </div>
      </div>

      {/* Main comparison — desktop has vertical drag handle */}
      <div className="flex gap-0 md:gap-6 relative drag-container" style={{ minHeight: "420px" }}>
        {/* Desktop drag handle */}
        <div className="hidden md:flex flex-col items-center justify-center w-12 flex-shrink-0">
          <div
            ref={dragRef}
            onMouseDown={onMouseDown}
            className="flex flex-col items-center gap-1 cursor-ns-resize select-none"
            style={{ userSelect: "none" }}
          >
            <div
              className="w-1 rounded-full transition-all duration-300"
              style={{
                height: "200px",
                background: "rgba(240,235,224,0.12)",
                position: "relative",
              }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{ top: `${100 - handlePercent}%`, transform: "translate(-50%, -50%)" }}
              >
                <div
                  className="rounded-full border-2 flex items-center justify-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "var(--bg)",
                    borderColor: "var(--gold)",
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--gold)", fontFamily: "var(--font-playfair), serif" }}
                  >
                    {year}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-xs mt-2" style={{ color: "var(--muted)", writingMode: "vertical-rl" }}>
              drag
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cash card */}
          <div
            className="p-5 flex flex-col gap-4"
            style={{
              borderRadius: "18px",
              border: "1.5px solid rgba(224,85,85,0.25)",
              background: "rgba(224,85,85,0.06)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--red)" }}
              />
              <span className="font-semibold text-sm" style={{ color: "var(--red)" }}>
                Cash Purchase
              </span>
            </div>

            <LineItem label="System cost" value={`$${fmt(systemPrice)}`} color="var(--red)" />
            <LineItem label="Annual tune-ups" value={`$${fmt(tuneUpCost)}`} color="var(--muted)" />
            {activeRepairs.map((r) => (
              <LineItem
                key={r.year}
                label={`Yr ${r.year}: ${r.label}`}
                value={`$${fmt(r.cost)}`}
                color="rgba(224,85,85,0.7)"
              />
            ))}

            <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(240,235,224,0.08)" }}>
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  Total spent
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-playfair), serif", color: "var(--red)" }}
                >
                  ${fmt(cashTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Comfort Plan card */}
          <div
            className="p-5 flex flex-col gap-4"
            style={{
              borderRadius: "18px",
              border: "1.5px solid rgba(76,175,110,0.25)",
              background: "rgba(76,175,110,0.06)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--green)" }}
              />
              <span className="font-semibold text-sm" style={{ color: "var(--green)" }}>
                Comfort Plan
              </span>
            </div>

            <LineItem
              label={`$${fmt(systemPrice)} invested in S&P`}
              value={`$${fmt(invested)}`}
              color="var(--gold)"
            />
            <LineItem
              label={`${year}yr payments ($${fmt(monthlyPayment)}/mo)`}
              value={`-$${fmt(comfortPayments)}`}
              color="var(--muted)"
            />
            <LineItem label="Repairs covered" value="✓ Included" color="var(--green)" />
            <LineItem label="Tune-ups covered" value="✓ Included" color="var(--green)" />

            <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(240,235,224,0.08)" }}>
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  Net position
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair), serif",
                    color: comfortNet >= 0 ? "var(--green)" : "var(--red)",
                  }}
                >
                  {comfortNet >= 0 ? "+" : "-"}${fmt(Math.abs(comfortNet))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* S&P rate slider */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: "rgba(240,235,224,0.04)", border: "1px solid rgba(240,235,224,0.08)" }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">S&amp;P 500 expected return</span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--gold)" }}
          >
            {spRate}%
          </span>
        </div>
        <input
          type="range"
          min={4}
          max={14}
          step={0.5}
          value={spRate}
          onChange={(e) => setSpRate(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: "var(--gold)" }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--muted)" }}>
          <span>4% (conservative)</span>
          <span>14% (aggressive)</span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <button
          onClick={onSelectPlan}
          className="w-full md:w-auto px-10 py-4 font-bold text-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            borderRadius: "50px",
            background: "var(--gold)",
            color: "#0c0b08",
            fontFamily: "var(--font-playfair), serif",
          }}
        >
          I want this — show me the plan →
        </button>
        <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
          No commitment. We&apos;ll walk you through every detail.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="p-3 flex flex-col gap-1"
      style={{
        borderRadius: "14px",
        background: "rgba(240,235,224,0.04)",
        border: "1px solid rgba(240,235,224,0.08)",
      }}
    >
      <span className="text-xs" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span
        className="text-base font-bold leading-tight"
        style={{ fontFamily: "var(--font-playfair), serif", color }}
      >
        {value}
      </span>
    </div>
  );
}

function LineItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
