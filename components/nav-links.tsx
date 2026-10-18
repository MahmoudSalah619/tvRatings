"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                active ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
