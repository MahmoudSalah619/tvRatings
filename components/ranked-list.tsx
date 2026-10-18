import Link from "next/link";
import type { MediaSummary } from "@/lib/tmdb/types";
import { hrefFor, typeLabel, yearOf } from "@/lib/format";
import { formatScore, tierFor } from "@/lib/rating";
import { Poster } from "./poster";

/** IMDb-style numbered list: rank, poster, title, and a tier-colored score. */
export function RankedList({
  items,
  extra,
}: {
  items: MediaSummary[];
  /** Optional per-row note rendered under the title. */
  extra?: (item: MediaSummary, index: number) => React.ReactNode;
}) {
  return (
    <ol className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-border bg-surface">
      {items.map((m, i) => {
        const tier = m.voteAverage ? tierFor(m.voteAverage) : null;
        return (
          <li key={`${m.mediaType}-${m.id}`}>
            <Link href={hrefFor(m)} className="group flex items-center gap-4 p-3 transition hover:bg-white/[0.03] sm:gap-5 sm:p-4">
              <span className="w-8 shrink-0 text-center font-display text-3xl text-muted tabular-nums group-hover:text-accent sm:w-10 sm:text-4xl">
                {i + 1}
              </span>
              <Poster id={m.id} title="" path={m.posterPath} size="w185" sizes="64px" className="w-12 shrink-0 rounded-lg sm:w-16" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium group-hover:text-accent sm:text-lg">{m.title}</h3>
                <p className="mt-0.5 text-xs text-muted sm:text-sm">
                  {yearOf(m.date)} · {typeLabel(m)} · {m.voteCount.toLocaleString("en-US")} votes
                </p>
                {extra ? (
                  <div className="mt-1 text-sm">{extra(m, i)}</div>
                ) : (
                  m.overview && <p className="mt-1 line-clamp-1 hidden text-sm text-foreground/60 sm:block">{m.overview}</p>
                )}
              </div>
              {tier && (
                <span className={`grid h-11 w-14 shrink-0 place-items-center rounded-lg text-lg font-bold tabular-nums ${tier.cell}`} title={tier.label}>
                  {formatScore(m.voteAverage)}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
