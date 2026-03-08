import type { UtilityConfig } from "@/types";

export const utilityConfig: Record<string, UtilityConfig> = {
  fpl: {
    name: "Florida Power & Light",
    state: "FL",
    rateNote:
      "FPL raised rates in January. They\u2019re locked in to raise them again through 2029. A high-efficiency system is the one bill you control.",
    headline: "Built for FPL customers in Florida",
  },
  duke: {
    name: "Duke Energy",
    state: "FL",
    rateNote:
      "Duke Energy is raising commercial rates even as residential bills shift. Lock in lower cooling costs before the next adjustment.",
    headline: "Built for Duke Energy customers in Florida",
  },
  teco: {
    name: "Tampa Electric",
    state: "FL",
    rateNote:
      "Tampa Electric customers have seen an 82% bill increase since 2020. A high-efficiency system is the one bill you control.",
    headline: "Built for Tampa Electric customers in Florida",
  },
  jea: {
    name: "JEA",
    state: "FL",
    rateNote:
      "Utility rates keep rising. A high-efficiency system is the one bill you control.",
  },
  "gulf power": {
    name: "Gulf Power",
    state: "FL",
    rateNote:
      "Utility rates keep rising. A high-efficiency system is the one bill you control.",
  },
  ouc: {
    name: "OUC",
    state: "FL",
    rateNote:
      "Utility rates keep rising. A high-efficiency system is the one bill you control.",
  },
};

// Fallback for unrecognized utilities
const defaultConfig: UtilityConfig = {
  name: "your utility",
  state: "FL",
  rateNote:
    "Utility rates keep rising. A high-efficiency system is the one bill you control. Your quote is already built.",
};

export function getUtilityConfig(utility?: string): UtilityConfig | null {
  if (!utility) return defaultConfig;
  return (
    utilityConfig[utility.toLowerCase()] ??
    utilityConfig[utility] ??
    defaultConfig
  );
}
