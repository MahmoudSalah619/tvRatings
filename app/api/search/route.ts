import { NextResponse, type NextRequest } from "next/server";
import { searchMulti } from "@/lib/tmdb/api";

export interface Suggestion {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  year: string | null;
  posterPath: string | null;
  voteAverage: number;
  label: string;
}

/** Lightweight autocomplete endpoint used by the navbar search box. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const data = await searchMulti(q, 1);
    const results: Suggestion[] = data.results
      .slice(0, 8)
      .map((m) => {
        const anime = m.genreIds.includes(16) && m.originalLanguage === "ja";
        return {
          id: m.id,
          mediaType: m.mediaType,
          title: m.title,
          year: m.date ? m.date.slice(0, 4) : null,
          posterPath: m.posterPath,
          voteAverage: m.voteAverage,
          label: anime ? (m.mediaType === "movie" ? "Anime Film" : "Anime") : m.mediaType === "movie" ? "Movie" : "TV Series",
        };
      });
    return NextResponse.json({ results }, { headers: { "cache-control": "public, max-age=300" } });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
