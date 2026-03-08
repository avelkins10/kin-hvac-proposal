import type { FinancingProduct } from "@/types";

/**
 * LightReach payment factors per $1 of system price.
 * Source: official LightReach calculator, validated against kin-hvac-tool.
 * Calculated from $14,998 system price reference point.
 */
const PAYMENT_FACTORS = {
  "10yr_0%": 0.01546,
  "10yr_0.99%": 0.01487,
  "10yr_1.99%": 0.01416,
  "12yr_0%": 0.01397,
  "12yr_0.99%": 0.01321,
  "12yr_1.99%": 0.01247,
} as const;

type FactorKey = keyof typeof PAYMENT_FACTORS;

function calcMonthly(price: number, key: FactorKey): number {
  return Math.round(price * PAYMENT_FACTORS[key] * 100) / 100;
}

/**
 * Build real financing products using LightReach payment factors.
 * No API call needed — factors are contractual rates from LightReach.
 */
export async function fetchFinancingProducts(
  price: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _state: string
): Promise<FinancingProduct[]> {
  return [
    {
      id: "comfort-12-fixed",
      name: "Comfort Plan — 12 Year Fixed",
      escalationRate: 0,
      termYears: 12,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "12yr_0%"), term: 144 }],
    },
    {
      id: "comfort-10-fixed",
      name: "Comfort Plan — 10 Year Fixed",
      escalationRate: 0,
      termYears: 10,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "10yr_0%"), term: 120 }],
    },
    {
      id: "comfort-12-099",
      name: "Comfort Plan — 12 Year (0.99%/yr)",
      escalationRate: 0.99,
      termYears: 12,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "12yr_0.99%"), term: 144 }],
    },
    {
      id: "comfort-10-099",
      name: "Comfort Plan — 10 Year (0.99%/yr)",
      escalationRate: 0.99,
      termYears: 10,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "10yr_0.99%"), term: 120 }],
    },
    {
      id: "comfort-12-199",
      name: "Comfort Plan — 12 Year (1.99%/yr)",
      escalationRate: 1.99,
      termYears: 12,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "12yr_1.99%"), term: 144 }],
    },
    {
      id: "comfort-10-199",
      name: "Comfort Plan — 10 Year (1.99%/yr)",
      escalationRate: 1.99,
      termYears: 10,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "10yr_1.99%"), term: 120 }],
    },
  ];
}

export function selectDefaultProduct(
  products: FinancingProduct[]
): FinancingProduct | null {
  return (
    products.find((p) => p.escalationRate === 0) ?? products[0] ?? null
  );
}
