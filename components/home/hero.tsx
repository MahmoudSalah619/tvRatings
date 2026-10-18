"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, Info } from "lucide-react";
import type { MediaSummary } from "@/lib/tmdb/types";
import { hrefFor, typeLabel, yearOf } from "@/lib/format";
import { genreName } from "@/lib/tmdb/genres";
import { Backdrop, Poster } from "../poster";
import { RatingPill } from "../rating-pill";

const INTERVAL = 7000;

export function Hero({ items }: { items: MediaSummary[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % items.length), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, items.length]);

  const current = items[index];
  if (!current) return null;

  return (
    <section
      className="relative isolate -mt-16 flex min-h-[640px] items-end overflow-hidden pt-16 sm:min-h-[720px] lg:h-[88vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop layer, re-keyed so each slide gets a fresh Ken Burns zoom */}
      <div key={`${current.mediaType}-${current.id}`} className="absolute inset-0 -z-10 animate-ken-burns">
        <Backdrop id={current.id} title={current.title} path={current.backdropPath} priority />
      </div>
      {/* Scrims only where text sits (left + bottom) so the artwork stays visible */}
      <div className="absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-background/70 to-transparent" />
      <div className="absolute inset-y-0 left-0 -z-10 w-full bg-gradient-to-r from-background/85 via-background/25 to-transparent sm:w-3/4" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[55%] bg-gradient-to-t from-background via-background/50 to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20">
        <div key={`copy-${current.mediaType}-${current.id}`} className="max-w-2xl">
          <p className="animate-fade-up text-xs font-medium tracking-[0.25em] text-accent uppercase">
            #{index + 1} Trending this week
          </p>
          <h1 className="mt-3 animate-fade-up font-display text-5xl leading-[0.95] tracking-tight text-balance [animation-delay:80ms] sm:text-7xl lg:text-8xl">
            {current.title}
          </h1>
          <div className="mt-5 flex animate-fade-up flex-wrap items-center gap-2 text-sm text-foreground/80 [animation-delay:160ms]">
            <RatingPill score={current.voteAverage} className="!text-sm" />
            <span>{yearOf(current.date)}</span>
            <span className="text-muted">•</span>
            <span>{typeLabel(current)}</span>
            {current.genreIds.slice(0, 2).map((g) => (
              <span key={g} className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs">
                {genreName(g)}
              </span>
            ))}
          </div>
          <p className="mt-5 line-clamp-3 max-w-xl animate-fade-up text-base text-foreground/75 [animation-delay:240ms] sm:text-lg">
            {current.overview}
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:320ms]">
            <Link
              href={hrefFor(current)}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:scale-[1.03] hover:bg-white"
            >
              <Play className="size-4" fill="currentColor" />
              {current.mediaType === "tv" ? "See episode ratings" : "See ratings & reviews"}
            </Link>
            <Link
              href={hrefFor(current)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium backdrop-blur transition hover:bg-white/10"
            >
              <Info className="size-4" />
              More info
            </Link>
          </div>
        </div>

        {/* Slide picker */}
        <div className="mt-12 flex items-end justify-between gap-6">
          <div className="flex gap-1.5">
            {items.map((item, i) => (
              <button
                key={`${item.mediaType}-${item.id}`}
                type="button"
                aria-label={`Show ${item.title}`}
                onClick={() => setIndex(i)}
                className="relative h-1 w-8 overflow-hidden rounded-full bg-white/20 sm:w-12"
              >
                {i === index && (
                  <span
                    key={`${index}-${paused}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                    style={{
                      animation: paused ? "none" : `hero-progress ${INTERVAL}ms linear forwards`,
                      width: paused ? "100%" : undefined,
                    }}
                  />
                )}
                {i < index && <span className="absolute inset-0 bg-white/60" />}
              </button>
            ))}
          </div>
          <div className="hidden gap-3 lg:flex">
            {items.map((item, i) => (
              <button
                key={`${item.mediaType}-${item.id}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${item.title}`}
                className={`w-16 transition duration-300 ${
                  i === index ? "-translate-y-2 opacity-100 ring-2 ring-accent" : "opacity-50 hover:opacity-90"
                } rounded-lg`}
              >
                <Poster id={item.id} title="" path={item.posterPath} size="w185" className="rounded-lg" sizes="64px" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes hero-progress { from { width: 0 } to { width: 100% } }`}</style>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative -mt-16 flex min-h-[640px] items-end pt-16 sm:min-h-[720px] lg:h-[88vh]">
      <div className="mx-auto w-full max-w-7xl space-y-4 px-4 pb-20 sm:px-6">
        <div className="skeleton h-3 w-40 rounded" />
        <div className="skeleton h-20 w-2/3 rounded-xl" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
    </section>
  );
}
