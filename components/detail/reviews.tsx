import { MessageSquareText, Star } from "lucide-react";
import type { Review } from "@/lib/tmdb/types";
import { imageUrl } from "@/lib/tmdb/client";
import { formatDate } from "@/lib/format";
import { tierFor } from "@/lib/rating";
import { ExpandableText } from "./expandable-text";

// TMDb review bodies contain light markdown; strip the noisiest bits for plain display.
function clean(content: string) {
  return content
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*|__|_(?=\S)|(?<=\S)_/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function avatar(path: string | null) {
  if (!path) return null;
  // Some TMDb avatars are absolute gravatar URLs prefixed with "/".
  if (path.startsWith("/http")) return path.slice(1);
  return imageUrl(path, "w92");
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Reviews</h2>
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">{reviews.length}</span>
      </div>
      {reviews.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
          <MessageSquareText className="size-5" />
          No reviews yet for this title.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.slice(0, 8).map((r) => {
            const src = avatar(r.avatarPath);
            return (
              <article key={r.id} className="rounded-2xl border border-border bg-surface p-5">
                <header className="mb-3 flex items-center gap-3">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="size-9 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-sm font-semibold uppercase">
                      {r.author.slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.author}</p>
                    <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
                  </div>
                  {r.rating !== null && (
                    <span className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1 text-sm font-semibold tabular-nums">
                      <Star className="size-3.5" fill={tierFor(r.rating).color} stroke="none" />
                      {r.rating}
                      <span className="text-xs font-normal text-muted">/10</span>
                    </span>
                  )}
                </header>
                <ExpandableText text={clean(r.content)} />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
