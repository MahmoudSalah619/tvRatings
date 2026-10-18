import { Suspense } from "react";
import type { Metadata } from "next";
import { signIn } from "@/app/auth/actions";
import { AuthCard, AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="Welcome back" subtitle="Sign in to rate and review titles.">
      <Suspense fallback={<AuthForm mode="login" action={signIn} />}>
        {searchParams.then((sp) => (
          <AuthForm mode="login" action={signIn} next={typeof sp.next === "string" ? sp.next : undefined} />
        ))}
      </Suspense>
    </AuthCard>
  );
}
