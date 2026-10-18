import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { discover, type SortKey } from "@/lib/tmdb/api";
import { genresFor } from "@/lib/tmdb/genres";
import type { MediaType } from "@/lib/tmdb/types";
import { MediaGrid, MediaGridSkeleton } from "./media-card";
import { AdvancedFilters, type RuntimeKey } from "./advanced-filters";

export type SearchParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "top", label: "Top rated" },
  { key: "newest", label: "Newest" },
];

export interface BrowseState {
  type: MediaType;
  sort: SortKey;
  genre?: number;
  page: number;
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  runtime?: RuntimeKey;
  language?: string;
}

function int(v: string | string[] | undefined, min: number, max: number): number | undefined {
  const n = Number.parseInt(one(v) ?? "", 10);
  return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
}

/** Runtime buckets in minutes; TV uses per-episode length. */
const RUNTIMES: Record<MediaType, Record<RuntimeKey, [number?, number?]>> = {
  movie: { short: [undefined, 89], medium: [90, 150], long: [151, undefined] },
  tv: { short: [undefined, 29], medium: [30, 60], long: [61, undefined] },
};

export function parseBrowse(sp: SearchParams, defaultType: MediaType): BrowseState {
  const sortRaw = one(sp.sort);
  const sort: SortKey = sortRaw === "top" || sortRaw === "newest" ? sortRaw : "popular";
  const genre = Number.parseInt(one(sp.genre) ?? "", 10);
  const page = Math.min(500, Math.max(1, Number.parseInt(one(sp.page) ?? "1", 10) || 1));
  const typeRaw = one(sp.type);
  const type: MediaType = typeRaw === "movie" || typeRaw === "tv" ? typeRaw : defaultType;
  const runtimeRaw = one(sp.runtime);
  const languageRaw = one(sp.lang);
  return {
    type,
    sort,
    genre: Number.isFinite(genre) ? genre : undefined,
    page,
    yearFrom: int(sp.from, 1900, 2100),
    yearTo: int(sp.to, 1900, 2100),
    minRating: int(sp.rating, 1, 9),
    runtime: runtimeRaw === "short" || runtimeRaw === "medium" || runtimeRaw === "long" ? runtimeRaw : undefined,
    language: languageRaw && /^[a-z]{2}$/.test(languageRaw) ? languageRaw : undefined,
  };
}

function buildHref(base: string, state: BrowseState, patch: Partial<BrowseState>, includeType: boolean) {
  const next = { ...state, ...patch };
  const qs = new URLSearchParams();
  if (includeType) qs.set("type", next.type);
  if (next.sort !== "popular") qs.set("sort", next.sort);
  if (next.genre) qs.set("genre", String(next.genre));
  if (next.yearFrom) qs.set("from", String(next.yearFrom));
  if (next.yearTo) qs.set("to", String(next.yearTo));
  if (next.minRating) qs.set("rating", String(next.minRating));
  if (next.runtime) qs.set("runtime", next.runtime);
  if (next.language) qs.set("lang", next.language);
  if (next.page > 1) qs.set("page", String(next.page));
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${
        active ? "bg-foreground text-background" : "border border-border text-foreground/75 hover:border-white/30 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

export function BrowseHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6">
        <h1 className="font-display text-5xl tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-2 text-foreground/70">{subtitle}</p>
      </div>
    </header>
  );
}

export async function BrowseResults({
  base,
  state,
  anime = false,
  showTypeToggle = false,
}: {
  base: string;
  state: BrowseState;
  anime?: boolean;
  showTypeToggle?: boolean;
}) {
  const [minRuntime, maxRuntime] = state.runtime ? RUNTIMES[state.type][state.runtime] : [];
  const data = await discover({
    type: state.type,
    sort: state.sort,
    genre: state.genre,
    page: state.page,
    anime,
    yearFrom: state.yearFrom,
    yearTo: state.yearTo,
    minRating: state.minRating,
    minRuntime,
    maxRuntime,
    language: anime ? undefined : state.language,
  });
  const genres = genresFor(state.type).filter((g) => !(anime && g.id === 16));

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {showTypeToggle && (
            <div className="mr-2 flex rounded-full border border-border p-1">
              {(["tv", "movie"] as const).map((t) => (
                <Link
                  key={t}
                  href={buildHref(base, state, { type: t, genre: undefined, page: 1 }, true)}
                  scroll={false}
                  className={`rounded-full px-3.5 py-1 text-sm ${state.type === t ? "bg-accent font-medium text-background" : "text-foreground/70"}`}
                >
                  {t === "tv" ? "Series" : "Films"}
                </Link>
              ))}
            </div>
          )}
          {SORTS.map((s) => (
            <Chip key={s.key} href={buildHref(base, state, { sort: s.key, page: 1 }, showTypeToggle)} active={state.sort === s.key}>
              {s.label}
            </Chip>
          ))}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip href={buildHref(base, state, { genre: undefined, page: 1 }, showTypeToggle)} active={!state.genre}>
            All genres
          </Chip>
          {genres.map((g) => (
            <Chip key={g.id} href={buildHref(base, state, { genre: g.id, page: 1 }, showTypeToggle)} active={state.genre === g.id}>
              {g.name}
            </Chip>
          ))}
        </div>
        <AdvancedFilters
          type={state.type}
          showLanguage={!anime}
          values={{
            from: state.yearFrom,
            to: state.yearTo,
            rating: state.minRating,
            runtime: state.runtime,
            lang: state.language,
          }}
          totalResults={data.totalResults}
        />
      </div>

      {data.results.length === 0 ? (
        <p className="py-20 text-center text-muted">Nothing found for these filters.</p>
      ) : (
        <MediaGrid items={data.results} />
      )}

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        hrefFor={(p) => buildHref(base, state, { page: p }, showTypeToggle)}
      />
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const btn = "inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm transition hover:border-white/30";
  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={btn}>
          <ChevronLeft className="size-4" /> Previous
        </Link>
      ) : (
        <span className={`${btn} pointer-events-none opacity-40`}>
          <ChevronLeft className="size-4" /> Previous
        </span>
      )}
      <span className="text-sm text-muted tabular-nums">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={btn}>
          Next <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={`${btn} pointer-events-none opacity-40`}>
          Next <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

export function BrowseSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-8 w-24 rounded-full" />
        ))}
      </div>
      <MediaGridSkeleton />
    </div>
  );
}
