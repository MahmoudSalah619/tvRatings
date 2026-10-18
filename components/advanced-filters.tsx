"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Calendar, Check, ChevronDown, Clock, Globe, Loader2, Star, X } from "lucide-react";
import type { MediaType } from "@/lib/tmdb/types";
import { tierFor } from "@/lib/rating";

export type RuntimeKey = "short" | "medium" | "long";

type ParamKey = "from" | "to" | "rating" | "runtime" | "lang";

interface Values {
  from?: number;
  to?: number;
  rating?: number;
  runtime?: RuntimeKey;
  lang?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const YEAR_PRESETS: { label: string; from?: number; to?: number }[] = [
  { label: "This year", from: CURRENT_YEAR, to: CURRENT_YEAR },
  { label: "Last 5 years", from: CURRENT_YEAR - 4 },
  { label: "2020s", from: 2020, to: 2029 },
  { label: "2010s", from: 2010, to: 2019 },
  { label: "2000s", from: 2000, to: 2009 },
  { label: "1990s", from: 1990, to: 1999 },
  { label: "1980s", from: 1980, to: 1989 },
  { label: "Before 1980", to: 1979 },
];

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
  movie: { short: "Under 90 min", medium: "90 – 150 min", long: "Over 2½ hours" },
  tv: { short: "Under 30 min per episode", medium: "30 – 60 min per episode", long: "Over 60 min per episode" },
};

function yearLabel(from?: number, to?: number) {
  const preset = YEAR_PRESETS.find((p) => p.from === from && p.to === to);
  if (preset) return preset.label;
  if (from && to) return from === to ? String(from) : `${from} – ${to}`;
  if (from) return `${from} or later`;
  if (to) return `${to} or earlier`;
  return null;
}

/** Year, rating, length and language filters as styled dropdowns, synced to the URL. */
export function AdvancedFilters({ type, values, showLanguage }: { type: MediaType; values: Values; showLanguage: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const apply = (patch: Partial<Record<ParamKey, string | number | undefined>>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, String(v));
    }
    params.delete("page");
    startTransition(() => router.push(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false }));
  };

  const active = Object.values(values).some(Boolean);
  const year = yearLabel(values.from, values.to);
  const lang = LANGUAGES.find(([code]) => code === values.lang)?.[1];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dropdown
        icon={<Calendar className="size-4" />}
        label="Release year"
        value={year}
        onClear={() => apply({ from: undefined, to: undefined })}
      >
        {(close) => (
          <YearPanel
            from={values.from}
            to={values.to}
            onApply={(from, to) => {
              apply({ from, to });
              close();
            }}
          />
        )}
      </Dropdown>

      <Dropdown
        icon={<Star className="size-4" />}
        label="Rating"
        value={values.rating ? `${values.rating}+ stars` : null}
        onClear={() => apply({ rating: undefined })}
      >
        {(close) => (
          <OptionList
            options={[
              { value: "", label: "Any rating" },
              ...RATINGS.map((r) => ({
                value: String(r),
                label: `${r}+ stars`,
                hint: tierFor(r).label,
                dot: tierFor(r).color,
              })),
            ]}
            selected={values.rating ? String(values.rating) : ""}
            onSelect={(v) => {
              apply({ rating: v || undefined });
              close();
            }}
          />
        )}
      </Dropdown>

      <Dropdown
        icon={<Clock className="size-4" />}
        label="Length"
        value={values.runtime ? RUNTIME_LABELS[type][values.runtime] : null}
        onClear={() => apply({ runtime: undefined })}
      >
        {(close) => (
          <OptionList
            options={[
              { value: "", label: "Any length" },
              ...(Object.keys(RUNTIME_LABELS[type]) as RuntimeKey[]).map((k) => ({ value: k, label: RUNTIME_LABELS[type][k] })),
            ]}
            selected={values.runtime ?? ""}
            onSelect={(v) => {
              apply({ runtime: v || undefined });
              close();
            }}
          />
        )}
      </Dropdown>

      {showLanguage && (
        <Dropdown icon={<Globe className="size-4" />} label="Language" value={lang ?? null} onClear={() => apply({ lang: undefined })}>
          {(close) => (
            <OptionList
              options={[{ value: "", label: "Any language" }, ...LANGUAGES.map(([value, label]) => ({ value, label }))]}
              selected={values.lang ?? ""}
              onSelect={(v) => {
                apply({ lang: v || undefined });
                close();
              }}
            />
          )}
        </Dropdown>
      )}

      {active && (
        <button
          type="button"
          onClick={() => apply({ from: undefined, to: undefined, rating: undefined, runtime: undefined, lang: undefined })}
          className="px-2 py-1.5 text-sm text-muted underline-offset-4 transition hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      )}

      {pending && <Loader2 className="size-4 animate-spin text-muted" aria-label="Updating results" />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Dropdown({
  icon,
  label,
  value,
  onClear,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  onClear: () => void;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isSet = value !== null;

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex h-9 items-center rounded-full border text-sm transition ${
          isSet
            ? "border-accent/40 bg-accent/10 text-accent"
            : open
              ? "border-white/30 bg-surface-2 text-foreground"
              : "border-border bg-surface text-foreground/80 hover:border-white/25 hover:text-foreground"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={`flex h-full items-center gap-2 pl-3.5 ${isSet ? "pr-1.5" : "pr-3"}`}
        >
          <span className={isSet ? "" : "text-muted"}>{icon}</span>
          <span className="max-w-48 truncate">{value ?? label}</span>
          {!isSet && <ChevronDown className={`size-3.5 text-muted transition ${open ? "rotate-180" : ""}`} />}
        </button>
        {isSet && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label.toLowerCase()} filter`}
            className="mr-1.5 grid size-6 place-items-center rounded-full transition hover:bg-accent/20"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute top-full left-0 z-40 mt-2 min-w-60 animate-fade-up rounded-2xl border border-white/10 bg-surface p-1.5 shadow-2xl shadow-black/70 [animation-duration:0.2s]"
        >
          <p className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-wider text-muted uppercase">{label}</p>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function OptionList({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string; hint?: string; dot?: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ul className="thin-scrollbar max-h-72 overflow-y-auto">
      {options.map((o) => {
        const isSel = o.value === selected;
        return (
          <li key={o.value || "any"}>
            <button
              type="button"
              onClick={() => onSelect(o.value)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/[0.07] ${
                isSel ? "text-foreground" : "text-foreground/80"
              }`}
            >
              {o.dot && <span className="size-2.5 shrink-0 rounded-full" style={{ background: o.dot }} />}
              <span className="flex-1">{o.label}</span>
              {o.hint && <span className="text-xs text-muted">{o.hint}</span>}
              <Check className={`size-4 shrink-0 text-accent ${isSel ? "opacity-100" : "opacity-0"}`} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function YearPanel({
  from,
  to,
  onApply,
}: {
  from?: number;
  to?: number;
  onApply: (from?: number, to?: number) => void;
}) {
  const [customFrom, setCustomFrom] = useState(from ? String(from) : "");
  const [customTo, setCustomTo] = useState(to ? String(to) : "");
  const parse = (v: string) => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) && n >= 1900 && n <= CURRENT_YEAR + 5 ? n : undefined;
  };
  const f = parse(customFrom);
  const t = parse(customTo);
  const invalid = (customFrom && !f) || (customTo && !t) || (f && t && f > t);
  const input =
    "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm tabular-nums placeholder:text-muted focus:border-accent/60 focus:outline-none";

  return (
    <div className="w-64">
      <div className="grid grid-cols-2 gap-1 p-1">
        {YEAR_PRESETS.map((p) => {
          const isSel = p.from === from && p.to === to;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onApply(p.from, p.to)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                isSel ? "bg-accent/15 text-accent" : "text-foreground/80 hover:bg-white/[0.07]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <form
        className="mt-1 space-y-2 border-t border-white/5 p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!invalid) onApply(f, t);
        }}
      >
        <p className="text-xs text-muted">Custom range</p>
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            maxLength={4}
            placeholder="From"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value.replace(/\D/g, ""))}
            aria-label="From year"
            className={input}
          />
          <span className="text-muted">–</span>
          <input
            inputMode="numeric"
            maxLength={4}
            placeholder="To"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value.replace(/\D/g, ""))}
            aria-label="To year"
            className={input}
          />
        </div>
        <button
          type="submit"
          disabled={Boolean(invalid) || (!f && !t)}
          className="h-9 w-full rounded-lg bg-foreground text-sm font-semibold text-background transition hover:bg-white disabled:opacity-40"
        >
          Apply
        </button>
      </form>
    </div>
  );
}
