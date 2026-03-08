export const repairEvents = [
  { year: 2, label: "Capacitor failure", cost: 480 },
  { year: 4, label: "Refrigerant recharge", cost: 750 },
  { year: 6, label: "Fan motor replacement", cost: 620 },
  { year: 8, label: "Compressor service", cost: 890 },
  { year: 11, label: "Full system replacement", cost: 18500 },
];

export function cashBuyerCost(year: number, systemCost: number): number {
  const repairs = repairEvents.reduce(
    (sum, e) => (e.year <= year ? sum + e.cost : sum),
    0
  );
  const tuneUps = 200 * Math.floor(year);
  return systemCost + repairs + tuneUps;
}

export function compoundGrowth(
  years: number,
  rate: number,
  principal: number
): number {
  return principal * Math.pow(1 + rate / 100, years);
}

export function comfortPlanNet(
  years: number,
  rate: number,
  principal: number,
  monthlyPayment: number
): number {
  return compoundGrowth(years, rate, principal) - 12 * monthlyPayment * years;
}

export function getActiveRepairs(year: number) {
  return repairEvents.filter((e) => e.year <= year);
}
