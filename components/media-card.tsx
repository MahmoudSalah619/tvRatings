import Link from "next/link";
import type { MediaSummary } from "@/lib/tmdb/types";
import { hrefFor, typeLabel, yearOf } from "@/lib/format";
import { Poster } from "./poster";
import { RatingPill } from "./rating-pill";

export function MediaCard({ item, priority = false }: { item: MediaSummary; priority?: boolean }) {
  return (
    <Link href={hrefFor(item)} className="group block focus-visible:outline-none">
      <div className="relative transition duration-300 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-accent rounded-xl">
        <Poster
          id={item.id}
          title={item.title}
          path={item.posterPath}
          priority={priority}
          className="shadow-lg shadow-black/40 ring-1 ring-white/5 transition group-hover:ring-white/20"
        />
        <RatingPill score={item.voteAverage} className="absolute top-2 left-2" />
      </div>
      <div className="mt-2.5 px-0.5">
        <h3 className="truncate text-sm font-medium group-hover:text-accent">{item.title}</h3>
        <p className="mt-0.5 text-xs text-muted">
          {yearOf(item.date)} · {typeLabel(item)}
        </p>
      </div>
    </Link>
  );
}

export function MediaCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[2/3] rounded-xl" />
      <div className="skeleton mt-2.5 h-3.5 w-3/4 rounded" />
      <div className="skeleton mt-1.5 h-3 w-1/3 rounded" />
    </div>
  );
}

export function MediaGrid({ items }: { items: MediaSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {items.map((item, i) => (
        <MediaCard key={`${item.mediaType}-${item.id}`} item={item} priority={i < 6} />
      ))}
    </div>
  );
}

export function MediaGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {Array.from({ length: count }, (_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}
