"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Search, Star, ArrowRight } from "lucide-react";
import type { Suggestion } from "@/app/api/search/route";
import { imageUrl } from "@/lib/tmdb/client";
import { formatScore, tierFor } from "@/lib/rating";

const DEBOUNCE_MS = 200;

function hrefFor(s: Suggestion) {
  return `/${s.mediaType}/${s.id}`;
}

/** Bold the part of the title that matches the query. */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-accent">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

export function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const cache = useRef(new Map<string, Suggestion[]>());

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const q = query.trim();

  // Debounced fetch with cancellation of stale requests.
  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const cached = cache.current.get(q.toLowerCase());
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await res.json()) as { results: Suggestion[] };
        cache.current.set(q.toLowerCase(), data.results);
        setResults(data.results);
        setActive(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  // Close when clicking outside.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Press "/" anywhere to focus search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(el.tagName) && !el.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const finish = () => {
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
  };

  const go = (href: string) => {
    finish();
    setQuery("");
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    } else if (e.key === "Escape") {
      finish();
    } else if (e.key === "Enter" && active >= 0 && results[active]) {
      e.preventDefault();
      go(hrefFor(results[active]));
    }
  };

  const showPanel = open && q.length >= 2;

  return (
    <div ref={rootRef} className="relative ml-auto w-full max-w-xs lg:max-w-sm">
      <form
        action="/search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q) go(`/search?q=${encodeURIComponent(q)}`);
        }}
      >
        <label className="group relative block">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted transition group-focus-within:text-foreground" />
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search titles…"
            autoComplete="off"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            className="h-10 w-full rounded-full border border-border bg-surface/80 pr-9 pl-9 text-sm placeholder:text-muted focus:border-accent/60 focus:ring-2 focus:ring-accent/20 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
            {loading ? (
              <Loader2 className="size-4 animate-spin text-muted" />
            ) : (
              !query && (
                <kbd className="hidden rounded border border-border px-1.5 font-mono text-[10px] text-muted sm:inline">/</kbd>
              )
            )}
          </span>
        </label>
      </form>

      {showPanel && (
        <div className="absolute top-full right-0 z-50 mt-2 w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-surface/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">
              {loading ? "Searching…" : `No titles found for “${q}”`}
            </p>
          ) : (
            <ul id={listId} role="listbox" className="max-h-[70vh] overflow-y-auto py-1.5">
              {results.map((s, i) => {
                const src = imageUrl(s.posterPath, "w92");
                return (
                  <li key={`${s.mediaType}-${s.id}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={hrefFor(s)}
                      onClick={(e) => {
                        e.preventDefault();
                        go(hrefFor(s));
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={`flex items-center gap-3 px-3 py-2 transition ${i === active ? "bg-white/[0.07]" : ""}`}
                    >
                      <span className="relative h-[60px] w-10 shrink-0 overflow-hidden rounded-md bg-surface-2 ring-1 ring-white/10">
                        {src ? (
                          <Image src={src} alt="" fill sizes="40px" className="object-cover" />
                        ) : (
                          <span
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(160deg, hsl(${(s.id * 47) % 360} 60% 35%), hsl(${(s.id * 47 + 200) % 360} 40% 12%))`,
                            }}
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          <Highlight text={s.title} query={q} />
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {s.year ?? "TBA"} · {s.label}
                        </span>
                      </span>
                      {s.voteAverage > 0 && (
                        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums">
                          <Star className="size-3" fill={tierFor(s.voteAverage).color} stroke="none" />
                          {formatScore(s.voteAverage)}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            onClick={() => go(`/search?q=${encodeURIComponent(q)}`)}
            className="flex w-full items-center justify-between border-t border-white/5 px-4 py-3 text-sm text-accent transition hover:bg-white/5"
          >
            <span className="truncate">See all results for “{q}”</span>
            <ArrowRight className="size-4 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}
