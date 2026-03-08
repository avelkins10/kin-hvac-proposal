"use client";

import { useState, useEffect, useRef } from "react";
import type { QuoteParams, QuizAnswers, FinancingProduct, UtilityConfig } from "@/types";
import { getFilteredSteps } from "@/lib/quiz-config";
import { getUtilityConfig } from "@/lib/utility-config";
import { storeUTMParams, mergeUTMParams } from "@/lib/utm";
import { fetchDuctlessSystem } from "@/lib/supabase";
import { fetchFinancingProducts } from "@/lib/lightreach";
import QuizStep from "./QuizStep";
import MiniSplitConfig from "./MiniSplitConfig";
import ProgressBar from "./ProgressBar";
import ProposalResults from "./ProposalResults";
import CallToAction from "./CallToAction";

const STORAGE_KEY_PREFIX = "kin_quiz_";

interface QuoteFlowProps {
  params: QuoteParams;
}

export default function QuoteFlow({ params }: QuoteFlowProps) {
  const [step, setStep] = useState(0); // 0 = landing
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<FinancingProduct[]>([]);
  const [effectivePrice, setEffectivePrice] = useState(params.price);
  const [ductlessUnitPrice, setDuctlessUnitPrice] = useState<number | null>(null);
  const [miniSplitUnits, setMiniSplitUnits] = useState(0);
  const trackedView = useRef(false);

  const utilityInfo: UtilityConfig | null = getUtilityConfig(params.utility);
  const firstName = params.name?.split(" ")[0] || "there";
  const filteredSteps = getFilteredSteps(answers);
  const totalSteps = filteredSteps.length;

  // Storage key scoped to email so different customers don't share state
  const storageKey = `${STORAGE_KEY_PREFIX}${params.email || "anon"}`;

  // Restore state from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const { step: savedStep, answers: savedAnswers } = JSON.parse(stored);
        if (savedStep && savedAnswers) {
          setStep(savedStep);
          setAnswers(savedAnswers);
        }
      }
    } catch {
      // Ignore
    }

    // Store UTM params
    storeUTMParams({
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign,
      utm_term: params.utm_term,
      utm_content: params.utm_content,
    });

    // Load ductless system pricing
    fetchDuctlessSystem().then((system) => {
      if (system) setDuctlessUnitPrice(system.customer_price);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    if (step === 0) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ step, answers }));
    } catch {
      // Ignore
    }
  }, [step, answers, storageKey]);

  // Sync step to URL hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (step === 0) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } else {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}#step=${step}`);
    }
  }, [step]);

  // Track proposal view once
  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;
    const utms = mergeUTMParams({
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign,
    });
    fetch("/api/quote/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.name,
        email: params.email,
        phone: params.phone,
        price: params.price,
        utility: params.utility,
        state: utilityInfo?.state ?? params.state ?? "FL",
        src: params.src,
        event: "proposal_viewed",
        ...utms,
      }),
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(stepKey: string, value: string) {
    const newAnswers = { ...answers, [stepKey]: value };
    // Reset mini-split state if ductwork changes away from "No"
    if (stepKey === "ductwork" && value !== "No") {
      delete newAnswers.miniSplitUnits;
      setMiniSplitUnits(0);
    }
    setAnswers(newAnswers);
    setStep((s) => s + 1);
  }

  function handleMiniSplitConfirm(units: number) {
    setMiniSplitUnits(units);
    setAnswers((a) => ({ ...a, miniSplitUnits: units }));
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  // When we reach the final step, fetch pricing
  useEffect(() => {
    const isDuctless = answers.ductwork === "No";
    const isFinalStep = step === totalSteps + 1;
    if (!isFinalStep || loading || products.length > 0) return;

    setLoading(true);

    let price = params.price;
    if (isDuctless && ductlessUnitPrice && miniSplitUnits > 0) {
      price = ductlessUnitPrice * miniSplitUnits;
    }
    setEffectivePrice(price);

    const state = utilityInfo?.state ?? params.state ?? "FL";
    fetchFinancingProducts(price, state).then((prods) => {
      setProducts(prods);
      setLoading(false);
    });
  }, [step, totalSteps]); // eslint-disable-line react-hooks/exhaustive-deps

  const trackingPayload = {
    name: params.name,
    email: params.email,
    phone: params.phone,
    price: params.price,
    utility: params.utility,
    state: utilityInfo?.state ?? params.state ?? "FL",
    src: params.src,
    ...mergeUTMParams({
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign,
      utm_term: params.utm_term,
      utm_content: params.utm_content,
    }),
  };

  // === LANDING SCREEN ===
  if (step === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4"
        style={{ padding: "clamp(32px, 8vw, 64px) 16px" }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: "var(--kin-gold)", letterSpacing: "6px" }}
        >
          KIN HOME
        </div>
        <h1
          className="font-bold leading-tight mb-5"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(26px, 6vw, 44px)",
            color: "var(--kin-text)",
          }}
        >
          Hi {firstName}, your personalized
          <br />
          <span style={{ color: "var(--kin-gold)" }}>Comfort Plan</span> is ready
        </h1>
        <p
          className="max-w-md mb-10 leading-relaxed"
          style={{
            fontSize: "clamp(15px, 3.5vw, 17px)",
            color: "var(--kin-muted)",
          }}
        >
          {utilityInfo?.rateNote
            ? `${utilityInfo.rateNote}. Answer a few quick questions so we can fine-tune your quote — it only takes about 30 seconds.`
            : "We've put together a custom HVAC solution for your home. Answer a few quick questions so we can fine-tune your quote — it only takes about 30 seconds."}
        </p>

        <button
          onClick={() => setStep(1)}
          className="w-full max-w-xs font-bold text-base transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            padding: "16px 40px",
            background: "var(--kin-gold)",
            color: "#0c0b08",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
          }}
        >
          Let&apos;s get started
        </button>

        <div className="mt-12">
          <CallToAction trackingPayload={trackingPayload} />
        </div>
      </div>
    );
  }

  const quizStepIndex = step - 1; // 1-indexed step → 0-indexed array
  const currentStepDef = filteredSteps[quizStepIndex];

  // === RESULTS SCREEN ===
  if (!currentStepDef || step > totalSteps) {
    if (loading) {
      return (
        <div
          className="flex items-center justify-center min-h-[60vh]"
          style={{ color: "var(--kin-gold)", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Building your plan…
            </div>
            <div style={{ color: "var(--kin-muted)", fontSize: "14px" }}>
              Fetching financing options
            </div>
          </div>
        </div>
      );
    }

    // Clear sessionStorage on completion
    try { sessionStorage.removeItem(storageKey); } catch {}

    return (
      <div className="max-w-2xl mx-auto px-4 pb-16 pt-6">
        <ProposalResults
          params={{ ...params, ...mergeUTMParams({
            utm_source: params.utm_source,
            utm_medium: params.utm_medium,
            utm_campaign: params.utm_campaign,
            utm_term: params.utm_term,
            utm_content: params.utm_content,
          }) }}
          answers={answers}
          products={products}
          utilityInfo={utilityInfo}
          effectivePrice={effectivePrice}
        />
      </div>
    );
  }

  // === QUIZ SCREEN ===
  return (
    <div className="flex flex-col min-h-[80vh]">
      <ProgressBar current={step} total={totalSteps} />

      <div className="flex flex-col items-center min-h-[70vh] px-4 py-6">
        <button
          onClick={handleBack}
          className="self-start text-sm transition-opacity duration-200 hover:opacity-70 mb-4"
          style={{ color: "var(--kin-muted)", background: "none", border: "none", cursor: "pointer" }}
        >
          ← Back
        </button>

        {currentStepDef.id === "miniSplitConfig" ? (
          <MiniSplitConfig
            sqft={answers.sqft ?? ""}
            stories={answers.stories ?? ""}
            unitPrice={ductlessUnitPrice ?? 3200}
            unitName="ductless mini-split unit"
            onComplete={(units) => handleMiniSplitConfirm(units)}
          />
        ) : (
          <QuizStep
            step={currentStepDef}
            onAnswer={(value) => handleAnswer(currentStepDef.id as string, value)}
          />
        )}

        <div className="mt-12">
          <CallToAction trackingPayload={trackingPayload} />
        </div>
      </div>
    </div>
  );
}
