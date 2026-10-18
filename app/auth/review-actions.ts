"use server";

import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ReviewState {
  error?: string;
  ok?: boolean;
}

export async function saveReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Reviews aren't available yet." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Please sign in to leave a review." };

  const mediaType = formData.get("mediaType");
  const tmdbId = Number(formData.get("tmdbId"));
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();

  if (mediaType !== "movie" && mediaType !== "tv") return { error: "Invalid title." };
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) return { error: "Invalid title." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) return { error: "Pick a rating from 1 to 10." };
  if (body.length > 5000) return { error: "Reviews are limited to 5000 characters." };

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: auth.user.id,
      media_type: mediaType,
      tmdb_id: tmdbId,
      rating,
      body: body || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,media_type,tmdb_id" },
  );
  if (error) return { error: error.message };
  refresh();
  return { ok: true };
}
