import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/pricing
 * Get estimated HVAC pricing from Palmetto/LightReach API.
 * Body: { state: string, totalFinancedAmount: number }
 * Returns: { products: EstimatedPricingProduct[] }
 */

const PALMETTO_AUTH_URL = "https://palmetto.finance/api/auth/login";
const PALMETTO_BASE_URL = "https://palmetto.finance";

async function getAccessToken(): Promise<string> {
  const email = process.env.PALMETTO_FINANCE_ACCOUNT_EMAIL;
  const password = process.env.PALMETTO_FINANCE_ACCOUNT_PASSWORD;

  if (!email || !password) {
    throw new Error("PALMETTO_FINANCE credentials not configured");
  }

  const response = await fetch(PALMETTO_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Auth failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Hardcoded fallback factors from LightReach calculator (validated against kin-hvac-tool)
function getFallbackProducts(amount: number) {
  const plans = [
    { term: 12, escalator: 0, factor: 0.01397, name: "12 Year Comfort Plan (0% escalator)" },
    { term: 10, escalator: 0, factor: 0.01546, name: "10 Year Comfort Plan (0% escalator)" },
    { term: 12, escalator: 0.99, factor: 0.01321, name: "12 Year Comfort Plan (0.99% escalator)" },
    { term: 10, escalator: 0.99, factor: 0.01487, name: "10 Year Comfort Plan (0.99% escalator)" },
    { term: 12, escalator: 1.99, factor: 0.01247, name: "12 Year Comfort Plan (1.99% escalator)" },
    { term: 10, escalator: 1.99, factor: 0.01416, name: "10 Year Comfort Plan (1.99% escalator)" },
  ];

  return plans.map((plan, i) => {
    const monthlyPayments = [];
    let payment = Math.round(amount * plan.factor * 100) / 100;
    let totalPaid = 0;

    for (let year = 1; year <= plan.term; year++) {
      const yearly = payment * 12;
      monthlyPayments.push({
        year,
        monthlyPayment: Math.round(payment * 100) / 100,
        yearlyCost: Math.round(yearly * 100) / 100,
      });
      totalPaid += yearly;
      if (plan.escalator > 0) payment *= (1 + plan.escalator / 100);
    }

    return {
      productId: `fallback_${i + 1}`,
      name: plan.name,
      type: "lease",
      escalationRate: plan.escalator,
      termYears: plan.term,
      monthlyPayments,
      totalAmountPaid: Math.round(totalPaid * 100) / 100,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, totalFinancedAmount } = body;

    if (!state || !totalFinancedAmount) {
      return NextResponse.json(
        { error: "state and totalFinancedAmount required" },
        { status: 400 }
      );
    }

    // Try Palmetto API first
    try {
      const token = await getAccessToken();

      const pricingResponse = await fetch(
        `${PALMETTO_BASE_URL}/api/v2/estimated-pricing/hvac`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            state: state.toUpperCase(),
            totalFinancedAmount,
          }),
        }
      );

      if (pricingResponse.ok) {
        const data = await pricingResponse.json();
        const products = Array.isArray(data) ? data : data.products || data;

        console.log("[Pricing] Palmetto API returned", Array.isArray(products) ? products.length : 0, "products");

        if (Array.isArray(products) && products.length > 0) {
          return NextResponse.json({ products, source: "palmetto" });
        }
      } else {
        const errorText = await pricingResponse.text().catch(() => "");
        console.error("[Pricing] Palmetto API error:", pricingResponse.status, errorText);
      }
    } catch (apiError) {
      console.error("[Pricing] Palmetto API failed, using fallback factors:", apiError);
    }

    // Fallback to hardcoded factors
    const products = getFallbackProducts(totalFinancedAmount);
    return NextResponse.json({ products, source: "fallback" });
  } catch (error) {
    console.error("[Pricing] Error:", error);
    return NextResponse.json(
      { error: "Failed to get pricing" },
      { status: 500 }
    );
  }
}
