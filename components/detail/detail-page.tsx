import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDetails, getSeasonRatings, getWatchProviders } from "@/lib/tmdb/api";
import type { MediaType } from "@/lib/tmdb/types";
import { AUTH_UI_ENABLED } from "@/lib/features";
import { EpisodeGrid } from "../episode-grid";
import { MediaRow } from "../media-row";
import { CastRow } from "./cast-row";
import { DetailHero } from "./detail-hero";
import { Reviews } from "./reviews";
import { UserReviews } from "./user-reviews";
import { WhereToWatch } from "./where-to-watch";

export function parseId(raw: string): number {
  const id = Number.parseInt(raw, 10);
  if (!Number.isFinite(id) || id <= 0 || String(id) !== raw.split("-")[0]) notFound();
  return id;
}

export async function DetailContent({ type, id }: { type: MediaType; id: number }) {
  const media = await getDetails(type, id);
  if (!media) notFound();

  const seasonNumbers = (media.seasons ?? [])
    .filter((s) => s.seasonNumber > 0 && s.episodeCount > 0)
    .map((s) => s.seasonNumber);

  return (
    <>
      <DetailHero media={media} />
      <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6">
        {type === "tv" && seasonNumbers.length > 0 && (
          <section id="episodes" className="scroll-mt-24">
            <div className="mb-6">
              <p className="mb-1 text-xs font-medium tracking-[0.2em] text-accent uppercase">Episode graph</p>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Ratings by episode</h2>
            </div>
            <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
              <EpisodeRatings id={id} title={media.title} seasonNumbers={seasonNumbers} />
            </Suspense>
          </section>
        )}
        <Suspense fallback={<div className="skeleton h-40 rounded-2xl" />}>
          <Providers type={type} id={id} />
        </Suspense>
        <CastRow cast={media.cast} />
        <Reviews reviews={media.reviews} />
        {AUTH_UI_ENABLED && <UserReviews mediaType={type} tmdbId={id} />}
        <MediaRow title="More like this" items={media.recommendations} />
      </div>
    </>
  );
}

async function EpisodeRatings({ id, title, seasonNumbers }: { id: number; title: string; seasonNumbers: number[] }) {
  const seasons = await getSeasonRatings(id, seasonNumbers);
  return <EpisodeGrid seasons={seasons} showId={id} title={title} />;
}

async function Providers({ type, id }: { type: MediaType; id: number }) {
  const providers = await getWatchProviders(type, id).catch(() => ({}));
  return <WhereToWatch providers={providers} />;
}
