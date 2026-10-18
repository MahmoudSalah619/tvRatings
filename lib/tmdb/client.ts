const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type ImageSize = "w92" | "w185" | "w300" | "w342" | "w500" | "w780" | "w1280" | "original";

export function imageUrl(path: string | null | undefined, size: ImageSize = "w500"): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

/** Demo mode serves bundled sample data until a TMDb token is configured. */
export function isDemoMode(): boolean {
  return !process.env.TMDB_TOKEN && !process.env.TMDB_API_KEY;
}

export class TmdbError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Low-level fetch against the TMDb v3 API. Supports either a v4 "API Read Access
 * Token" (TMDB_TOKEN, preferred) or a v3 API key (TMDB_API_KEY).
 */
export async function tmdbFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(API_BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const headers: Record<string, string> = { accept: "application/json" };
  if (process.env.TMDB_TOKEN) {
    headers.authorization = `Bearer ${process.env.TMDB_TOKEN}`;
  } else if (process.env.TMDB_API_KEY) {
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new TmdbError(res.status, `TMDb ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}
