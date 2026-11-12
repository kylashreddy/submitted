import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabase = () => Boolean(url && serviceKey);
export const hasSupabaseAuth = () => Boolean(url && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let client: SupabaseClient | null = null;

/** Service-role client. Server only — bypasses RLS, never import from a client component. */
export function serviceClient(): SupabaseClient {
  if (!url || !serviceKey) throw new Error("Supabase is not configured");
  client ??= createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
