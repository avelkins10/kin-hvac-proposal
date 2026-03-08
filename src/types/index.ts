export interface QuoteParams {
  name: string;
  email: string;
  phone: string;
  price: number;
  utility: string;
  kw?: string;
  src?: string;
  state?: string;
  city?: string;
  model?: string;
  seer?: string;
  tons?: string;
  brand?: string;
  warranty?: string;
  variant?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface QuizAnswers {
  sqft?: string;
  ductwork?: string;
  stories?: string;
  systemAge?: string;
  painPoint?: string;
  priority?: string;
  timeline?: string;
  miniSplitUnits?: number;
}

export interface QuizStepDef {
  id: keyof QuizAnswers | "miniSplitConfig";
  question: string;
  subtext?: string;
  options?: string[];
}

export interface FinancingProduct {
  id: string;
  name: string;
  escalationRate: number;
  termYears: number;
  monthlyPayments: { monthlyPayment: number; term?: number }[];
}

export interface UtilityConfig {
  name: string;
  state: string;
  rateNote?: string;
  headline?: string;
}

export interface TrackingPayload {
  name: string;
  email: string;
  phone: string;
  price: number;
  utility: string;
  state: string;
  src?: string;
  event: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  answers?: QuizAnswers;
}
