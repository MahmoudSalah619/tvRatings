// Sample data used only while no TMDb credentials are configured, so the UI can be
// explored immediately. Posters are intentionally null (gradient placeholders render).
import type { Episode, MediaDetails, MediaSummary, MediaType, SeasonRatings } from "./types";
import { ANIMATION_GENRE_ID, genreName } from "./genres";

function item(
  id: number,
  mediaType: MediaType,
  title: string,
  date: string,
  voteAverage: number,
  genreIds: number[],
  overview: string,
  originalLanguage = "en",
): MediaSummary {
  return {
    id,
    mediaType,
    title,
    overview,
    posterPath: null,
    backdropPath: null,
    voteAverage,
    voteCount: 10000 + id % 9000,
    date,
    genreIds,
    originalLanguage,
  };
}

export const DEMO_MOVIES: MediaSummary[] = [
  item(278, "movie", "The Shawshank Redemption", "1994-09-23", 8.7, [18, 80], "A banker sentenced to life in prison finds hope and friendship over two decades behind bars."),
  item(238, "movie", "The Godfather", "1972-03-14", 8.7, [18, 80], "The aging head of a crime dynasty hands control to his reluctant youngest son."),
  item(155, "movie", "The Dark Knight", "2008-07-16", 8.5, [18, 28, 80, 53], "Batman faces a chaotic criminal mastermind who pushes Gotham to the edge."),
  item(496243, "movie", "Parasite", "2019-05-30", 8.5, [35, 53, 18], "A struggling family schemes its way into the household of a wealthy one.", "ko"),
  item(27205, "movie", "Inception", "2010-07-15", 8.4, [28, 878, 12], "A thief who steals secrets through dreams is offered a chance to plant an idea instead."),
  item(157336, "movie", "Interstellar", "2014-11-05", 8.4, [12, 18, 878], "Explorers travel through a wormhole in search of a new home for humanity."),
  item(693134, "movie", "Dune: Part Two", "2024-02-27", 8.2, [878, 12], "Paul Atreides unites with the Fremen while seeking revenge against those who destroyed his family."),
  item(872585, "movie", "Oppenheimer", "2023-07-19", 8.1, [18, 36], "The story of the physicist who led the project to build the first atomic bomb."),
];

export const DEMO_TV: MediaSummary[] = [
  item(1396, "tv", "Breaking Bad", "2008-01-20", 8.9, [18, 80], "A chemistry teacher diagnosed with cancer turns to making meth to secure his family's future."),
  item(87108, "tv", "Chernobyl", "2019-05-06", 8.7, [18], "A dramatization of the 1986 nuclear disaster and the people who fought to contain it."),
  item(1399, "tv", "Game of Thrones", "2011-04-17", 8.5, [10765, 18, 10759], "Noble families wage war for control of the Iron Throne while an ancient threat returns."),
  item(95396, "tv", "Severance", "2022-02-17", 8.4, [18, 9648, 10765], "Office workers have their memories surgically divided between work and personal lives."),
  item(76331, "tv", "Succession", "2018-06-03", 8.3, [18], "The children of a media mogul jostle for control of the family empire."),
  item(136315, "tv", "The Bear", "2022-06-23", 8.2, [18, 35], "A fine-dining chef returns home to run his family's chaotic sandwich shop."),
];

export const DEMO_ANIME_TV: MediaSummary[] = [
  item(209867, "tv", "Frieren: Beyond Journey's End", "2023-09-29", 8.8, [16, 10759, 10765], "An elf mage reflects on time and friendship after her hero party's quest ends.", "ja"),
  item(1429, "tv", "Attack on Titan", "2013-04-07", 8.7, [16, 10765, 10759], "Humanity fights for survival against giant humanoid Titans.", "ja"),
  item(31911, "tv", "Fullmetal Alchemist: Brotherhood", "2009-04-05", 8.7, [16, 10759, 10765], "Two brothers use alchemy in search of the Philosopher's Stone.", "ja"),
  item(13916, "tv", "Death Note", "2006-10-04", 8.6, [16, 9648, 80], "A student discovers a notebook that kills anyone whose name is written in it.", "ja"),
  item(30991, "tv", "Cowboy Bebop", "2008-04-03", 8.5, [16, 10759, 10765], "A crew of bounty hunters drifts through the solar system in 2071.", "ja"),
];

export const DEMO_ANIME_MOVIES: MediaSummary[] = [
  item(129, "movie", "Spirited Away", "2001-07-20", 8.5, [16, 10751, 14], "A girl wanders into a world of spirits and must work to free her parents.", "ja"),
  item(372058, "movie", "Your Name.", "2016-08-26", 8.5, [16, 10749, 18], "Two teenagers discover they are swapping bodies across time and distance.", "ja"),
  item(128, "movie", "Princess Mononoke", "1997-07-12", 8.3, [16, 12, 14], "A prince is caught in a war between forest gods and a mining town.", "ja"),
];

export const DEMO_ALL: MediaSummary[] = [...DEMO_MOVIES, ...DEMO_TV, ...DEMO_ANIME_TV, ...DEMO_ANIME_MOVIES];

export const DEMO_TRENDING: MediaSummary[] = [
  DEMO_TV[0],
  DEMO_MOVIES[6],
  DEMO_ANIME_TV[0],
  DEMO_MOVIES[2],
  DEMO_TV[3],
  DEMO_MOVIES[4],
  DEMO_ANIME_TV[1],
  DEMO_TV[1],
  DEMO_MOVIES[7],
  DEMO_ANIME_MOVIES[0],
];

// Breaking Bad episode ratings (as shown on SeriesGraph).
const BREAKING_BAD: number[][] = [
  [9.0, 8.4, 8.7, 8.0, 8.1, 9.2, 8.8],
  [8.4, 9.3, 8.1, 8.2, 8.0, 8.8, 8.6, 9.3, 9.2, 8.2, 8.8, 9.3, 9.2],
  [8.2, 8.4, 8.1, 7.9, 8.3, 9.3, 9.5, 8.7, 8.3, 8.6, 8.3, 9.5, 9.6],
  [9.2, 8.1, 7.8, 8.5, 8.6, 8.5, 8.8, 9.3, 8.9, 9.6, 9.7, 9.5, 9.7],
  [9.0, 8.5, 8.6, 8.8, 9.5, 9.0, 9.6, 9.5, 9.4, 9.1, 9.6, 9.1, 9.6, 9.9, 9.6, 9.8],
];

// Deterministic pseudo-random so demo grids are stable between renders.
function seeded(seed: number) {
  let s = seed % 2147483647;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

function demoSeasonShape(id: number): number[][] {
  if (id === 1396) return BREAKING_BAD;
  const rand = seeded(id);
  const base = DEMO_ALL.find((m) => m.id === id)?.voteAverage ?? 8;
  const seasons = id === 87108 ? 1 : 2 + Math.floor(rand() * 4);
  return Array.from({ length: seasons }, (_, s) => {
    const count = 6 + Math.floor(rand() * 8);
    const drift = (rand() - 0.5) * 1.2;
    return Array.from({ length: count }, (_, e) => {
      const finale = e === count - 1 ? 0.6 : 0;
      const v = base + drift + finale + (rand() - 0.5) * 1.4 - s * 0.05;
      return Math.max(4.2, Math.min(9.9, Math.round(v * 10) / 10));
    });
  });
}

export function demoSeasons(id: number): SeasonRatings[] {
  return demoSeasonShape(id).map((ratings, s) => ({
    seasonNumber: s + 1,
    name: `Season ${s + 1}`,
    episodes: ratings.map<Episode>((v, e) => ({
      episodeNumber: e + 1,
      name: `Episode ${e + 1}`,
      airDate: null,
      voteAverage: v,
      voteCount: 500,
      overview: "",
      stillPath: null,
    })),
  }));
}

export function demoDetails(type: MediaType, id: number): MediaDetails | null {
  const base = DEMO_ALL.find((m) => m.id === id && m.mediaType === type);
  if (!base) return null;
  const seasons = type === "tv" ? demoSeasonShape(id) : [];
  const isAnime = base.genreIds.includes(ANIMATION_GENRE_ID) && base.originalLanguage === "ja";
  return {
    ...base,
    tagline: "",
    genres: base.genreIds.map((g) => ({ id: g, name: genreName(g) ?? "Other" })),
    runtime: type === "movie" ? 120 + (id % 50) : 45,
    status: type === "movie" ? "Released" : "Ended",
    certification: null,
    cast: [],
    creators: [],
    reviews: [
      {
        id: `demo-${id}-1`,
        author: "Demo reviewer",
        avatarPath: null,
        rating: Math.round(base.voteAverage),
        content:
          "This is placeholder review text shown in demo mode. Add your TMDb API token to .env.local to load real reviews from TMDb's community.",
        createdAt: "2024-01-01T00:00:00.000Z",
        url: "https://www.themoviedb.org/",
      },
    ],
    trailerKey: null,
    recommendations: DEMO_ALL.filter((m) => m.mediaType === type && m.id !== id).slice(0, 8),
    imdbId: null,
    isAnime,
    ...(type === "tv"
      ? {
          numberOfSeasons: seasons.length,
          numberOfEpisodes: seasons.reduce((n, s) => n + s.length, 0),
          seasons: seasons.map((eps, i) => ({
            seasonNumber: i + 1,
            name: `Season ${i + 1}`,
            episodeCount: eps.length,
            airDate: null,
            posterPath: null,
          })),
          networks: [],
        }
      : {}),
  };
}
