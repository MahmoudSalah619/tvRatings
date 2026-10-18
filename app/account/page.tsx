import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <Suspense fallback={<div className="skeleton h-40 rounded-3xl" />}>
        <AccountDetails />
      </Suspense>
    </div>
  );
}

async function AccountDetails() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const username = (user.user_metadata?.username as string | undefined) ?? user.email?.split("@")[0];
  return (
    <div className="rounded-3xl border border-border bg-surface p-8">
      <p className="text-sm text-muted">Signed in as</p>
      <h1 className="mt-1 font-display text-4xl">{username}</h1>
      <p className="mt-1 text-sm text-foreground/70">{user.email}</p>
      <form action={signOut} className="mt-8">
        <button type="submit" className="rounded-full border border-border px-5 py-2 text-sm hover:border-white/30">
          Sign out
        </button>
      </form>
    </div>
  );
}
