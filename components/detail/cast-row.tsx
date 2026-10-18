import Image from "next/image";
import type { CastMember } from "@/lib/tmdb/types";
import { imageUrl } from "@/lib/tmdb/client";
import { SectionHeading } from "../media-row";
import { ScrollRow } from "../scroll-row";

export function CastRow({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null;
  return (
    <section>
      <SectionHeading title="Top cast" />
      <ScrollRow itemClassName="w-28 sm:w-32">
        {cast.map((c) => {
          const src = imageUrl(c.profilePath, "w185");
          return (
            <div key={c.id}>
              <div className="relative aspect-square overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10">
                {src ? (
                  <Image src={src} alt={c.name} fill sizes="128px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center font-display text-3xl text-muted">{c.name.slice(0, 1)}</span>
                )}
              </div>
              <p className="mt-2 truncate text-center text-sm font-medium">{c.name}</p>
              <p className="truncate text-center text-xs text-muted">{c.character}</p>
            </div>
          );
        })}
      </ScrollRow>
    </section>
  );
}
