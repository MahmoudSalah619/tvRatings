import type { Metadata } from "next";

// Auth is hidden for now: keep these pages out of search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return children;
}
