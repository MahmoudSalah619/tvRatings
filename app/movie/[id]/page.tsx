import { Suspense } from "react";
import type { Metadata } from "next";
import { getDetails } from "@/lib/tmdb/api";
import { DetailContent, parseId } from "@/components/detail/detail-page";
import { DetailSkeleton } from "@/components/detail/detail-hero";

export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
  const { id } = await params;
  const media = await getDetails("movie", Number.parseInt(id, 10)).catch(() => null);
  if (!media) return { title: "Movie not found" };
  return { title: `${media.title} (${media.date?.slice(0, 4) ?? "TBA"})`, description: media.overview };
}

export default function MoviePage({ params }: PageProps<"/movie/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      {params.then(({ id }) => (
        <DetailContent type="movie" id={parseId(id)} />
      ))}
    </Suspense>
  );
}
