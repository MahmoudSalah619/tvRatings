"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { MediaType } from "@/lib/tmdb/types";

export type RuntimeKey = "short" | "medium" | "long";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => CURRENT_YEAR + 1 - i);

const RATINGS = [9, 8, 7, 6, 5];

const LANGUAGES: [string, string][] = [
  ["en", "English"],
  ["ja", "Japanese"],
  ["ko", "Korean"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
  ["it", "Italian"],
  ["hi", "Hindi"],
  ["zh", "Chinese"],
  ["ar", "Arabic"],
  ["tr", "Turkish"],
  ["pt", "Portuguese"],
];

const RUNTIME_LABELS: Record<MediaType, Record<RuntimeKey, string>> = {
  movie: { short: "Under 90 min", medium: "90–150 min", long: "Over 2.5 h" },
  tv: { short: "Under 30 min / ep", medium: "30–60 min / ep", long: "Over 60 min / ep" },
};

interface Values {
  from?: number;
  to?: number;
  rating?: number;
  runtime?: RuntimeKey;
  lang?: string;
}

/** Year range, minimum rating, runtime and language filters, synced to the URL. */
export function AdvancedFilters({
  type,
  values,
  showLanguage,
  totalResults,
}: {
  type: MediaType;
  values: Values;
  showLanguage: boolean;
  totalResults: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (key: keyof Values, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false }));
  };

  const reset = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const k of ["from", "to", "rating", "runtime", "lang", "page"]) params.delete(k);
    startTransition(() => router.push(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false }));
  };

  const active = Object.values(values).some(Boolean);
  const select =
    "h-9 rounded-full border border-border bg-surface pr-8 pl-3 text-sm text-foreground focus:border-accent/60 focus:outline-none data-[on=true]:border-accent/50 data-[on=true]:text-accent";

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="mr-1 flex items-center gap-1.5 text-sm text-muted">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <SlidersHorizontal className="size-4" />}
        Filters
      </span>

      <select aria-label="From year" value={values.from ?? ""} data-on={!!values.from} onChange={(e) => update("from", e.target.value)} className={select}>
        <option value="">From year</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            From {y}
          </option>
        ))}
      </select>

      <select aria-label="To year" value={values.to ?? ""} data-on={!!values.to} onChange={(e) => update("to", e.target.value)} className={select}>
        <option value="">To year</option>
        {YEARS.filter((y) => !values.from || y >= values.from).map((y) => (
          <option key={y} value={y}>
            To {y}
          </option>
        ))}
      </select>

      <select aria-label="Minimum rating" value={values.rating ?? ""} data-on={!!values.rating} onChange={(e) => update("rating", e.target.value)} className={select}>
        <option value="">Any rating</option>
        {RATINGS.map((r) => (
          <option key={r} value={r}>
            {r}+ stars
          </option>
        ))}
      </select>

      <select aria-label="Runtime" value={values.runtime ?? ""} data-on={!!values.runtime} onChange={(e) => update("runtime", e.target.value)} className={select}>
        <option value="">Any length</option>
        {(Object.keys(RUNTIME_LABELS[type]) as RuntimeKey[]).map((k) => (
          <option key={k} value={k}>
            {RUNTIME_LABELS[type][k]}
          </option>
        ))}
      </select>

      {showLanguage && (
        <select aria-label="Original language" value={values.lang ?? ""} data-on={!!values.lang} onChange={(e) => update("lang", e.target.value)} className={select}>
          <option value="">Any language</option>
          {LANGUAGES.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      )}

      {active && (
        <button type="button" onClick={reset} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted hover:text-foreground">
          <RotateCcw className="size-3.5" /> Reset
        </button>
      )}

      <span className="ml-auto text-sm text-muted tabular-nums">{totalResults.toLocaleString("en-US")} titles</span>
    </div>
  );
}
