# HVAC Comfort Plan Proposal Tool — Build Spec

## Overview
Port of a v0.dev-generated HVAC proposal tool for KIN Home. Customer receives a personalized URL via email with their name, price, utility info. They go through a short quiz, then see financing options and a financial comparison tool.

## Live Reference
https://v0-kin-hvac-proposal-tool.vercel.app/quote?name=Test+User&email=test@test.com&phone=5551234567&price=16999&utility=FPL&src=test

## Tech Stack
- Next.js 14, TypeScript, Tailwind CSS, App Router
- Supabase (reads `ductless_systems` table)
- LightReach API for financing
- GHL webhook for lead tracking

## Design System
- Background: `#0c0b08`
- Text: `#f0ebe0`
- Gold accent: `#c9a84c`
- Muted text: `rgba(240,235,224,0.45)`
- Red (cash/negative): `#e05555`
- Green (comfort/positive): `#4caf6e`
- Fonts: Playfair Display (headings, numbers), DM Sans (body)
- Border radius: 50px for buttons/pills, 18px for cards, 14px for smaller cards
- All inline styles in the original — convert to Tailwind utilities + CSS custom properties

## URL Parameters (on /quote)
| Param | Type | Use |
|-------|------|-----|
| name | string | Customer name (shown in greeting) |
| email | string | Customer email |
| phone | string | Customer phone |
| price | number | System price (default 16999) |
| utility | string | Utility company (FPL, Duke, TECO, etc.) |
| kw | string | System kW size |
| src | string | Lead source |
| state | string | State override |
| utm_source | string | **NEW - Phase 1** |
| utm_medium | string | **NEW - Phase 1** |
| utm_campaign | string | **NEW - Phase 1** |
| utm_term | string | **NEW - Phase 1** |
| utm_content | string | **NEW - Phase 1** |

## Phase 1 Requirements (implement during port)

### 1. State Persistence
- Store quiz step + answers in sessionStorage keyed by email
- On mount, restore from sessionStorage if available
- Also sync step number to URL hash (#step=3) for back button support
- Clear on quiz completion (when reaching results)

### 2. "Let me talk to a real person" → Click-to-Call
- Wire to `tel:8552640363` (855-264-0363)
- Show phone number text below the button
- Still fire the GHL webhook + tracking event when clicked

### 3. UTM Tracking
- Read utm_source, utm_medium, utm_campaign, utm_term, utm_content from URL
- Store in sessionStorage on first visit
- Include in all tracking/webhook payloads
- Pass through to LightReach/application submission

### 4. Dynamic Utility Content
- Create a utility config map:
```typescript
const utilityConfig: Record<string, {
  name: string;
  state: string;
  rateNote?: string;
  headline?: string;
}> = {
  FPL: { name: "Florida Power & Light", state: "FL", rateNote: "FPL rates have increased 30%+ since 2020" },
  duke: { name: "Duke Energy", state: "FL", rateNote: "Duke Energy rates continue to climb year over year" },
  teco: { name: "Tampa Electric", state: "FL", rateNote: "TECO customers are seeing record-high bills" },
  jea: { name: "JEA", state: "FL" },
  "gulf power": { name: "Gulf Power", state: "FL" },
  ouc: { name: "OUC", state: "FL" },
  // Easy to extend
};
```
- Show utility-specific messaging in the hero when utility param is present
- Display rate increase note on the financial comparison section

## App Structure

### Pages
- `/quote` — Main page (server component wrapper that reads searchParams, renders QuoteFlow client component)

### Components
```
src/
  app/
    quote/
      page.tsx          — Server component, reads searchParams
    api/
      quote/
        track/route.ts  — POST handler for analytics events
    layout.tsx          — Root layout with fonts
    globals.css         — Tailwind + CSS custom properties
  components/
    QuoteFlow.tsx       — Main client component orchestrating the quiz + results
    QuizStep.tsx        — Individual quiz step (options list)
    MiniSplitConfig.tsx — Ductless mini-split configurator step
    ProposalResults.tsx — Results page with financing options
    FinancialCompare.tsx — The interactive cash-vs-comfort comparison tool
    CallToAction.tsx    — "Talk to a real person" button/click-to-call
    ProgressBar.tsx     — Quiz progress indicator
  lib/
    supabase.ts         — Supabase client
    lightreach.ts       — LightReach pricing API
    utm.ts              — UTM param handling
    utility-config.ts   — Utility company config map
    quiz-config.ts      — Quiz steps definition
    financial-math.ts   — All financial calculation functions
  types/
    index.ts            — Shared types
```

## Quiz Steps
Steps are conditional based on answers:
1. **sqft** — "How large is your home?" (Under 1,000 / 1,000–1,500 / 1,500–2,000 / 2,000–2,500 / 2,500–3,000 / 3,000+)
2. **ductwork** — "Does your home have ductwork?" (Yes / No / Not sure)
3. **stories** — "How many stories?" (1 / 2 / 3+) — SKIP if ductwork !== "No"
4. **miniSplitConfig** — Configurator for ductless units — SKIP if ductwork !== "No"
5. **systemAge** — "How old is your current system?" (0–5 / 6–10 / 11–15 / 16–20 / 20+ / Don't know)
6. **painPoint** — "What's bugging you most?" (Not cooling or heating well / High energy bills / Uneven temperatures / Frequent repairs / Strange noises)
7. **priority** — "What matters most?" (Maximum comfort / Energy savings / Budget friendly)
8. **timeline** — "How soon do you need this?" (ASAP / Within a few weeks / Just planning ahead)

If ductwork answer is NOT "No", skip steps 3 and 4.

## Financial Math (from source)
```typescript
// Repair events for cash buyer
const repairEvents = [
  { year: 2, label: "Capacitor failure", cost: 480 },
  { year: 4, label: "Refrigerant recharge", cost: 750 },
  { year: 6, label: "Fan motor replacement", cost: 620 },
  { year: 8, label: "Compressor service", cost: 890 },
  { year: 11, label: "Full system replacement", cost: 18500 },
];

// Cash buyer total cost at year Y
function cashBuyerCost(year, systemCost) {
  return systemCost + repairEvents.reduce((sum, e) => e.year <= year ? sum + e.cost : sum, 0) + 200 * Math.floor(year);
}

// S&P compound growth
function compoundGrowth(years, rate, principal) {
  return principal * Math.pow(1 + rate / 100, years);
}

// Comfort Plan net position (investment value - payments)
function comfortPlanNet(years, rate, principal, monthlyPayment) {
  return compoundGrowth(years, rate, principal) - 12 * monthlyPayment * years;
}
```

## Financial Comparison Tool
- Interactive year scrubber (0 to termYears, default 25)
- Desktop: vertical drag handle on left side
- Mobile: horizontal range slider (sticky at top)
- Side-by-side comparison cards:
  - **Cash Purchase** (red): Shows system cost, repair events, tune-up costs, total spent
  - **Comfort Plan** (green): Shows S&P 500 investment growth, monthly payments, covered repairs, net position
- S&P 500 return rate slider (4% to 14%, default 10.5%)
- Summary stats row at top
- Delta bar showing which option is ahead
- Confetti animation when reaching the final year
- "I want this — show me the plan" CTA at end

## Tracking / Webhooks
On page load, POST to `/api/quote/track`:
```json
{
  "name": "...", "email": "...", "phone": "...",
  "price": 16999, "utility": "FPL", "state": "FL",
  "src": "test", "event": "proposal_viewed",
  "utm_source": "...", "utm_medium": "...", "utm_campaign": "..."
}
```

On "talk to real person" click, POST to both:
- `/api/quote/track` with `event: "human_requested"` + quiz answers
- GHL webhook: `https://services.leadconnectorhq.com/hooks/D3VIcqBWYMsTDRW3Efk5/webhook-trigger/8da45d3b-9143-4a43-9169-1fa46119fd96`

## Supabase
- Reads from `ductless_systems` table (enabled=true, ordered by display_order, limit 1)
- Fields used: `customer_price`, `name`
- For mini-split configurator: units needed = max(stories, ceil(sqft / 1000))
- Total ductless cost = customer_price × units

## LightReach Pricing
- Called after quiz completion with (effectivePrice, state)
- Returns products array with payment options
- Select product with escalationRate === 0 as default
- Display monthlyPayments[0].monthlyPayment as the monthly cost

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
LIGHTREACH_API_KEY=
LIGHTREACH_ORG_ALIAS=
```

## Deployment
- Vercel under Austin's account (avelkins10)
- Repo: create as `avelkins10/kin-hvac-proposal`
- Keep old v0.dev URL running — no downtime during swap
