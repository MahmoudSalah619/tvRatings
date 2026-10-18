import Link from "next/link";
import { ExternalLink, GitCompareArrows } from "lucide-react";
import type { MediaDetails } from "@/lib/tmdb/types";
import { formatRuntime, typeLabel, yearOf } from "@/lib/format";
import { Backdrop, Poster } from "../poster";
import { ScoreRing } from "../rating-pill";
import { TrailerButton } from "./trailer-button";

export function DetailHero({ media }: { media: MediaDetails }) {
  const facts = [
    yearOf(media.date),
    typeLabel(media),
    media.certification,
    media.mediaType === "movie"
      ? formatRuntime(media.runtime)
      : media.numberOfSeasons
        ? `${media.numberOfSeasons} season${media.numberOfSeasons === 1 ? "" : "s"} · ${media.numberOfEpisodes} episodes`
        : null,
  ].filter(Boolean);

  const tmdbUrl = `https://www.themoviedb.org/${media.mediaType}/${media.id}`;

  return (
    <section className="relative isolate -mt-16 overflow-hidden pt-16">
      <div className="absolute inset-0 -z-10 opacity-60">
        <Backdrop id={media.id} title={media.title} path={media.backdropPath} priority />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/80 to-background/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/90 to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 pb-12 sm:px-6 md:grid-cols-[260px_1fr] md:pt-20 lg:grid-cols-[300px_1fr]">
        <Poster
          id={media.id}
          title={media.title}
          path={media.posterPath}
          size="w500"
          priority
          sizes="300px"
          className="mx-auto w-48 animate-fade-up shadow-2xl shadow-black/70 ring-1 ring-white/10 sm:w-60 md:w-full"
        />
        <div className="animate-fade-up self-end [animation-delay:100ms]">
          <p className="text-sm text-foreground/70">{facts.join(" · ")}</p>
          <h1 className="mt-2 font-display text-5xl leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {media.title}
          </h1>
          {media.tagline && <p className="mt-3 font-display text-xl text-foreground/60 italic">{media.tagline}</p>}

          <div className="mt-5 flex flex-wrap gap-2">
            {media.genres.map((g) => (
              <span key={g.id} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs backdrop-blur">
                {g.name}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ScoreRing score={media.voteAverage} votes={media.voteCount} />
            {media.creators.length > 0 && (
              <div className="text-sm">
                <div className="text-muted">{media.mediaType === "movie" ? "Directed by" : "Created by"}</div>
                <div className="font-medium">{media.creators.slice(0, 3).join(", ")}</div>
              </div>
            )}
            {media.networks && media.networks.length > 0 && (
              <div className="text-sm">
                <div className="text-muted">Network</div>
                <div className="font-medium">{media.networks.slice(0, 2).join(", ")}</div>
              </div>
            )}
          </div>

          <p className="mt-6 max-w-3xl leading-relaxed text-foreground/80">{media.overview}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            {media.trailerKey && <TrailerButton trailerKey={media.trailerKey} title={media.title} />}
            {media.mediaType === "tv" && (
              <Link
                href={`/compare?a=${media.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-white/10"
              >
                <GitCompareArrows className="size-4" /> Compare
              </Link>
            )}
            {media.imdbId && (
              <a
                href={`https://www.imdb.com/title/${media.imdbId}/`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-white/10"
              >
                IMDb <ExternalLink className="size-3.5" />
              </a>
            )}
            <a
              href={tmdbUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-white/10"
            >
              TMDb <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 pb-12 sm:px-6 md:grid-cols-[260px_1fr] md:pt-20 lg:grid-cols-[300px_1fr]">
      <div className="skeleton mx-auto aspect-[2/3] w-48 rounded-xl sm:w-60 md:w-full" />
      <div className="space-y-4 self-end">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="skeleton h-16 w-3/4 rounded-xl" />
        <div className="skeleton h-4 w-full max-w-2xl rounded" />
        <div className="skeleton h-4 w-2/3 max-w-xl rounded" />
      </div>
    </div>
  );
}
