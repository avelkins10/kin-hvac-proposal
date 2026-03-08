"use client";

import { useState } from "react";

interface MiniSplitConfigProps {
  stories: string;
  sqft: string;
  unitPrice: number;
  unitName: string;
  onComplete: (units: number, totalCost: number) => void;
}

const ZONES = ["Living Room", "Master Bedroom", "Bedroom 2", "Bedroom 3", "Office", "Dining Room", "Kitchen", "Basement"];

export default function MiniSplitConfig({
  stories,
  sqft,
  unitPrice,
  unitName,
  onComplete,
}: MiniSplitConfigProps) {
  const sqftNum = parseInt(sqft?.replace(/[^0-9]/g, "") || "1500");
  const storiesNum = stories === "3+" ? 3 : parseInt(stories || "1");
  const recommendedUnits = Math.max(storiesNum, Math.ceil(sqftNum / 1000));

  const [selectedZones, setSelectedZones] = useState<string[]>(
    ZONES.slice(0, recommendedUnits)
  );

  function toggleZone(zone: string) {
    setSelectedZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  }

  const units = selectedZones.length || 1;
  const totalCost = unitPrice * units;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2
          className="text-2xl md:text-3xl font-semibold leading-snug mb-2"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Configure your ductless system
        </h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          We recommend {recommendedUnits} unit{recommendedUnits !== 1 ? "s" : ""} for your home.
          Select the zones you want to cool &amp; heat.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ZONES.map((zone) => {
          const isSelected = selectedZones.includes(zone);
          return (
            <button
              key={zone}
              onClick={() => toggleZone(zone)}
              className="px-4 py-3 text-left text-sm transition-all duration-200 hover:opacity-90"
              style={{
                borderRadius: "14px",
                border: isSelected
                  ? "1.5px solid var(--gold)"
                  : "1.5px solid rgba(240,235,224,0.12)",
                background: isSelected
                  ? "rgba(201,168,76,0.12)"
                  : "rgba(240,235,224,0.04)",
                color: isSelected ? "var(--gold)" : "var(--text)",
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              {zone}
            </button>
          );
        })}
      </div>

      <div
        className="p-4 rounded-2xl"
        style={{ background: "rgba(240,235,224,0.06)" }}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            {units} × {unitName}
          </span>
          <span
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--gold)" }}
          >
            ${totalCost.toLocaleString()}
          </span>
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          ${unitPrice.toLocaleString()} per unit · {units} unit{units !== 1 ? "s" : ""}
        </p>
      </div>

      <button
        onClick={() => onComplete(units, totalCost)}
        disabled={selectedZones.length === 0}
        className="w-full py-4 font-semibold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
        style={{
          borderRadius: "50px",
          background: "var(--gold)",
          color: "#0c0b08",
        }}
      >
        This looks right →
      </button>
    </div>
  );
}
