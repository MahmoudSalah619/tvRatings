import { cacheLife } from "next/cache";
import { isDemoMode, tmdbFetch, TmdbError } from "./client";
import {
  DEMO_ALL,
  DEMO_ANIME_MOVIES,
  DEMO_ANIME_TV,
  DEMO_MOVIES,
  DEMO_TRENDING,
  DEMO_TV,
  demoDetails,
  demoSeasons,
} from "./demo";
import { ANIMATION_GENRE_ID } from "./genres";
import type {
  CastMember,
  Episode,
  MediaDetails,
  MediaSummary,
  MediaType,
  Paged,
  Review,
  PersonCredit,
  PersonDetails,
  Provider,
  SeasonDetails,
  SeasonRatings,
  WatchProviders,
} from "./types";

/* ------------------------------------------------------------------ */
/* Raw TMDb shapes (only the fields we use)                            */
/* ------------------------------------------------------------------ */

export interface RawMedia {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  original_language?: string;
}

export interface RawPaged {
  page: number;
  total_pages: number;
  total_results: number;
  results: RawMedia[];
}

interface RawEpisode {
  episode_number: number;
  name: string;
  air_date: string | null;
  vote_average: number;
  vote_count: number;
  overview: string;
  still_path: string | null;
}

interface RawSeason {
  season_number: number;
  name: string;
  episode_count?: number;
  air_date: string | null;
  poster_path: string | null;
  episodes?: RawEpisode[];
}

function toSummary(raw: RawMedia, fallbackType?: MediaType): MediaSummary | null {
  const mediaType = (raw.media_type ?? fallbackType) as MediaType | undefined;
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  return {
    id: raw.id,
    mediaType,
    title: raw.title ?? raw.name ?? "Untitled",
    overview: raw.overview ?? "",
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    voteAverage: raw.vote_average ?? 0,
    voteCount: raw.vote_count ?? 0,
    date: (mediaType === "movie" ? raw.release_date : raw.first_air_date) || null,
    genreIds: raw.genre_ids ?? raw.genres?.map((g) => g.id) ?? [],
    originalLanguage: raw.original_language ?? "",
  };
}

export function toSummaries(results: RawMedia[], fallbackType?: MediaType): MediaSummary[] {
  return results.map((r) => toSummary(r, fallbackType)).filter((m): m is MediaSummary => m !== null);
}

export function toPaged(raw: RawPaged, fallbackType?: MediaType): Paged<MediaSummary> {
  return {
    page: raw.page,
    // TMDb refuses pages beyond 500.
    totalPages: Math.min(raw.total_pages, 500),
    totalResults: raw.total_results,
    results: toSummaries(raw.results, fallbackType),
  };
}

function demoPaged(results: MediaSummary[]): Paged<MediaSummary> {
  return { page: 1, totalPages: 1, totalResults: results.length, results };
}

export function isAnime(m: Pick<MediaSummary, "genreIds" | "originalLanguage">): boolean {
  return m.genreIds.includes(ANIMATION_GENRE_ID) && m.originalLanguage === "ja";
}

/* ------------------------------------------------------------------ */
/* Lists                                                               */
/* ------------------------------------------------------------------ */

export async function getTrending(): Promise<MediaSummary[]> {
  "use cache";
  cacheLife("hours");
  if (isDemoMode()) return DEMO_TRENDING;
  const raw = await tmdbFetch<RawPaged>("/trending/all/week");
  return toSummaries(raw.results);
}

export type ListKey =
  | "popular-movies"
  | "top-movies"
  | "now-playing"
  | "upcoming"
  | "popular-tv"
  | "top-tv"
  | "airing-tv"
  | "anime-tv"
  | "top-anime-tv"
  | "anime-movies";

const ANIME_FILTER = { with_genres: ANIMATION_GENRE_ID, with_original_language: "ja" };

const LISTS: Record<ListKey, { path: string; type: MediaType; params?: Record<string, string | number> }> = {
  "popular-movies": { path: "/movie/popular", type: "movie" },
  "top-movies": { path: "/movie/top_rated", type: "movie" },
  "now-playing": { path: "/movie/now_playing", type: "movie" },
  upcoming: { path: "/movie/upcoming", type: "movie" },
  "popular-tv": { path: "/tv/popular", type: "tv" },
  "top-tv": { path: "/tv/top_rated", type: "tv" },
  "airing-tv": { path: "/tv/on_the_air", type: "tv" },
  "anime-tv": { path: "/discover/tv", type: "tv", params: { ...ANIME_FILTER, sort_by: "popularity.desc" } },
  "top-anime-tv": {
    path: "/discover/tv",
    type: "tv",
    params: { ...ANIME_FILTER, sort_by: "vote_average.desc", "vote_count.gte": 400 },
  },
  "anime-movies": { path: "/discover/movie", type: "movie", params: { ...ANIME_FILTER, sort_by: "popularity.desc" } },
};

function demoList(key: ListKey): MediaSummary[] {
  const byScore = (a: MediaSummary, b: MediaSummary) => b.voteAverage - a.voteAverage;
  switch (key) {
    case "popular-movies":
    case "now-playing":
    case "upcoming":
      return DEMO_MOVIES;
    case "top-movies":
      return [...DEMO_MOVIES].sort(byScore);
    case "popular-tv":
    case "airing-tv":
      return DEMO_TV;
    case "top-tv":
      return [...DEMO_TV].sort(byScore);
    case "anime-tv":
      return DEMO_ANIME_TV;
    case "top-anime-tv":
      return [...DEMO_ANIME_TV].sort(byScore);
    case "anime-movies":
      return DEMO_ANIME_MOVIES;
  }
}

export async function getList(key: ListKey): Promise<MediaSummary[]> {
  "use cache";
  cacheLife("hours");
  if (isDemoMode()) return demoList(key);
  const def = LISTS[key];
  const raw = await tmdbFetch<RawPaged>(def.path, { include_adult: "false", ...def.params });
  return toSummaries(raw.results, def.type);
}

export type SortKey = "popular" | "top" | "newest";

export interface DiscoverOptions {
  type: MediaType;
  genre?: number;
  sort?: SortKey;
  page?: number;
  anime?: boolean;
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  minRuntime?: number;
  maxRuntime?: number;
  language?: string;
}

export async function discover(opts: DiscoverOptions): Promise<Paged<MediaSummary>> {
  "use cache";
  cacheLife("hours");
  const { type, genre, sort = "popular", page = 1, anime = false, yearFrom, yearTo, minRating, minRuntime, maxRuntime, language } =
    opts;

  if (isDemoMode()) {
    let pool = DEMO_ALL.filter((m) => m.mediaType === type && isAnime(m) === anime);
    if (genre) pool = pool.filter((m) => m.genreIds.includes(genre));
    if (yearFrom) pool = pool.filter((m) => Number(m.date?.slice(0, 4)) >= yearFrom);
    if (yearTo) pool = pool.filter((m) => Number(m.date?.slice(0, 4)) <= yearTo);
    if (minRating) pool = pool.filter((m) => m.voteAverage >= minRating);
    if (language) pool = pool.filter((m) => m.originalLanguage === language);
    if (sort === "top") pool = [...pool].sort((a, b) => b.voteAverage - a.voteAverage);
    if (sort === "newest") pool = [...pool].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    return demoPaged(pool);
  }

  const dateField = type === "movie" ? "primary_release_date" : "first_air_date";
  const today = new Date().toISOString().slice(0, 10);
  const genres = [anime ? ANIMATION_GENRE_ID : null, genre ?? null].filter(Boolean).join(",");

  const params: Record<string, string | number | undefined> = {
    include_adult: "false",
    page,
    with_genres: genres || undefined,
    with_original_language: anime ? "ja" : language || undefined,
    sort_by: sort === "top" ? "vote_average.desc" : sort === "newest" ? `${dateField}.desc` : "popularity.desc",
    // A rating floor is meaningless on titles with a handful of votes.
    "vote_count.gte": sort === "top" ? 300 : minRating ? 100 : sort === "newest" ? 20 : undefined,
    "vote_average.gte": minRating || undefined,
    "with_runtime.gte": minRuntime || undefined,
    "with_runtime.lte": maxRuntime || undefined,
    [`${dateField}.gte`]: yearFrom ? `${yearFrom}-01-01` : undefined,
    [`${dateField}.lte`]: yearTo ? `${yearTo}-12-31` : sort === "newest" ? today : undefined,
  };
  const raw = await tmdbFetch<RawPaged>(`/discover/${type}`, params);
  return toPaged(raw, type);
}

export async function searchMulti(query: string, page = 1): Promise<Paged<MediaSummary>> {
  "use cache";
  cacheLife("hours");
  const q = query.trim();
  if (!q) return demoPaged([]);
  if (isDemoMode()) {
    const lower = q.toLowerCase();
    return demoPaged(DEMO_ALL.filter((m) => m.title.toLowerCase().includes(lower)));
  }
  const raw = await tmdbFetch<RawPaged>("/search/multi", { query: q, page, include_adult: "false" });
  return toPaged(raw);
}

/* ------------------------------------------------------------------ */
/* Details                                                             */
/* ------------------------------------------------------------------ */

interface RawDetails extends RawMedia {
  tagline?: string;
  runtime?: number;
  episode_run_time?: number[];
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: RawSeason[];
  networks?: { name: string }[];
  created_by?: { name: string }[];
  imdb_id?: string;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { name: string; job: string }[];
  };
  reviews?: {
    results: {
      id: string;
      author: string;
      content: string;
      created_at: string;
      url: string;
      author_details?: { rating: number | null; avatar_path: string | null };
    }[];
  };
  videos?: { results: { key: string; site: string; type: string; official: boolean }[] };
  recommendations?: RawPaged;
  external_ids?: { imdb_id?: string | null };
  release_dates?: { results: { iso_3166_1: string; release_dates: { certification: string }[] }[] };
  content_ratings?: { results: { iso_3166_1: string; rating: string }[] };
}

function pickCertification(raw: RawDetails): string | null {
  if (raw.release_dates) {
    const us = raw.release_dates.results.find((r) => r.iso_3166_1 === "US");
    return us?.release_dates.find((d) => d.certification)?.certification || null;
  }
  if (raw.content_ratings) {
    return raw.content_ratings.results.find((r) => r.iso_3166_1 === "US")?.rating || null;
  }
  return null;
}

function pickTrailer(raw: RawDetails): string | null {
  const vids = raw.videos?.results.filter((v) => v.site === "YouTube") ?? [];
  const best =
    vids.find((v) => v.type === "Trailer" && v.official) ?? vids.find((v) => v.type === "Trailer") ?? vids[0];
  return best?.key ?? null;
}

export async function getDetails(type: MediaType, id: number): Promise<MediaDetails | null> {
  "use cache";
  cacheLife("days");
  if (isDemoMode()) return demoDetails(type, id);

  let raw: RawDetails;
  try {
    raw = await tmdbFetch<RawDetails>(`/${type}/${id}`, {
      append_to_response: [
        "credits",
        "reviews",
        "videos",
        "recommendations",
        "external_ids",
        type === "movie" ? "release_dates" : "content_ratings",
      ].join(","),
    });
  } catch (err) {
    if (err instanceof TmdbError && err.status === 404) return null;
    throw err;
  }

  const summary = toSummary(raw, type)!;
  const cast: CastMember[] = (raw.credits?.cast ?? []).slice(0, 16).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profilePath: c.profile_path,
  }));
  const creators =
    type === "movie"
      ? (raw.credits?.crew ?? []).filter((c) => c.job === "Director").map((c) => c.name)
      : (raw.created_by ?? []).map((c) => c.name);
  const reviews: Review[] = (raw.reviews?.results ?? []).map((r) => ({
    id: r.id,
    author: r.author,
    avatarPath: r.author_details?.avatar_path ?? null,
    rating: r.author_details?.rating ?? null,
    content: r.content,
    createdAt: r.created_at,
    url: r.url,
  }));

  return {
    ...summary,
    tagline: raw.tagline ?? "",
    genres: raw.genres ?? [],
    runtime: raw.runtime ?? raw.episode_run_time?.[0] ?? null,
    status: raw.status ?? "",
    certification: pickCertification(raw),
    cast,
    creators,
    reviews,
    trailerKey: pickTrailer(raw),
    recommendations: raw.recommendations ? toSummaries(raw.recommendations.results, type).slice(0, 14) : [],
    imdbId: raw.imdb_id ?? raw.external_ids?.imdb_id ?? null,
    isAnime: isAnime(summary),
    ...(type === "tv"
      ? {
          numberOfSeasons: raw.number_of_seasons,
          numberOfEpisodes: raw.number_of_episodes,
          seasons: (raw.seasons ?? []).map((s) => ({
            seasonNumber: s.season_number,
            name: s.name,
            episodeCount: s.episode_count ?? 0,
            airDate: s.air_date,
            posterPath: s.poster_path,
          })),
          networks: (raw.networks ?? []).map((n) => n.name),
        }
      : {}),
  };
}

/**
 * Fetches per-episode ratings for the given seasons. Uses append_to_response to
 * pull up to 20 seasons per request.
 */
export async function getSeasonRatings(id: number, seasonNumbers: number[]): Promise<SeasonRatings[]> {
  "use cache";
  cacheLife("days");
  if (isDemoMode()) return demoSeasons(id);

  const chunks: number[][] = [];
  for (let i = 0; i < seasonNumbers.length; i += 20) chunks.push(seasonNumbers.slice(i, i + 20));

  const responses = await Promise.all(
    chunks.map((chunk) =>
      tmdbFetch<Record<string, RawSeason | unknown>>(`/tv/${id}`, {
        append_to_response: chunk.map((n) => `season/${n}`).join(","),
      }),
    ),
  );

  const seasons: SeasonRatings[] = [];
  for (const res of responses) {
    for (const [key, value] of Object.entries(res)) {
      if (!key.startsWith("season/")) continue;
      const season = value as RawSeason;
      seasons.push({
        seasonNumber: season.season_number,
        name: season.name,
        episodes: (season.episodes ?? []).map<Episode>((e) => ({
          episodeNumber: e.episode_number,
          name: e.name,
          airDate: e.air_date,
          voteAverage: e.vote_average,
          voteCount: e.vote_count,
          overview: e.overview,
          stillPath: e.still_path,
        })),
      });
    }
  }
  return seasons.sort((a, b) => a.seasonNumber - b.seasonNumber);
}

/* ------------------------------------------------------------------ */
/* Seasons                                                             */
/* ------------------------------------------------------------------ */

function toEpisode(e: RawEpisode): Episode {
  return {
    episodeNumber: e.episode_number,
    name: e.name,
    airDate: e.air_date,
    voteAverage: e.vote_average,
    voteCount: e.vote_count,
    overview: e.overview,
    stillPath: e.still_path,
  };
}

export async function getSeason(id: number, seasonNumber: number): Promise<SeasonDetails | null> {
  "use cache";
  cacheLife("days");
  if (isDemoMode()) {
    const s = demoSeasons(id).find((x) => x.seasonNumber === seasonNumber);
    return s ? { ...s, overview: "", airDate: null, posterPath: null } : null;
  }
  try {
    const raw = await tmdbFetch<RawSeason & { overview?: string }>(`/tv/${id}/season/${seasonNumber}`);
    return {
      seasonNumber: raw.season_number,
      name: raw.name,
      overview: raw.overview ?? "",
      airDate: raw.air_date,
      posterPath: raw.poster_path,
      episodes: (raw.episodes ?? []).map(toEpisode),
    };
  } catch (err) {
    if (err instanceof TmdbError && err.status === 404) return null;
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Where to watch                                                      */
/* ------------------------------------------------------------------ */

interface RawProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

interface RawRegion {
  link: string;
  flatrate?: RawProvider[];
  free?: RawProvider[];
  ads?: RawProvider[];
  rent?: RawProvider[];
  buy?: RawProvider[];
}

function toProviders(list: RawProvider[] | undefined): Provider[] {
  return (list ?? [])
    .sort((a, b) => a.display_priority - b.display_priority)
    .map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path }));
}

export async function getWatchProviders(type: MediaType, id: number): Promise<WatchProviders> {
  "use cache";
  cacheLife("days");
  if (isDemoMode()) return {};
  const raw = await tmdbFetch<{ results: Record<string, RawRegion> }>(`/${type}/${id}/watch/providers`);
  const out: WatchProviders = {};
  for (const [region, r] of Object.entries(raw.results ?? {})) {
    out[region] = {
      link: r.link,
      stream: toProviders(r.flatrate),
      free: toProviders([...(r.free ?? []), ...(r.ads ?? [])]),
      rent: toProviders(r.rent),
      buy: toProviders(r.buy),
    };
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

interface RawCredit extends RawMedia {
  character?: string;
  job?: string;
  department?: string;
  popularity?: number;
}

interface RawPerson {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  known_for_department: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  imdb_id: string | null;
  combined_credits?: { cast: RawCredit[]; crew: RawCredit[] };
}

export async function getPerson(id: number): Promise<PersonDetails | null> {
  "use cache";
  cacheLife("days");
  if (isDemoMode()) return null;

  let raw: RawPerson;
  try {
    raw = await tmdbFetch<RawPerson>(`/person/${id}`, { append_to_response: "combined_credits" });
  } catch (err) {
    if (err instanceof TmdbError && err.status === 404) return null;
    throw err;
  }

  // Merge cast & crew, keeping one entry per title (first role wins), most popular first.
  const seen = new Map<string, { credit: PersonCredit; popularity: number }>();
  const add = (c: RawCredit, role: string, department: string) => {
    const summary = toSummary(c);
    if (!summary) return;
    const key = `${summary.mediaType}-${summary.id}`;
    const existing = seen.get(key);
    if (existing) {
      if (!existing.credit.role.includes(role) && role) existing.credit.role += `, ${role}`;
      return;
    }
    seen.set(key, { credit: { ...summary, role, department }, popularity: c.popularity ?? 0 });
  };
  raw.combined_credits?.cast.forEach((c) => add(c, c.character ?? "", "Acting"));
  raw.combined_credits?.crew.forEach((c) => add(c, c.job ?? "", c.department ?? "Crew"));

  const credits = [...seen.values()]
    // Hide talk-show and award-show appearances with no votes.
    .filter((x) => x.credit.voteCount > 0)
    .sort((a, b) => b.popularity - a.popularity)
    .map((x) => x.credit);

  return {
    id: raw.id,
    name: raw.name,
    biography: raw.biography,
    profilePath: raw.profile_path,
    knownFor: raw.known_for_department,
    birthday: raw.birthday,
    deathday: raw.deathday,
    placeOfBirth: raw.place_of_birth,
    imdbId: raw.imdb_id,
    credits,
  };
}
