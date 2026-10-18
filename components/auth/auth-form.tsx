"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/auth/actions";

export function AuthForm({
  mode,
  action,
  next,
}: {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const input =
    "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted focus:border-accent/60 focus:ring-4 focus:ring-accent/15 focus:outline-none";

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {mode === "signup" && (
        <label className="block space-y-1.5">
          <span className="text-sm text-foreground/80">Username</span>
          <input name="username" autoComplete="username" className={input} placeholder="cinephile42" />
        </label>
      )}
      <label className="block space-y-1.5">
        <span className="text-sm text-foreground/80">Email</span>
        <input name="email" type="email" required autoComplete="email" className={input} placeholder="you@example.com" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm text-foreground/80">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 8 : undefined}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={input}
        />
      </label>

      {state.error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>}
      {state.message && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-foreground text-sm font-semibold text-background transition hover:bg-white disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-2xl shadow-black/40">
        <h1 className="font-display text-4xl tracking-tight">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
