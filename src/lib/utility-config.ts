import type { UtilityConfig } from "@/types";

export const utilityConfig: Record<string, UtilityConfig> = {
  FPL: {
    name: "Florida Power & Light",
    state: "FL",
    rateNote: "FPL rates have increased 30%+ since 2020",
    headline: "FPL customers are seeing record-high bills",
  },
  duke: {
    name: "Duke Energy",
    state: "FL",
    rateNote: "Duke Energy rates continue to climb year over year",
    headline: "Duke Energy customers deserve a smarter solution",
  },
  teco: {
    name: "Tampa Electric",
    state: "FL",
    rateNote: "TECO customers are seeing record-high bills",
    headline: "Tampa Electric bills keep climbing — there's a better way",
  },
  jea: {
    name: "JEA",
    state: "FL",
  },
  "gulf power": {
    name: "Gulf Power",
    state: "FL",
  },
  ouc: {
    name: "OUC",
    state: "FL",
  },
};

export function getUtilityConfig(utility?: string): UtilityConfig | null {
  if (!utility) return null;
  return utilityConfig[utility.toLowerCase()] ?? utilityConfig[utility] ?? null;
}
