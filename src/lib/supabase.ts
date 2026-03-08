import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DuctlessSystem {
  id: string;
  name: string;
  customer_price: number;
  display_order: number;
  enabled: boolean;
}

export async function fetchDuctlessSystem(): Promise<DuctlessSystem | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const { data, error } = await supabase
    .from("ductless_systems")
    .select("id, name, customer_price, display_order, enabled")
    .eq("enabled", true)
    .order("display_order")
    .limit(1)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return null;
  }
  return data as DuctlessSystem;
}
