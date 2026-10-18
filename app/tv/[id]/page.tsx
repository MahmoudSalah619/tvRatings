import { Suspense } from "react";
import type { Metadata } from "next";
import { getDetails } from "@/lib/tmdb/api";
import { DetailContent, parseId } from "@/components/detail/detail-page";
import { DetailSkeleton } from "@/components/detail/detail-hero";

export async function generateMetadata({ params }: PageProps<"/tv/[id]">): Promise<Metadata> {
  const { id } = await params;
  const media = await getDetails("tv", Number.parseInt(id, 10)).catch(() => null);
  if (!media) return { title: "Series not found" };
  return {
    title: `${media.title} — episode ratings`,
    description: `Episode-by-episode ratings and reviews for ${media.title}. ${media.overview}`,
  };
}

export default function TvPage({ params }: PageProps<"/tv/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      {params.then(({ id }) => (
        <DetailContent type="tv" id={parseId(id)} />
      ))}
    </Suspense>
  );
}
