import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseHeader, BrowseResults, BrowseSkeleton, parseBrowse } from "@/components/browse";

export const metadata: Metadata = { title: "TV Shows" };

export default function TvShowsPage({ searchParams }: PageProps<"/tv">) {
  return (
    <>
      <BrowseHeader title="TV Shows" subtitle="Every series, with a rating graph for every episode." />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <Suspense fallback={<BrowseSkeleton />}>
          {searchParams.then((sp) => (
            <BrowseResults base="/tv" state={{ ...parseBrowse(sp, "tv"), type: "tv" }} />
          ))}
        </Suspense>
      </div>
    </>
  );
}
