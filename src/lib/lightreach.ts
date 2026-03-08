import type { FinancingProduct } from "@/types";

/**
 * LightReach/Palmetto Finance pricing integration.
 *
 * Primary: calls /api/pricing which authenticates with Palmetto Finance API
 * (palmetto.finance) using PALMETTO_FINANCE_ACCOUNT_EMAIL/PASSWORD and hits
 * POST /api/v2/estimated-pricing/hvac for real product pricing.
 *
 * Fallback: hardcoded payment factors from LightReach calculator (validated
 * against kin-hvac-tool PriceBookContext.tsx LIGHTREACH_PAYMENT_FACTORS).
 */

// Hardcoded factors per $1 — contractual rates from LightReach calculator
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

function getFallbackProducts(price: number): FinancingProduct[] {
  return [
    {
      id: "comfort-12-fixed",
      name: "12 Year Comfort Plan (0% escalator)",
      escalationRate: 0,
      termYears: 12,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "12yr_0%"), term: 144 }],
    },
    {
      id: "comfort-10-fixed",
      name: "10 Year Comfort Plan (0% escalator)",
      escalationRate: 0,
      termYears: 10,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "10yr_0%"), term: 120 }],
    },
    {
      id: "comfort-12-099",
      name: "12 Year Comfort Plan (0.99% escalator)",
      escalationRate: 0.99,
      termYears: 12,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "12yr_0.99%"), term: 144 }],
    },
    {
      id: "comfort-10-099",
      name: "10 Year Comfort Plan (0.99% escalator)",
      escalationRate: 0.99,
      termYears: 10,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "10yr_0.99%"), term: 120 }],
    },
    {
      id: "comfort-12-199",
      name: "12 Year Comfort Plan (1.99% escalator)",
      escalationRate: 1.99,
      termYears: 12,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "12yr_1.99%"), term: 144 }],
    },
    {
      id: "comfort-10-199",
      name: "10 Year Comfort Plan (1.99% escalator)",
      escalationRate: 1.99,
      termYears: 10,
      monthlyPayments: [{ monthlyPayment: calcMonthly(price, "10yr_1.99%"), term: 120 }],
    },
  ];
}

/**
 * Fetch financing products. Tries Palmetto API via /api/pricing first,
 * falls back to hardcoded LightReach payment factors.
 */
export async function fetchFinancingProducts(
  price: number,
  state: string
): Promise<FinancingProduct[]> {
  try {
    const response = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, totalFinancedAmount: price }),
    });

    if (response.ok) {
      const data = await response.json();
      const products = data.products;

      if (Array.isArray(products) && products.length > 0) {
        // Map Palmetto API response to our FinancingProduct format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return products.map((p: any, i: number) => ({
          id: p.productId || `product-${i}`,
          name: p.name || `Plan ${i + 1}`,
          escalationRate: p.escalationRate ?? 0,
          termYears: p.termYears ?? (p.monthlyPayments?.length || 10),
          monthlyPayments: Array.isArray(p.monthlyPayments) && p.monthlyPayments.length > 0
            ? [{ monthlyPayment: p.monthlyPayments[0].monthlyPayment, term: (p.termYears || 10) * 12 }]
            : [{ monthlyPayment: 0, term: 120 }],
        }));
      }
    }
  } catch {
    // API call failed — use fallback
  }

  return getFallbackProducts(price);
}

export function selectDefaultProduct(
  products: FinancingProduct[]
): FinancingProduct | null {
  return (
    products.find((p) => p.escalationRate === 0) ?? products[0] ?? null
  );
}
