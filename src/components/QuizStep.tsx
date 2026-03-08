"use client";

import type { QuizStepDef } from "@/types";

interface QuizStepProps {
  step: QuizStepDef;
  onAnswer: (answer: string) => void;
  selected?: string;
}

export default function QuizStep({ step, onAnswer, selected }: QuizStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2
        className="text-2xl md:text-3xl font-semibold leading-snug"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        {step.question}
      </h2>
      <div className="flex flex-col gap-3">
        {step.options?.map((option) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              onClick={() => onAnswer(option)}
              className="w-full text-left px-5 py-4 transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
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
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
