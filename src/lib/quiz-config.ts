import type { QuizStepDef } from "@/types";

export const quizSteps: QuizStepDef[] = [
  {
    id: "sqft",
    question: "How large is your home?",
    options: [
      "Under 1,000 sq ft",
      "1,000–1,500 sq ft",
      "1,500–2,000 sq ft",
      "2,000–2,500 sq ft",
      "2,500–3,000 sq ft",
      "3,000+ sq ft",
    ],
  },
  {
    id: "ductwork",
    question: "Does your home have ductwork?",
    options: ["Yes", "No", "Not sure"],
  },
  {
    id: "stories",
    question: "How many stories is your home?",
    options: ["1", "2", "3+"],
  },
  {
    id: "miniSplitConfig",
    question: "Let's configure your ductless system",
  },
  {
    id: "systemAge",
    question: "How old is your current system?",
    options: [
      "0–5 years",
      "6–10 years",
      "11–15 years",
      "16–20 years",
      "20+ years",
      "Don't know",
    ],
  },
  {
    id: "painPoint",
    question: "What's bugging you most about your current system?",
    options: [
      "Not cooling or heating well",
      "High energy bills",
      "Uneven temperatures",
      "Frequent repairs",
      "Strange noises",
    ],
  },
  {
    id: "priority",
    question: "What matters most to you?",
    options: ["Maximum comfort", "Energy savings", "Budget friendly"],
  },
  {
    id: "timeline",
    question: "How soon do you need this?",
    options: ["ASAP", "Within a few weeks", "Just planning ahead"],
  },
];

export function getFilteredSteps(answers: { ductwork?: string }): QuizStepDef[] {
  if (answers.ductwork === "No") {
    return quizSteps;
  }
  return quizSteps.filter((s) => s.id !== "stories" && s.id !== "miniSplitConfig");
}

// Legacy alias
export const getActiveSteps = (ductwork?: string) =>
  getFilteredSteps({ ductwork });

export function sqftToNumber(sqft: string): number {
  const map: Record<string, number> = {
    "Under 1,000 sq ft": 800,
    "1,000–1,500 sq ft": 1250,
    "1,500–2,000 sq ft": 1750,
    "2,000–2,500 sq ft": 2250,
    "2,500–3,000 sq ft": 2750,
    "3,000+ sq ft": 3500,
  };
  return map[sqft] ?? 1750;
}

export function unitsForHome(sqft: string, stories: string): number {
  const storiesNum =
    stories === "3+" ? 3 : stories === "2" ? 2 : 1;
  return Math.max(storiesNum, Math.ceil(sqftToNumber(sqft) / 1000));
}
