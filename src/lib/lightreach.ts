import type { FinancingProduct } from "@/types";

export async function fetchFinancingProducts(
  price: number,
  state: string
): Promise<FinancingProduct[]> {
  const apiKey = process.env.LIGHTREACH_API_KEY;
  const orgAlias = process.env.LIGHTREACH_ORG_ALIAS;

  if (!apiKey || !orgAlias) {
    return getMockProducts(price);
  }

  try {
    const response = await fetch("https://api.lightreach.com/v1/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ orgAlias, systemPrice: price, state }),
    });

    if (!response.ok) {
      return getMockProducts(price);
    }

    const data = await response.json();
    return (data.products as FinancingProduct[]) ?? getMockProducts(price);
  } catch {
    return getMockProducts(price);
  }
}

export function selectDefaultProduct(
  products: FinancingProduct[]
): FinancingProduct | null {
  return (
    products.find((p) => p.escalationRate === 0) ?? products[0] ?? null
  );
}

function getMockProducts(price: number): FinancingProduct[] {
  const monthly25 = Math.round((price * 1.15) / (25 * 12));
  const monthly20 = Math.round((price * 1.12) / (20 * 12));
  return [
    {
      id: "comfort-25",
      name: "Comfort Plan — 25 Year",
      escalationRate: 0,
      termYears: 25,
      monthlyPayments: [{ monthlyPayment: monthly25, term: 300 }],
    },
    {
      id: "comfort-20",
      name: "Comfort Plan — 20 Year",
      escalationRate: 0,
      termYears: 20,
      monthlyPayments: [{ monthlyPayment: monthly20, term: 240 }],
    },
    {
      id: "comfort-escalating-25",
      name: "Comfort Plan — 25 Year (Escalating)",
      escalationRate: 2.9,
      termYears: 25,
      monthlyPayments: [
        { monthlyPayment: Math.round(monthly25 * 0.85), term: 300 },
      ],
    },
  ];
}
