import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ImageOff } from "lucide-react";
import { getDetails, getSeason } from "@/lib/tmdb/api";
import { imageUrl } from "@/lib/tmdb/client";
import { average, formatScore, tierFor } from "@/lib/rating";
import { formatDate } from "@/lib/format";
import { getToday } from "@/lib/today";
import { parseId } from "@/components/detail/detail-page";
import { Poster } from "@/components/poster";
import { ScoreRing } from "@/components/rating-pill";

type Props = PageProps<"/tv/[id]/season/[season]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, season } = await params;
  const media = await getDetails("tv", Number.parseInt(id, 10)).catch(() => null);
  if (!media) return { title: "Season not found" };
  return { title: `${media.title} — Season ${season} ratings` };
}

export default function SeasonPage({ params }: Props) {
  return (
    <Suspense fallback={<SeasonSkeleton />}>
      {params.then(({ id, season }) => (
        <SeasonContent id={parseId(id)} seasonNumber={Number.parseInt(season, 10)} />
      ))}
    </Suspense>
  );
}

async function SeasonContent({ id, seasonNumber }: { id: number; seasonNumber: number }) {
  if (!Number.isFinite(seasonNumber) || seasonNumber < 0) notFound();
  const [show, season, today] = await Promise.all([getDetails("tv", id), getSeason(id, seasonNumber), getToday()]);
  if (!show || !season) notFound();

  const rated = season.episodes.filter((e) => e.voteCount > 0 && e.voteAverage > 0);
  const avg = average(rated.map((e) => e.voteAverage));
  const votes = rated.reduce((n, e) => n + e.voteCount, 0);
  const allSeasons = (show.seasons ?? []).filter((s) => s.episodeCount > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <Link href={`/tv/${id}#episodes`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ChevronLeft className="size-4" /> {show.title}
      </Link>

      <header className="mt-6 grid gap-8 md:grid-cols-[200px_1fr]">
        <Poster
          id={id + seasonNumber}
          title={season.name}
          path={season.posterPath ?? show.posterPath}
          size="w342"
          sizes="200px"
          className="mx-auto w-40 shadow-2xl shadow-black/60 ring-1 ring-white/10 md:w-full"
        />
        <div className="self-end">
          <p className="text-sm text-muted">
            {formatDate(season.airDate)} · {season.episodes.length} episodes
          </p>
          <h1 className="mt-1 font-display text-5xl tracking-tight sm:text-6xl">{season.name}</h1>
          <div className="mt-5">
            <ScoreRing score={avg ?? 0} votes={votes} />
          </div>
          {season.overview && <p className="mt-5 max-w-3xl leading-relaxed text-foreground/80">{season.overview}</p>}

          {/* Episode strip: one colored bar per episode */}
          {rated.length > 0 && (
            <div className="mt-6 flex h-10 max-w-xl items-end gap-1">
              {season.episodes.map((e) => {
                const ok = e.voteCount > 0 && e.voteAverage > 0;
                return (
                  <a
                    key={e.episodeNumber}
                    href={`#e${e.episodeNumber}`}
                    title={`E${e.episodeNumber} · ${e.name}${ok ? ` · ${formatScore(e.voteAverage)}` : ""}`}
                    className="flex-1 rounded-sm transition hover:opacity-80"
                    style={{
                      height: ok ? `${Math.max(12, (e.voteAverage - 4) * 16.6)}%` : "12%",
                      background: ok ? tierFor(e.voteAverage).color : "rgb(255 255 255 / 0.12)",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Season switcher */}
      {allSeasons.length > 1 && (
        <nav className="no-scrollbar mt-10 -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Seasons">
          {allSeasons.map((s) => (
            <Link
              key={s.seasonNumber}
              href={`/tv/${id}/season/${s.seasonNumber}`}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition ${
                s.seasonNumber === seasonNumber
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground/75 hover:border-white/30"
              }`}
            >
              {s.seasonNumber === 0 ? "Specials" : `Season ${s.seasonNumber}`}
            </Link>
          ))}
        </nav>
      )}

      <ol className="mt-8 space-y-4">
        {season.episodes.map((e) => {
          const ok = e.voteCount > 0 && e.voteAverage > 0;
          const tier = ok ? tierFor(e.voteAverage) : null;
          const still = imageUrl(e.stillPath, "w300");
          return (
            <li
              key={e.episodeNumber}
              id={`e${e.episodeNumber}`}
              className="grid scroll-mt-24 gap-4 rounded-2xl border border-border bg-surface p-3 target:border-accent/60 target:ring-2 target:ring-accent/20 sm:grid-cols-[240px_1fr_auto] sm:p-4"
            >
              <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-2">
                {still ? (
                  <Image src={still} alt="" fill sizes="240px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-muted">
                    <ImageOff className="size-6" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">
                  E{e.episodeNumber} · {formatDate(e.airDate)}
                  {ok && ` · ${e.voteCount.toLocaleString("en-US")} votes`}
                </p>
                <h2 className="mt-1 text-lg font-medium">{e.name}</h2>
                {e.overview && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-foreground/70">{e.overview}</p>}
              </div>
              <div className="flex items-start sm:justify-end">
                {tier ? (
                  <span className={`grid h-12 w-16 place-items-center rounded-lg text-xl font-bold tabular-nums ${tier.cell}`} title={tier.label}>
                    {formatScore(e.voteAverage)}
                  </span>
                ) : (
                  <span className="grid h-12 w-16 place-items-center rounded-lg border border-dashed border-white/15 text-xs text-muted">
                    {!e.airDate || e.airDate > today ? "Soon" : "N/A"}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SeasonSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 pt-16 sm:px-6">
      <div className="skeleton h-10 w-1/2 rounded-xl" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skeleton h-36 rounded-2xl" />
      ))}
    </div>
  );
}
