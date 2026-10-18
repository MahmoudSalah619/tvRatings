import { Suspense } from "react";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { searchMulti } from "@/lib/tmdb/api";
import { MediaGrid, MediaGridSkeleton } from "@/components/media-card";
import { Pagination, type SearchParams } from "@/components/browse";

export const metadata: Metadata = { title: "Search" };

function one(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-7xl 2xl:max-w-[100rem] px-4 pt-12 sm:px-6">
      <Suspense fallback={<MediaGridSkeleton />}>
        {searchParams.then((sp) => (
          <SearchResults sp={sp} />
        ))}
      </Suspense>
    </div>
  );
}

async function SearchResults({ sp }: { sp: SearchParams }) {
  const q = one(sp.q).trim();
  const page = Math.max(1, Number.parseInt(one(sp.page), 10) || 1);

  return (
    <div className="space-y-8">
      <form action="/search" className="relative max-w-2xl">
        <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          autoFocus={!q}
          placeholder="Search for a movie, TV show or anime"
          className="h-14 w-full rounded-full border border-border bg-surface pr-6 pl-14 text-lg placeholder:text-muted focus:border-accent/60 focus:ring-4 focus:ring-accent/15 focus:outline-none"
        />
      </form>
      {q ? <Results q={q} page={page} /> : <p className="text-muted">Type a title to start searching.</p>}
    </div>
  );
}

async function Results({ q, page }: { q: string; page: number }) {
  const data = await searchMulti(q, page);
  return (
    <>
      <h1 className="font-display text-4xl tracking-tight">
        {data.totalResults.toLocaleString("en-US")} results for <span className="text-accent italic">“{q}”</span>
      </h1>
      {data.results.length > 0 ? (
        <MediaGrid items={data.results} />
      ) : (
        <p className="py-16 text-center text-muted">No titles matched your search.</p>
      )}
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        hrefFor={(p) => `/search?${new URLSearchParams({ q, page: String(p) })}`}
      />
    </>
  );
}
