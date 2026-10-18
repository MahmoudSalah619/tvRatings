import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseHeader, BrowseResults, BrowseSkeleton, parseBrowse } from "@/components/browse";

export const metadata: Metadata = { title: "Anime" };

export default function AnimePage({ searchParams }: PageProps<"/anime">) {
  return (
    <>
      <BrowseHeader title="Anime" subtitle="Japanese animated series and films, rated episode by episode." />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <Suspense fallback={<BrowseSkeleton />}>
          {searchParams.then((sp) => (
            <BrowseResults base="/anime" state={parseBrowse(sp, "tv")} anime showTypeToggle />
          ))}
        </Suspense>
      </div>
    </>
  );
}
