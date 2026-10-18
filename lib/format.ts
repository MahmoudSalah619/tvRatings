import type { MediaSummary } from "./tmdb/types";

export function yearOf(date: string | null | undefined): string {
  return date ? date.slice(0, 4) : "—";
}

export function hrefFor(m: Pick<MediaSummary, "mediaType" | "id">): string {
  return `/${m.mediaType}/${m.id}`;
}

export function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "TBA";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export function typeLabel(m: Pick<MediaSummary, "mediaType" | "genreIds" | "originalLanguage">): string {
  const anime = m.genreIds.includes(16) && m.originalLanguage === "ja";
  if (anime) return m.mediaType === "movie" ? "Anime Film" : "Anime";
  return m.mediaType === "movie" ? "Movie" : "Series";
}
