"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PersonCredit } from "@/lib/tmdb/types";
import { hrefFor, yearOf } from "@/lib/format";
import { RatingPill } from "../rating-pill";

type Filter = "all" | "movie" | "tv" | "acting" | "crew";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "movie", label: "Movies" },
  { key: "tv", label: "TV" },
  { key: "acting", label: "Acting" },
  { key: "crew", label: "Crew" },
];

/** Full credit list, newest first, with client-side filters. */
export function Filmography({ credits }: { credits: PersonCredit[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const filtered = credits.filter((c) => {
      if (filter === "movie" || filter === "tv") return c.mediaType === filter;
      if (filter === "acting") return c.department === "Acting";
      if (filter === "crew") return c.department !== "Acting";
      return true;
    });
    return [...filtered].sort((a, b) => (b.date ?? "9999").localeCompare(a.date ?? "9999"));
  }, [credits, filter]);

  const counts = useMemo(
    () => ({
      all: credits.length,
      movie: credits.filter((c) => c.mediaType === "movie").length,
      tv: credits.filter((c) => c.mediaType === "tv").length,
      acting: credits.filter((c) => c.department === "Acting").length,
      crew: credits.filter((c) => c.department !== "Acting").length,
    }),
    [credits],
  );

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Filmography</h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.filter((f) => counts[f.key] > 0).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                filter === f.key ? "bg-foreground text-background" : "border border-border text-foreground/75 hover:border-white/30"
              }`}
            >
              {f.label} <span className="opacity-60">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-border bg-surface">
        {rows.map((c) => (
          <li key={`${c.mediaType}-${c.id}`}>
            <Link href={hrefFor(c)} className="group flex items-center gap-4 px-4 py-3 transition hover:bg-white/[0.03]">
              <span className="w-12 shrink-0 text-sm text-muted tabular-nums">{c.date ? yearOf(c.date) : "TBA"}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium group-hover:text-accent">{c.title}</span>
                <span className="block truncate text-xs text-muted">
                  {c.mediaType === "tv" ? "TV" : "Movie"}
                  {c.role && ` · ${c.department === "Acting" ? `as ${c.role}` : c.role}`}
                </span>
              </span>
              <RatingPill score={c.voteAverage} className="shrink-0 !bg-surface-2" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
