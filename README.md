# Reel Ratings

Ratings and reviews for movies, TV series and anime, powered by the [TMDb API](https://developer.themoviedb.org/).
TV series and anime get a color-coded, episode-by-episode rating grid.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

### TMDb
Without credentials the site runs in **demo mode** with a small set of sample titles.
Create a free account at themoviedb.org → Settings → API, then copy the **API Read Access Token**
into `TMDB_TOKEN` in `.env.local` and restart the dev server.

### Authentication (hidden)
Auth uses Supabase and is wired up but hidden from the UI:

- Routes `/login`, `/signup`, `/account` work but aren't linked anywhere (and are `noindex`).
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`.
- Apply the schema in `supabase/migrations/0001_init.sql` (profiles, reviews, episode ratings, with RLS).
- Set `NEXT_PUBLIC_AUTH_UI=true` to show the Sign in button and the community reviews section on title pages.
  When you do, widen the matcher in `proxy.ts` so sessions refresh on every page.

## Structure

- `lib/tmdb/` – TMDb client, cached API functions (`"use cache"`), demo data
- `lib/rating.ts` – rating tiers (Absolute Cinema → Garbage) used by the episode grid
- `components/episode-grid.tsx` – the per-episode ratings grid
- `app/` – home, `/movies`, `/tv`, `/anime`, `/search`, `/movie/[id]`, `/tv/[id]`, auth routes
