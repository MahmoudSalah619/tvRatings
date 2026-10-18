"use client";

import { useActionState, useState } from "react";
import { saveReview } from "@/app/auth/review-actions";
import { tierFor } from "@/lib/rating";

export function ReviewForm({
  mediaType,
  tmdbId,
  initialRating,
  initialBody,
}: {
  mediaType: string;
  tmdbId: number;
  initialRating?: number;
  initialBody: string;
}) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [state, action, pending] = useActionState(saveReview, {});

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <input type="hidden" name="mediaType" value={mediaType} />
      <input type="hidden" name="tmdbId" value={tmdbId} />
      <input type="hidden" name="rating" value={rating} />
      <div>
        <p className="mb-2 text-sm text-foreground/80">Your rating</p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-pressed={rating === n}
              className={`size-9 rounded-md text-sm font-semibold transition ${
                n <= rating ? tierFor(rating).cell : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <textarea
        name="body"
        defaultValue={initialBody}
        rows={4}
        maxLength={5000}
        placeholder="What did you think? (optional)"
        className="w-full rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted focus:border-accent/60 focus:outline-none"
      />
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-400">Saved. Thanks for your review!</p>}
      <button
        type="submit"
        disabled={pending || rating === 0}
        className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background hover:bg-white disabled:opacity-50"
      >
        {pending ? "Saving…" : initialRating ? "Update review" : "Post review"}
      </button>
    </form>
  );
}
