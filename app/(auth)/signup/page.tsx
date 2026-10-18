import type { Metadata } from "next";
import { signUp } from "@/app/auth/actions";
import { AuthCard, AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthCard title="Join Reel Ratings" subtitle="Create an account to rate and review movies, shows and anime.">
      <AuthForm mode="signup" action={signUp} />
    </AuthCard>
  );
}
