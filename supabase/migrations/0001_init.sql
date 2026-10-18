-- Reel Ratings: user profiles, ratings & reviews.
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

-- Profiles ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (username is null or char_length(username) between 2 and 32),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using ((select auth.uid()) = id);

-- Create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, nullif(new.raw_user_meta_data ->> 'username', ''))
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reviews (one per user per title) ------------------------------------------
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  tmdb_id integer not null,
  rating smallint not null check (rating between 1 and 10),
  body text check (body is null or char_length(body) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, media_type, tmdb_id)
);

create index if not exists reviews_title_idx on public.reviews (media_type, tmdb_id, created_at desc);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Users can insert their own reviews"
  on public.reviews for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete using ((select auth.uid()) = user_id);

-- Episode ratings (powers a future community episode graph) -----------------
create table if not exists public.episode_ratings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  tmdb_id integer not null,
  season_number smallint not null,
  episode_number smallint not null,
  rating smallint not null check (rating between 1 and 10),
  created_at timestamptz not null default now(),
  primary key (user_id, tmdb_id, season_number, episode_number)
);

create index if not exists episode_ratings_show_idx on public.episode_ratings (tmdb_id);

alter table public.episode_ratings enable row level security;

create policy "Episode ratings are viewable by everyone"
  on public.episode_ratings for select using (true);

create policy "Users can insert their own episode ratings"
  on public.episode_ratings for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own episode ratings"
  on public.episode_ratings for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own episode ratings"
  on public.episode_ratings for delete using ((select auth.uid()) = user_id);
