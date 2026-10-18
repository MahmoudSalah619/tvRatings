import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getList, getSeasonRatings, getTrending, type ListKey } from "@/lib/tmdb/api";
import { hrefFor } from "@/lib/format";
import { MediaRow, SectionHeading } from "../media-row";
import { Poster } from "../poster";
import { RatingPill } from "../rating-pill";
import { ScrollRow } from "../scroll-row";
import { EpisodeGrid } from "../episode-grid";
import { Hero } from "./hero";

/** Rows fail soft: one broken TMDb list shouldn't take down the home page. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(err);
    return fallback;
  }
}

export async function HeroSection() {
  const trending = await safe(getTrending, []);
  return <Hero items={trending.slice(0, 6)} />;
}

export async function ListRow({
  list,
  title,
  eyebrow,
  href,
}: {
  list: ListKey;
  title: string;
  eyebrow?: string;
  href?: string;
}) {
  const items = await safe(() => getList(list), []);
  return <MediaRow title={title} eyebrow={eyebrow} href={href} items={items} />;
}

export async function Top10Row() {
  const items = (await safe(getTrending, [])).slice(0, 10);
  if (items.length === 0) return null;
  return (
    <section>
      <SectionHeading title="Top 10 this week" eyebrow="Trending" />
      <ScrollRow itemClassName="w-56 sm:w-64">
        {items.map((item, i) => (
          <Link key={`${item.mediaType}-${item.id}`} href={hrefFor(item)} className="group flex items-end">
            <span
              className="-mr-5 font-display text-[9rem] leading-[0.75] text-transparent transition select-none group-hover:[-webkit-text-stroke-color:var(--accent)] sm:text-[11rem]"
              style={{ WebkitTextStroke: "2px rgb(255 255 255 / 0.35)" }}
            >
              {i + 1}
            </span>
            <div className="relative w-32 shrink-0 transition duration-300 group-hover:-translate-y-1 sm:w-36">
              <Poster id={item.id} title={item.title} path={item.posterPath} size="w342" className="shadow-xl shadow-black/60 ring-1 ring-white/10" />
              <RatingPill score={item.voteAverage} className="absolute top-2 left-2" />
            </div>
          </Link>
        ))}
      </ScrollRow>
    </section>
  );
}

export async function CategoryTiles() {
  const [movies, tv, anime] = await Promise.all([
    safe(() => getList("popular-movies"), []),
    safe(() => getList("popular-tv"), []),
    safe(() => getList("anime-tv"), []),
  ]);
  const tiles = [
    { href: "/movies", title: "Movies", blurb: "Blockbusters, classics & hidden gems", items: movies, tint: "from-amber-500/30" },
    { href: "/tv", title: "TV Shows", blurb: "Every season, every episode rated", items: tv, tint: "from-emerald-500/30" },
    { href: "/anime", title: "Anime", blurb: "Series and films from Japan", items: anime, tint: "from-sky-500/30" },
  ];
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {tiles.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className={`group relative isolate flex h-48 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${tile.tint} to-surface p-6 transition hover:border-white/25`}
        >
          {/* Fanned poster stack */}
          <div className="absolute top-4 right-2 -z-10 flex">
            {tile.items.slice(0, 3).map((m, i) => (
              <div
                key={m.id}
                className="-ml-8 w-[4.5rem] transition duration-500 group-hover:-translate-y-2"
                style={{ transform: `rotate(${(i - 1) * 8}deg) translateY(${i === 1 ? -6 : 6}px)`, zIndex: i === 1 ? 2 : 1 }}
              >
                <Poster id={m.id} title={m.title} path={m.posterPath} size="w185" className="shadow-2xl shadow-black/70 ring-1 ring-white/10" sizes="72px" />
              </div>
            ))}
          </div>
          <div className="mt-auto max-w-[60%]">
            <h3 className="flex items-center gap-1 font-display text-4xl">
              {tile.title}
              <ArrowUpRight className="size-6 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </h3>
            <p className="text-sm text-foreground/70">{tile.blurb}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}

const SHOWCASE_ID = 1396; // Breaking Bad

export async function EpisodeShowcase() {
  const seasons = await safe(() => getSeasonRatings(SHOWCASE_ID, [1, 2, 3, 4, 5]), []);
  if (seasons.length === 0) return null;
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface p-6 sm:p-10">
      <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-md">
          <p className="mb-2 text-xs font-medium tracking-[0.2em] text-accent uppercase">Episode graphs</p>
          <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Every episode, <span className="italic text-accent">rated.</span>
          </h2>
          <p className="mt-4 text-foreground/70">
            Every TV series and anime gets a color-coded grid of its episodes. Spot the peak seasons, the filler and
            the all-time classics at a glance.
          </p>
          <Link
            href={`/tv/${SHOWCASE_ID}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-white"
          >
            Explore Breaking Bad <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="min-w-0">
          <EpisodeGrid seasons={seasons} compact />
        </div>
      </div>
    </section>
  );
}

