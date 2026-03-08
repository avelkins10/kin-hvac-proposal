import type { QuizStepDef } from "@/types";

export const quizSteps: QuizStepDef[] = [
  {
    id: "sqft",
    question: "How large is your home?",
    subtext:
      "Sizing a system wrong \u2014 too small or too large \u2014 is the most expensive HVAC mistake. This gets it right.",
    options: [
      "Under 1,000 sq ft",
      "1,000\u20131,500 sq ft",
      "1,500\u20132,000 sq ft",
      "2,000\u20132,500 sq ft",
      "2,500\u20133,000 sq ft",
      "3,000+ sq ft",
    ],
  },
  {
    id: "ductwork",
    question: "Does your home have ductwork?",
    subtext:
      "Central systems use ducts. No ducts? We install ductless mini-splits \u2014 often more efficient for Florida homes.",
    options: ["Yes", "No", "Not sure"],
  },
  {
    id: "stories",
    question: "How many stories is your home?",
    options: ["1", "2", "3+"],
  },
  {
    id: "miniSplitConfig",
    question: "Let\u2019s configure your ductless system",
  },
  {
    id: "systemAge",
    question: "How old is your current system?",
    subtext:
      "Systems older than 10 years typically run at 40\u201350% less efficiency than today\u2019s equipment. That gap shows up on your electric bill every month.",
    options: [
      "0\u20135 years",
      "6\u201310 years",
      "11\u201315 years",
      "16\u201320 years",
      "20+ years",
      "Don\u2019t know",
    ],
  },
  {
    id: "painPoint",
    question: "What\u2019s the biggest problem with your current system?",
    subtext: "This helps your coordinator know what to address first.",
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
    subtext:
      "We\u2019ll make sure your system recommendation matches your priorities.",
    options: ["Maximum comfort", "Energy savings", "Budget friendly"],
  },
  {
    id: "timeline",
    question: "When do you want your new system installed?",
    subtext:
      "We have installation openings this week. Selecting ASAP moves you to the priority queue.",
    options: ["ASAP", "Within a few weeks", "Just planning ahead"],
  },
];

export function getFilteredSteps(answers: {
  ductwork?: string;
}): QuizStepDef[] {
  if (answers.ductwork === "No") {
    return quizSteps;
  }
  return quizSteps.filter(
    (s) => s.id !== "stories" && s.id !== "miniSplitConfig"
  );
}

// Legacy alias
export const getActiveSteps = (ductwork?: string) =>
  getFilteredSteps({ ductwork });

export function sqftToNumber(sqft: string): number {
  const map: Record<string, number> = {
    "Under 1,000 sq ft": 800,
    "1,000\u20131,500 sq ft": 1250,
    "1,500\u20132,000 sq ft": 1750,
    "2,000\u20132,500 sq ft": 2250,
    "2,500\u20133,000 sq ft": 2750,
    "3,000+ sq ft": 3500,
  };
  return map[sqft] ?? 1750;
}

export function unitsForHome(sqft: string, stories: string): number {
  const storiesNum = stories === "3+" ? 3 : stories === "2" ? 2 : 1;
  return Math.max(storiesNum, Math.ceil(sqftToNumber(sqft) / 1000));
}
