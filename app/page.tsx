import { Suspense } from "react";
import { HeroSkeleton } from "@/components/home/hero";
import {
  CategoryTiles,
  EpisodeShowcase,
  HeroSection,
  ListRow,
  Top10Row,
} from "@/components/home/sections";
import { MediaRowSkeleton } from "@/components/media-row";

const ROWS = [
  { list: "popular-movies", title: "Popular movies", eyebrow: "In theaters & streaming", href: "/movies" },
  { list: "top-tv", title: "Highest rated series", eyebrow: "All-time greats", href: "/tv?sort=top" },
  { list: "anime-tv", title: "Popular anime", eyebrow: "Anime", href: "/anime" },
  { list: "top-movies", title: "Top rated movies", eyebrow: "Critically adored", href: "/movies?sort=top" },
  { list: "airing-tv", title: "Airing this week", eyebrow: "New episodes", href: "/tv" },
  { list: "anime-movies", title: "Anime films", eyebrow: "Anime", href: "/anime?type=movie" },
] as const;

export default function Home() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <div className="mx-auto max-w-7xl 2xl:max-w-[100rem] space-y-16 px-4 sm:px-6">
        <Suspense fallback={<div className="grid h-48 gap-4 md:grid-cols-3" />}>
          <CategoryTiles />
        </Suspense>

        <Suspense fallback={<MediaRowSkeleton title="Top 10 this week" />}>
          <Top10Row />
        </Suspense>

        {ROWS.slice(0, 3).map((row) => (
          <Suspense key={row.list} fallback={<MediaRowSkeleton title={row.title} />}>
            <ListRow {...row} />
          </Suspense>
        ))}

        <Suspense fallback={null}>
          <EpisodeShowcase />
        </Suspense>

        {ROWS.slice(3).map((row) => (
          <Suspense key={row.list} fallback={<MediaRowSkeleton title={row.title} />}>
            <ListRow {...row} />
          </Suspense>
        ))}
      </div>
    </>
  );
}
