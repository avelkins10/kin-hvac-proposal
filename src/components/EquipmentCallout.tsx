"use client";

import type { QuoteParams } from "@/types";

interface EquipmentCalloutProps {
  params: QuoteParams;
  sqft?: string;
}

export default function EquipmentCallout({
  params,
  sqft,
}: EquipmentCalloutProps) {
  const brand = params.brand || "High-Efficiency";
  const model = params.model || "Central Air Conditioner + Air Handler";
  const seer = params.seer || "18";
  const tons = params.tons || null;
  const warranty = params.warranty || "10-Year Parts, 1-Year Labor";

  const sizeDescription = tons
    ? `${tons} Tons`
    : sqft
      ? `Sized for your home based on your answers`
      : "Sized for your home";

  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: "16px",
        background: "rgba(240,235,224,0.04)",
        border: "1px solid rgba(240,235,224,0.08)",
        borderLeft: "3px solid var(--gold)",
      }}
    >
      <div className="p-5 md:p-6 flex flex-col gap-3">
        <div
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--gold)", letterSpacing: "4px" }}
        >
          Your System
        </div>

        <div
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text)" }}
        >
          {brand} {model}
        </div>

        <div className="flex flex-col gap-2">
          <Spec icon="⚡" text={`${seer} SEER2 Efficiency Rating`} />
          <Spec icon="📐" text={sizeDescription} />
          <Spec icon="🛡️" text={warranty} />
          <Spec
            icon="👷"
            text="Installed by KIN's licensed Florida HVAC technicians"
          />
          <Spec icon="📋" text="Permits pulled and handled by KIN" />
          <Spec icon="♻️" text="Haul-away of your old system included" />
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(240,235,224,0.75)" }}>
      <span className="flex-shrink-0 text-base leading-none mt-0.5">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}
