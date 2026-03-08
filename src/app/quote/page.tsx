import type { Metadata } from "next";
import type { QuoteParams } from "@/types";
import QuoteFlow from "@/components/QuoteFlow";

interface PageProps {
  searchParams: {
    name?: string;
    email?: string;
    phone?: string;
    price?: string;
    utility?: string;
    kw?: string;
    src?: string;
    state?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const name = searchParams.name ? `, ${searchParams.name.split(" ")[0]}` : "";
  return {
    title: `Your Comfort Plan${name} | KIN Home`,
    description: "Your personalized HVAC Comfort Plan is ready. See your pricing and savings.",
  };
}

export default function QuotePage({ searchParams }: PageProps) {
  const params: QuoteParams = {
    name: searchParams.name ?? "",
    email: searchParams.email ?? "",
    phone: searchParams.phone ?? "",
    price: Number(searchParams.price) || 16999,
    utility: searchParams.utility ?? "",
    kw: searchParams.kw,
    src: searchParams.src,
    state: searchParams.state,
    utm_source: searchParams.utm_source,
    utm_medium: searchParams.utm_medium,
    utm_campaign: searchParams.utm_campaign,
    utm_term: searchParams.utm_term,
    utm_content: searchParams.utm_content,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--kin-bg)",
        color: "var(--kin-text)",
        overflowX: "hidden",
      }}
    >
      <QuoteFlow params={params} />
    </main>
  );
}
