import { createClient } from "@supabase/supabase-js";

export interface DuctlessSystem {
  id: string;
  name: string;
  customer_price: number;
  display_order: number;
  enabled: boolean;
}

export async function fetchDuctlessSystem(): Promise<DuctlessSystem | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("ductless_systems")
      .select("id, name, customer_price, display_order, enabled")
      .eq("enabled", true)
      .order("display_order")
      .limit(1)
      .single();

    if (error) return null;
    return data as DuctlessSystem;
  } catch {
    return null;
  }
}
