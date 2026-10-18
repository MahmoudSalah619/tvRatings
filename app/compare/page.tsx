import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getDetails, getSeasonRatings } from "@/lib/tmdb/api";
import type { MediaDetails, SeasonRatings } from "@/lib/tmdb/types";
import { average, formatScore, tierFor } from "@/lib/rating";
import { yearOf } from "@/lib/format";
import { BrowseHeader, type SearchParams } from "@/components/browse";
import { ShowPicker } from "@/components/compare/show-picker";
import { EpisodeGrid } from "@/components/episode-grid";
import { Poster } from "@/components/poster";

export const metadata: Metadata = { title: "Compare shows" };

const COLORS = ["#38bdf8", "#f472b6"];
const BAR_MAX = 190; // px height of a perfect 10

export default function ComparePage({ searchParams }: PageProps<"/compare">) {
  return (
    <>
      <BrowseHeader title="Compare shows" subtitle="Put two series side by side, season by season and episode by episode." />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}>
          {searchParams.then((sp) => (
            <Comparison sp={sp} />
          ))}
        </Suspense>
      </div>
    </>
  );
}

function idFrom(v: string | string[] | undefined) {
  const n = Number.parseInt(Array.isArray(v) ? v[0] : (v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

interface Side {
  media: MediaDetails;
  seasons: SeasonRatings[];
}

async function loadSide(id: number | null): Promise<Side | null> {
  if (!id) return null;
  const media = await getDetails("tv", id).catch(() => null);
  if (!media) return null;
  const numbers = (media.seasons ?? []).filter((s) => s.seasonNumber > 0 && s.episodeCount > 0).map((s) => s.seasonNumber);
  const seasons = await getSeasonRatings(id, numbers).catch(() => []);
  return { media, seasons };
}

function summarize(side: Side) {
  const rated = side.seasons.flatMap((s) =>
    s.episodes.filter((e) => e.voteCount > 0 && e.voteAverage > 0).map((e) => ({ s: s.seasonNumber, e })),
  );
  const sorted = [...rated].sort((x, y) => y.e.voteAverage - x.e.voteAverage);
  const seasonAvgs = side.seasons.map((s) => ({
    n: s.seasonNumber,
    avg: average(s.episodes.filter((e) => e.voteCount > 0 && e.voteAverage > 0).map((e) => e.voteAverage)),
  }));
  const best = seasonAvgs.filter((x) => x.avg !== null).sort((x, y) => y.avg! - x.avg!)[0];
  return {
    avg: average(rated.map((x) => x.e.voteAverage)),
    bestEpisode: sorted[0],
    worstEpisode: sorted[sorted.length - 1],
    bestSeason: best,
    seasonAvgs,
    rated: rated.length,
  };
}

async function Comparison({ sp }: { sp: SearchParams }) {
  const [a, b] = await Promise.all([loadSide(idFrom(sp.a)), loadSide(idFrom(sp.b))]);
  const sides = [a, b];
  const stats = sides.map((s) => (s ? summarize(s) : null));

  return (
    <div className="space-y-12">
      <div className="grid gap-5 md:grid-cols-2">
        {sides.map((side, i) => (
          <div key={i} className="space-y-4 rounded-3xl border border-border bg-surface p-5" style={{ borderTopColor: COLORS[i], borderTopWidth: 3 }}>
            <ShowPicker slot={i === 0 ? "a" : "b"} currentTitle={side?.media.title} />
            {side ? (
              <Link href={`/tv/${side.media.id}`} className="group flex gap-4">
                <Poster id={side.media.id} title={side.media.title} path={side.media.posterPath} size="w185" sizes="96px" className="w-24 shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-display text-3xl leading-tight group-hover:text-accent">{side.media.title}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {yearOf(side.media.date)} · {side.media.numberOfSeasons} seasons · {side.media.numberOfEpisodes} episodes
                  </p>
                  <p className="mt-2 text-sm text-foreground/70">{side.media.status}</p>
                </div>
              </Link>
            ) : (
              <p className="py-10 text-center text-sm text-muted">Pick a show to compare.</p>
            )}
          </div>
        ))}
      </div>

      {a && b && stats[0] && stats[1] && (
        <>
          <StatTable
            names={[a.media.title, b.media.title]}
            rows={[
              ["TMDb rating", a.media.voteAverage, b.media.voteAverage],
              ["Average episode", stats[0].avg, stats[1].avg],
              ["Best season average", stats[0].bestSeason?.avg ?? null, stats[1].bestSeason?.avg ?? null],
              ["Best episode", stats[0].bestEpisode?.e.voteAverage ?? null, stats[1].bestEpisode?.e.voteAverage ?? null],
              ["Lowest episode", stats[0].worstEpisode?.e.voteAverage ?? null, stats[1].worstEpisode?.e.voteAverage ?? null],
            ]}
            notes={[
              [
                null,
                null,
                stats[0].bestSeason ? `Season ${stats[0].bestSeason.n}` : null,
                stats[0].bestEpisode ? `S${stats[0].bestEpisode.s}E${stats[0].bestEpisode.e.episodeNumber} · ${stats[0].bestEpisode.e.name}` : null,
                stats[0].worstEpisode ? `S${stats[0].worstEpisode.s}E${stats[0].worstEpisode.e.episodeNumber} · ${stats[0].worstEpisode.e.name}` : null,
              ],
              [
                null,
                null,
                stats[1].bestSeason ? `Season ${stats[1].bestSeason.n}` : null,
                stats[1].bestEpisode ? `S${stats[1].bestEpisode.s}E${stats[1].bestEpisode.e.episodeNumber} · ${stats[1].bestEpisode.e.name}` : null,
                stats[1].worstEpisode ? `S${stats[1].worstEpisode.s}E${stats[1].worstEpisode.e.episodeNumber} · ${stats[1].worstEpisode.e.name}` : null,
              ],
            ]}
          />
          <SeasonBars names={[a.media.title, b.media.title]} series={[stats[0].seasonAvgs, stats[1].seasonAvgs]} />
        </>
      )}

      {sides.map(
        (side, i) =>
          side && (
            <section key={i}>
              <h2 className="mb-5 flex items-center gap-3 font-display text-3xl tracking-tight">
                <span className="size-3 rounded-full" style={{ background: COLORS[i] }} />
                {side.media.title}
              </h2>
              <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
                <EpisodeGrid seasons={side.seasons} compact />
              </div>
            </section>
          ),
      )}
    </div>
  );
}

function StatTable({
  names,
  rows,
  notes,
}: {
  names: [string, string];
  rows: [string, number | null, number | null][];
  notes: (string | null)[][];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Metric</th>
            {names.map((n, i) => (
              <th key={n} className="px-4 py-3 font-medium">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="truncate">{n}</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-surface">
          {rows.map(([label, x, y], r) => (
            <tr key={label}>
              <td className="px-4 py-3 text-muted">{label}</td>
              {[x, y].map((v, i) => {
                const other = i === 0 ? y : x;
                const wins = v !== null && other !== null && v > other;
                return (
                  <td key={i} className="px-4 py-3">
                    <span className={`text-lg font-bold tabular-nums ${wins ? "" : "opacity-70"}`} style={v !== null ? { color: tierFor(v).color } : undefined}>
                      {v !== null ? formatScore(v) : "–"}
                    </span>
                    {wins && <span className="ml-2 text-xs text-emerald-400">▲</span>}
                    {notes[i][r] && <span className="mt-0.5 block truncate text-xs text-muted">{notes[i][r]}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function SeasonBars({
  names,
  series,
}: {
  names: [string, string];
  series: { n: number; avg: number | null }[][];
}) {
  const count = Math.max(...series.map((s) => s.length));
  const all = series.flat().map((x) => x.avg).filter((v): v is number => v !== null);
  const floor = Math.max(0, Math.floor(Math.min(...all) * 2) / 2 - 0.5);
  return (
    <section>
      <h2 className="mb-1 font-display text-3xl tracking-tight">Season averages</h2>
      <p className="mb-5 flex flex-wrap gap-4 text-sm text-muted">
        {names.map((n, i) => (
          <span key={n} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: COLORS[i] }} />
            {n}
          </span>
        ))}
      </p>
      <div className="thin-scrollbar overflow-x-auto rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-end gap-4">
          {Array.from({ length: count }, (_, idx) => (
            <div key={idx} className="flex min-w-14 flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-end justify-center gap-1" style={{ height: BAR_MAX + 18 }}>
                {series.map((s, i) => {
                  const v = s[idx]?.avg ?? null;
                  return (
                    <div key={i} className="flex w-5 flex-col justify-end" title={v !== null ? `${names[i]} S${idx + 1}: ${formatScore(v)}` : undefined}>
                      {v !== null && (
                        <>
                          <span className="mb-1 text-center text-[10px] font-semibold tabular-nums">{formatScore(v)}</span>
                          <div
                            className="rounded-t-md"
                            style={{ height: Math.max(4, ((v - floor) / (10 - floor)) * BAR_MAX), background: COLORS[i] }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-xs text-muted">S{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
