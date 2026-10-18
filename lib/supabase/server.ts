import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, SUPABASE_KEY, SUPABASE_URL } from "@/lib/features";

/**
 * Per-request Supabase client for Server Components, Server Actions and Route
 * Handlers. Returns null while Supabase env vars are not configured.
 */
export async function createClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. The proxy refreshes sessions.
        }
      },
    },
  });
}

export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
