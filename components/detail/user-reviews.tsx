import { Suspense } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import type { MediaType } from "@/lib/tmdb/types";
import { createClient } from "@/lib/supabase/server";
import { average, formatScore, tierFor } from "@/lib/rating";
import { formatDate } from "@/lib/format";
import { ReviewForm } from "./review-form";

interface ReviewRow {
  id: number;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profiles: { username: string | null } | null;
}

/** Community ratings & reviews from our own users (shown only when AUTH_UI_ENABLED). */
export function UserReviews({ mediaType, tmdbId }: { mediaType: MediaType; tmdbId: number }) {
  return (
    <section>
      <h2 className="mb-5 font-display text-3xl tracking-tight sm:text-4xl">Community reviews</h2>
      <Suspense fallback={<div className="skeleton h-40 rounded-2xl" />}>
        <UserReviewsContent mediaType={mediaType} tmdbId={tmdbId} />
      </Suspense>
    </section>
  );
}

async function UserReviewsContent({ mediaType, tmdbId }: { mediaType: MediaType; tmdbId: number }) {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="text-sm text-muted">Community reviews are coming soon.</p>;
  }

  const [{ data: auth }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("reviews")
      .select("id, user_id, rating, body, created_at, profiles(username)")
      .eq("media_type", mediaType)
      .eq("tmdb_id", tmdbId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  const rows = (data ?? []) as unknown as ReviewRow[];
  const mine = auth.user ? rows.find((r) => r.user_id === auth.user!.id) : undefined;
  const avg = average(rows.map((r) => r.rating));

  return (
    <div className="space-y-6">
      {avg !== null && (
        <p className="text-sm text-muted">
          <span className="text-2xl font-bold text-foreground tabular-nums">{formatScore(avg)}</span> average from{" "}
          {rows.length} member{rows.length === 1 ? "" : "s"}
        </p>
      )}

      {auth.user ? (
        <ReviewForm mediaType={mediaType} tmdbId={tmdbId} initialRating={mine?.rating} initialBody={mine?.body ?? ""} />
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted">
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>{" "}
          to rate and review this title.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((r) => (
          <article key={r.id} className="rounded-2xl border border-border bg-surface p-5">
            <header className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{r.profiles?.username ?? "Member"}</span>
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Star className="size-3.5" fill={tierFor(r.rating).color} stroke="none" />
                {r.rating}/10
              </span>
            </header>
            {r.body && <p className="text-sm whitespace-pre-line text-foreground/80">{r.body}</p>}
            <p className="mt-2 text-xs text-muted">{formatDate(r.created_at)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
