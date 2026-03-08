"use client";

import { useState } from "react";
import type { FinancingProduct, QuoteParams, QuizAnswers, UtilityConfig } from "@/types";
import FinancialCompare from "./FinancialCompare";
import CallToAction from "./CallToAction";
import EquipmentCallout from "./EquipmentCallout";

interface ProposalResultsProps {
  params: QuoteParams;
  answers: QuizAnswers;
  products: FinancingProduct[];
  utilityInfo: UtilityConfig | null;
  effectivePrice: number;
}

function escalatorLabel(rate: number, monthlyPayment: number): string {
  if (rate === 0) return "Fixed payment \u2014 stays the same every month";
  const yearlyIncrease = Math.round(monthlyPayment * (rate / 100));
  if (yearlyIncrease < 1) return "Increases less than $1/mo per year";
  return `Increases ~$${yearlyIncrease}/mo per year`;
}

export default function ProposalResults({
  params,
  answers,
  products,
  utilityInfo,
  effectivePrice,
}: ProposalResultsProps) {
  const [selectedId, setSelectedId] = useState(
    products.find((p) => p.escalationRate === 0)?.id ?? products[0]?.id ?? ""
  );
  const [showCompare, setShowCompare] = useState(false);

  const selected = products.find((p) => p.id === selectedId) ?? products[0];
  const monthlyPayment = selected?.monthlyPayments[0]?.monthlyPayment ?? 0;
  const termYears = selected?.termYears ?? 25;

  const trackingBase = {
    name: params.name,
    email: params.email,
    phone: params.phone,
    price: effectivePrice,
    utility: params.utility ?? "",
    state: utilityInfo?.state ?? params.state ?? "FL",
    src: params.src,
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    utm_term: params.utm_term,
    utm_content: params.utm_content,
    answers,
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="text-center flex flex-col items-center gap-3">
        <div
          className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{
            color: "var(--gold)",
            background: "rgba(201,168,76,0.12)",
            border: "1px solid rgba(201,168,76,0.2)",
            letterSpacing: "4px",
          }}
        >
          Your Comfort Plan
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {params.name
            ? `${params.name.split(" ")[0]}, here\u2019s your quote.`
            : "Here\u2019s your quote."}
        </h1>
        {utilityInfo && (
          <p className="text-sm max-w-md" style={{ color: "var(--muted)" }}>
            {utilityInfo.headline ??
              `Built for ${utilityInfo.name} customers in ${utilityInfo.state}`}
          </p>
        )}
      </div>

      {/* Product selector */}
      {products.length > 1 && (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: "var(--muted)" }}>
            Choose your plan:
          </p>
          <div className="flex flex-col gap-2">
            {products.map((product) => {
              const isSelected = product.id === selectedId;
              const monthly = product.monthlyPayments[0]?.monthlyPayment ?? 0;
              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedId(product.id)}
                  className="flex items-center justify-between p-4 text-left transition-all duration-200"
                  style={{
                    borderRadius: "14px",
                    border: isSelected
                      ? "1.5px solid var(--gold)"
                      : "1.5px solid rgba(240,235,224,0.12)",
                    background: isSelected
                      ? "rgba(201,168,76,0.08)"
                      : "rgba(240,235,224,0.03)",
                  }}
                >
                  <div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: isSelected ? "var(--gold)" : "var(--text)" }}
                    >
                      {product.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {escalatorLabel(product.escalationRate, monthly)}
                    </div>
                  </div>
                  <div
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "var(--font-playfair), serif",
                      color: isSelected ? "var(--gold)" : "var(--text)",
                    }}
                  >
                    ${monthly}/mo
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main pricing card */}
      {selected && (
        <div
          className="p-6 flex flex-col gap-6"
          style={{
            borderRadius: "18px",
            background: "rgba(240,235,224,0.05)",
            border: "1.5px solid rgba(201,168,76,0.2)",
          }}
        >
          <div className="flex items-baseline gap-1">
            <span
              className="text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair), serif", color: "var(--gold)" }}
            >
              ${monthlyPayment}
            </span>
            <span style={{ color: "var(--muted)" }}>/month</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Feature icon="❄️" text="New system, installed" />
            <Feature icon="🔧" text="All repairs covered" />
            <Feature icon="📋" text="Annual tune-ups" />
            <Feature icon="🛡️" text={`${termYears}-year term`} />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowCompare(!showCompare)}
              className="w-full py-3 text-sm font-medium transition-all duration-200 hover:opacity-90"
              style={{
                borderRadius: "50px",
                border: "1.5px solid rgba(201,168,76,0.4)",
                background: "transparent",
                color: "var(--gold)",
              }}
            >
              {showCompare ? "Hide" : "See"} cash vs. comfort comparison
            </button>
          </div>
        </div>
      )}

      {/* Equipment Callout — Scout's copy */}
      <EquipmentCallout params={params} sqft={answers.sqft} />

      {/* Financial comparison */}
      {showCompare && selected && (
        <div
          className="p-5 md:p-8"
          style={{
            borderRadius: "18px",
            background: "rgba(240,235,224,0.03)",
            border: "1px solid rgba(240,235,224,0.08)",
          }}
        >
          <FinancialCompare
            systemPrice={effectivePrice}
            monthlyPayment={monthlyPayment}
            termYears={termYears}
            utilityInfo={utilityInfo}
            onSelectPlan={() =>
              document.getElementById("cta-section")?.scrollIntoView({ behavior: "smooth" })
            }
          />
        </div>
      )}

      {/* CTA */}
      <div id="cta-section" className="flex flex-col items-center gap-4 py-4">
        <button
          className="w-full md:w-auto px-10 py-4 font-bold text-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            borderRadius: "50px",
            background: "var(--gold)",
            color: "#0c0b08",
            fontFamily: "var(--font-playfair), serif",
          }}
          onClick={async () => {
            await fetch("/api/quote/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...trackingBase, event: "plan_selected" }),
            });
          }}
        >
          Reserve My Installation Date &rarr;
        </button>

        {/* Credit disclaimer — Scout: directly below CTA, 14px min */}
        <p
          className="text-center max-w-md"
          style={{ color: "rgba(240,235,224,0.45)", fontSize: "14px", lineHeight: "1.5" }}
        >
          Soft check only &mdash; no impact to your credit score until you decide to proceed.
          KIN never sees your SSN. Financing handled by LightReach, a licensed lender.
        </p>

        <div className="flex flex-col items-center gap-1 mt-2">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Prefer to talk it through?
          </p>
          <CallToAction trackingPayload={trackingBase} />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{icon}</span>
      <span style={{ color: "var(--text)" }}>{text}</span>
    </div>
  );
}
