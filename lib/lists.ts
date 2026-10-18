import { cacheLife } from "next/cache";
import { getDetails, getSeason, toSummaries, type RawPaged } from "./tmdb/api";
import { isDemoMode, tmdbFetch } from "./tmdb/client";
import { ANIMATION_GENRE_ID } from "./tmdb/genres";
import { DEMO_ALL } from "./tmdb/demo";
import type { MediaSummary, MediaType } from "./tmdb/types";

type Params = Record<string, string | number>;

interface DiscoverList {
  kind: "discover";
  slug: string;
  title: string;
  description: string;
  type: MediaType;
  params: Params;
}

interface FinaleList {
  kind: "finales";
  slug: string;
  title: string;
  description: string;
}

export type CuratedList = DiscoverList | FinaleList;

const TOP = { sort_by: "vote_average.desc" };

export const CURATED_LISTS: CuratedList[] = [
  {
    kind: "finales",
    slug: "stuck-the-landing",
    title: "Shows that stuck the landing",
    description: "Acclaimed series whose final episode beat the average of its final season.",
  },
  {
    kind: "discover",
    slug: "best-anime-series",
    title: "Best anime series of all time",
    description: "The highest-rated Japanese animated series on TMDb.",
    type: "tv",
    params: { ...TOP, with_genres: ANIMATION_GENRE_ID, with_original_language: "ja", "vote_count.gte": 500 },
  },
  {
    kind: "discover",
    slug: "best-anime-films",
    title: "Best anime films",
    description: "From Ghibli classics to modern hits, the top-rated anime movies.",
    type: "movie",
    params: { ...TOP, with_genres: ANIMATION_GENRE_ID, with_original_language: "ja", "vote_count.gte": 500 },
  },
  {
    kind: "discover",
    slug: "best-miniseries",
    title: "Best miniseries",
    description: "Complete stories in a single season. No cliffhangers, no cancellations.",
    type: "tv",
    params: { ...TOP, with_type: 2, "vote_count.gte": 300 },
  },
  {
    kind: "discover",
    slug: "hidden-gem-movies",
    title: "Hidden gem movies",
    description: "Highly rated films that flew under the radar.",
    type: "movie",
    params: { ...TOP, "vote_average.gte": 7.4, "vote_count.gte": 150, "vote_count.lte": 1200, without_genres: 99 },
  },
  {
    kind: "discover",
    slug: "best-90s-movies",
    title: "Best movies of the '90s",
    description: "The decade's most beloved films.",
    type: "movie",
    params: {
      ...TOP,
      "primary_release_date.gte": "1990-01-01",
      "primary_release_date.lte": "1999-12-31",
      "vote_count.gte": 2000,
    },
  },
  {
    kind: "discover",
    slug: "best-crime-dramas",
    title: "Best crime dramas on TV",
    description: "Gripping crime series, ranked.",
    type: "tv",
    params: { ...TOP, with_genres: "80,18", "vote_count.gte": 500, without_genres: ANIMATION_GENRE_ID },
  },
];

export function findList(slug: string) {
  return CURATED_LISTS.find((l) => l.slug === slug);
}

export async function getDiscoverListItems(slug: string): Promise<MediaSummary[]> {
  "use cache";
  cacheLife("days");
  const list = findList(slug);
  if (!list || list.kind !== "discover") return [];
  if (isDemoMode()) {
    return DEMO_ALL.filter((m) => m.mediaType === list.type).sort((a, b) => b.voteAverage - a.voteAverage);
  }
  // Two pages gives a top-40 ranking.
  const pages = await Promise.all(
    [1, 2].map((page) =>
      tmdbFetch<RawPaged>(`/discover/${list.type}`, { include_adult: "false", ...list.params, page }),
    ),
  );
  return toSummaries(
    pages.flatMap((p) => p.results),
    list.type,
  );
}

export interface FinaleEntry {
  show: MediaSummary;
  seasonNumber: number;
  episodeName: string;
  finaleScore: number;
  seasonAverage: number;
}

/** Ended, top-rated shows whose finale out-scored the rest of its season. */
export async function getFinaleEntries(): Promise<FinaleEntry[]> {
  "use cache";
  cacheLife("days");
  if (isDemoMode()) return [];

  // Widely-watched acclaimed shows; TMDb's own top-rated list skews toward niche titles.
  const pages = await Promise.all(
    [1, 2].map((page) =>
      tmdbFetch<RawPaged>("/discover/tv", {
        sort_by: "vote_average.desc",
        "vote_count.gte": 2500,
        without_genres: "10767,10763,10764",
        page,
      }),
    ),
  );
  const candidates = toSummaries(
    pages.flatMap((p) => p.results),
    "tv",
  ).slice(0, 36);
  const entries = await Promise.all(
    candidates.map(async (show): Promise<FinaleEntry | null> => {
      try {
        const details = await getDetails("tv", show.id);
        if (!details || details.status !== "Ended") return null;
        const last = Math.max(0, ...(details.seasons ?? []).filter((s) => s.seasonNumber > 0).map((s) => s.seasonNumber));
        if (!last) return null;
        const season = await getSeason(show.id, last);
        // Require real vote counts so a handful of early votes can't fake a great finale.
        const rated = season?.episodes.filter((e) => e.voteCount >= 15 && e.voteAverage > 0) ?? [];
        if (rated.length < 2) return null;
        const finale = rated[rated.length - 1];
        const rest = rated.slice(0, -1);
        const seasonAverage = rest.reduce((n, e) => n + e.voteAverage, 0) / rest.length;
        if (finale.voteAverage <= seasonAverage) return null;
        return {
          show,
          seasonNumber: last,
          episodeName: finale.name,
          finaleScore: finale.voteAverage,
          seasonAverage,
        };
      } catch {
        return null;
      }
    }),
  );
  return entries
    .filter((e): e is FinaleEntry => e !== null)
    .sort((a, b) => b.finaleScore - b.seasonAverage - (a.finaleScore - a.seasonAverage));
}
