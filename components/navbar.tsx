import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { AUTH_UI_ENABLED } from "@/lib/features";
import { NAV_ITEMS } from "@/lib/nav";
import { NavLinks } from "./nav-links";
import { Logo } from "./logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Reel Ratings home">
          <Logo />
        </Link>

        <Suspense
          fallback={
            <ul className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="rounded-full px-3 py-1.5 text-sm text-muted">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          }
        >
          <NavLinks />
        </Suspense>

        <form action="/search" className="ml-auto flex w-full max-w-xs items-center">
          <label className="group relative w-full">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted transition group-focus-within:text-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Search titles…"
              className="h-10 w-full rounded-full border border-border bg-surface/80 pr-4 pl-9 text-sm placeholder:text-muted focus:border-accent/60 focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
          </label>
        </form>

        {AUTH_UI_ENABLED && (
          <Link
            href="/login"
            className="hidden shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-white sm:block"
          >
            Sign in
          </Link>
        )}
      </nav>
      {/* Mobile section links */}
      <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
