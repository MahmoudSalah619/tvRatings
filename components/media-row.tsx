import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MediaSummary } from "@/lib/tmdb/types";
import { MediaCard, MediaCardSkeleton } from "./media-card";
import { ScrollRow } from "./scroll-row";

export function SectionHeading({
  title,
  eyebrow,
  href,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-medium tracking-[0.2em] text-accent uppercase">{eyebrow}</p>}
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group flex shrink-0 items-center gap-1 text-sm text-muted hover:text-foreground">
          See all <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function MediaRow({
  title,
  eyebrow,
  href,
  items,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  items: MediaSummary[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <SectionHeading title={title} eyebrow={eyebrow} href={href} />
      <ScrollRow>
        {items.map((item) => (
          <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
        ))}
      </ScrollRow>
    </section>
  );
}

export function MediaRowSkeleton({ title }: { title: string }) {
  return (
    <section>
      <SectionHeading title={title} />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="w-36 shrink-0 sm:w-44 2xl:w-48">
            <MediaCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
