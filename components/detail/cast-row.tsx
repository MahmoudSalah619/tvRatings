import Image from "next/image";
import Link from "next/link";
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
            <Link key={c.id} href={`/person/${c.id}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10 transition group-hover:ring-2 group-hover:ring-accent">
                {src ? (
                  <Image src={src} alt={c.name} fill sizes="128px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center font-display text-3xl text-muted">{c.name.slice(0, 1)}</span>
                )}
              </div>
              <p className="mt-2 truncate text-center text-sm font-medium group-hover:text-accent">{c.name}</p>
              <p className="truncate text-center text-xs text-muted">{c.character}</p>
            </Link>
          );
        })}
      </ScrollRow>
    </section>
  );
}
