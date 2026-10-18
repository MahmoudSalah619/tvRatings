export type MediaType = "movie" | "tv";

export interface MediaSummary {
  id: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  date: string | null;
  genreIds: number[];
  originalLanguage: string;
}

export interface Paged<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface Review {
  id: string;
  author: string;
  avatarPath: string | null;
  rating: number | null;
  content: string;
  createdAt: string;
  url: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MediaDetails extends MediaSummary {
  tagline: string;
  genres: Genre[];
  runtime: number | null; // minutes (movie runtime or typical episode length)
  status: string;
  certification: string | null;
  cast: CastMember[];
  creators: string[]; // directors for movies, creators for tv
  reviews: Review[];
  trailerKey: string | null; // YouTube key
  recommendations: MediaSummary[];
  imdbId: string | null;
  isAnime: boolean;
  // TV only
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons?: SeasonSummary[];
  networks?: string[];
}

export interface SeasonSummary {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
}

export interface Episode {
  episodeNumber: number;
  name: string;
  airDate: string | null;
  voteAverage: number;
  voteCount: number;
  overview: string;
  stillPath: string | null;
}

export interface SeasonRatings {
  seasonNumber: number;
  name: string;
  episodes: Episode[];
}

export interface SeasonDetails extends SeasonRatings {
  overview: string;
  airDate: string | null;
  posterPath: string | null;
}

export interface Provider {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface RegionProviders {
  link: string;
  stream: Provider[];
  free: Provider[];
  rent: Provider[];
  buy: Provider[];
}

/** Keyed by ISO 3166-1 country code. */
export type WatchProviders = Record<string, RegionProviders>;

export interface PersonCredit extends MediaSummary {
  role: string; // character or job
  department: "Acting" | string;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  profilePath: string | null;
  knownFor: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  imdbId: string | null;
  credits: PersonCredit[];
}
