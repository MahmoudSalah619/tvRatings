"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
}

const NOT_CONFIGURED: AuthState = {
  error: "Authentication isn't configured yet. Add your Supabase keys to .env.local.",
};

function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  // Only allow same-site relative redirects.
  return value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: error.message };
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { username: String(formData.get("username") ?? "").trim() || null },
    },
  });
  if (error) return { error: error.message };
  if (!data.session) return { message: "Check your email to confirm your account." };
  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}
