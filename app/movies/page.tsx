import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseHeader, BrowseResults, BrowseSkeleton, parseBrowse } from "@/components/browse";

export const metadata: Metadata = { title: "Movies" };

export default function MoviesPage({ searchParams }: PageProps<"/movies">) {
  return (
    <>
      <BrowseHeader title="Movies" subtitle="Browse ratings and reviews for every film on TMDb." />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <Suspense fallback={<BrowseSkeleton />}>
          {searchParams.then((sp) => (
            <BrowseResults base="/movies" state={{ ...parseBrowse(sp, "movie"), type: "movie" }} />
          ))}
        </Suspense>
      </div>
    </>
  );
}
