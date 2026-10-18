import Link from "next/link";
import { Suspense } from "react";
import { AUTH_UI_ENABLED } from "@/lib/features";
import { NAV_ITEMS } from "@/lib/nav";
import { NavLinks } from "./nav-links";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl 2xl:max-w-[100rem] items-center gap-4 px-4 sm:px-6">
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

        <SearchBox />

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
