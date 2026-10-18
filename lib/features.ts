/**
 * Authentication is fully wired up (Supabase) but hidden from the UI for now.
 * Set NEXT_PUBLIC_AUTH_UI=true to show the sign-in link and user rating/review UI.
 * The /login, /signup and /account routes work regardless, they just aren't linked.
 */
export const AUTH_UI_ENABLED = process.env.NEXT_PUBLIC_AUTH_UI === "true";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}
