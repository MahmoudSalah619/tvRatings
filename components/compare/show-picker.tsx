"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { Suggestion } from "@/app/api/search/route";
import { imageUrl } from "@/lib/tmdb/client";

/** Search box that sets one side (`a` or `b`) of the compare page URL to a TV show. */
export function ShowPicker({ slot, currentTitle }: { slot: "a" | "b"; currentTitle?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = (await res.json()) as { results: Suggestion[] };
        setResults(data.results.filter((r) => r.mediaType === "tv"));
      } catch {}
    }, 200);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const choose = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set(slot, String(id));
    else params.delete(slot);
    setQ("");
    setOpen(false);
    router.push(`/compare?${params}`, { scroll: false });
  };

  return (
    <div ref={ref} className="relative">
      <label className="relative block">
        <span className="sr-only">Pick show {slot.toUpperCase()}</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={currentTitle ? `Replace ${currentTitle}…` : "Search a TV show…"}
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-border bg-surface pr-10 pl-10 text-sm placeholder:text-muted focus:border-accent/60 focus:outline-none"
        />
        {currentTitle && (
          <button
            type="button"
            onClick={() => choose(null)}
            aria-label="Clear selection"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </label>
      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-surface/95 py-1 shadow-2xl backdrop-blur-xl">
          {results.map((r) => {
            const src = imageUrl(r.posterPath, "w92");
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => choose(r.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-white/[0.07]"
                >
                  <span className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-surface-2">
                    {src && <Image src={src} alt="" fill sizes="32px" className="object-cover" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{r.title}</span>
                    <span className="block text-xs text-muted">{r.year ?? "TBA"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
