"use client";

import { useMemo, useState } from "react";
import { Trophy, TrendingDown, Sigma } from "lucide-react";
import type { Episode, SeasonRatings } from "@/lib/tmdb/types";
import { RATING_TIERS, average, formatScore, tierFor } from "@/lib/rating";
import { formatDate } from "@/lib/format";

function isRated(e: Episode) {
  return e.voteCount > 0 && e.voteAverage > 0;
}

interface Selected {
  season: number;
  episode: Episode;
}

export function RatingLegend({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground/80 sm:text-sm ${className}`}>
      {RATING_TIERS.map((t) => (
        <li key={t.key} className="flex items-center gap-1.5">
          <span className="size-3 rounded-full" style={{ background: t.color }} />
          {t.label}
        </li>
      ))}
    </ul>
  );
}

export function EpisodeGrid({ seasons, compact = false }: { seasons: SeasonRatings[]; compact?: boolean }) {
  const [selected, setSelected] = useState<Selected | null>(null);

  const stats = useMemo(() => {
    const all = seasons.flatMap((s) => s.episodes.filter(isRated).map((e) => ({ season: s.seasonNumber, episode: e })));
    const sorted = [...all].sort((a, b) => b.episode.voteAverage - a.episode.voteAverage);
    return {
      best: sorted[0] ?? null,
      worst: sorted[sorted.length - 1] ?? null,
      overall: average(all.map((x) => x.episode.voteAverage)),
      rated: all.length,
    };
  }, [seasons]);

  const maxEpisodes = Math.max(0, ...seasons.map((s) => s.episodes.length));
  if (seasons.length === 0 || maxEpisodes === 0) {
    return <p className="text-sm text-muted">No episode ratings available yet.</p>;
  }

  const cell = compact ? "h-8 w-12 text-sm sm:h-9 sm:w-14 sm:text-base" : "h-10 w-14 text-base sm:h-12 sm:w-[4.5rem] sm:text-xl";
  const label = `${compact ? "w-9 text-[11px] bg-surface" : "w-10 text-xs sm:text-sm bg-background"}`;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      {!compact && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            icon={<Sigma className="size-4" />}
            label="Average episode"
            value={stats.overall !== null ? formatScore(stats.overall) : "–"}
            hint={`${stats.rated} rated episodes`}
          />
          {stats.best && (
            <Stat
              icon={<Trophy className="size-4" />}
              label="Best episode"
              value={formatScore(stats.best.episode.voteAverage)}
              hint={`S${stats.best.season}E${stats.best.episode.episodeNumber} · ${stats.best.episode.name}`}
              color={tierFor(stats.best.episode.voteAverage).color}
              onClick={() => setSelected(stats.best)}
            />
          )}
          {stats.worst && (
            <Stat
              icon={<TrendingDown className="size-4" />}
              label="Lowest episode"
              value={formatScore(stats.worst.episode.voteAverage)}
              hint={`S${stats.worst.season}E${stats.worst.episode.episodeNumber} · ${stats.worst.episode.name}`}
              color={tierFor(stats.worst.episode.voteAverage).color}
              onClick={() => setSelected(stats.worst)}
            />
          )}
        </div>
      )}

      <RatingLegend />

      <div className="thin-scrollbar overflow-x-auto pb-3">
        <table className="border-separate border-spacing-1.5 sm:border-spacing-2">
          <thead>
            <tr>
              <th className={label} />
              {seasons.map((s) => (
                <th key={s.seasonNumber} scope="col" className="text-center text-xs font-medium text-muted sm:text-sm">
                  S{s.seasonNumber}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxEpisodes }, (_, row) => (
              <tr key={row}>
                <th scope="row" className={`sticky left-0 z-10 pr-1 text-right font-medium text-muted ${label}`}>
                  E{row + 1}
                </th>
                {seasons.map((s) => {
                  const e = s.episodes[row];
                  if (!e) return <td key={s.seasonNumber} />;
                  const isSel = selected?.season === s.seasonNumber && selected.episode.episodeNumber === e.episodeNumber;
                  if (!isRated(e)) {
                    const upcoming = !e.airDate || e.airDate > today;
                    return (
                      <td key={s.seasonNumber}>
                        <button
                          type="button"
                          onClick={() => setSelected({ season: s.seasonNumber, episode: e })}
                          title={upcoming ? "Not aired yet" : "Not enough votes"}
                          className={`grid place-items-center rounded-md border border-dashed border-white/15 font-semibold text-muted ${cell} ${isSel ? "ring-2 ring-white" : ""}`}
                        >
                          –
                        </button>
                      </td>
                    );
                  }
                  const tier = tierFor(e.voteAverage);
                  return (
                    <td key={s.seasonNumber}>
                      <button
                        type="button"
                        onMouseEnter={() => setSelected({ season: s.seasonNumber, episode: e })}
                        onFocus={() => setSelected({ season: s.seasonNumber, episode: e })}
                        onClick={() => setSelected({ season: s.seasonNumber, episode: e })}
                        aria-label={`Season ${s.seasonNumber} episode ${e.episodeNumber}, ${e.name}: ${formatScore(e.voteAverage)} (${tier.label})`}
                        className={`grid place-items-center rounded-md font-semibold tabular-nums transition hover:scale-110 hover:shadow-lg hover:shadow-black/50 focus-visible:outline-none ${tier.cell} ${cell} ${
                          isSel ? "z-10 scale-110 ring-2 ring-white" : ""
                        }`}
                      >
                        {formatScore(e.voteAverage)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className={`sticky left-0 z-10 pt-2 pr-1 text-right font-medium text-muted ${label}`}>
                AVG.
              </th>
              {seasons.map((s) => {
                const avg = average(s.episodes.filter(isRated).map((e) => e.voteAverage));
                return (
                  <td key={s.seasonNumber} className="pt-2 text-center">
                    <div className={`font-semibold tabular-nums ${compact ? "text-base" : "text-lg sm:text-2xl"}`}>
                      {avg !== null ? formatScore(avg) : "–"}
                    </div>
                    {avg !== null && (
                      <div className="mx-auto mt-1 h-1 w-10 rounded-full" style={{ background: tierFor(avg).color }} />
                    )}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {!compact && <EpisodeDetail selected={selected} />}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  color?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-white/20"
    >
      <span className="text-3xl font-bold tabular-nums" style={color ? { color } : undefined}>
        {value}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          {icon}
          {label}
        </span>
        <span className="mt-0.5 block truncate text-sm">{hint}</span>
      </span>
    </Comp>
  );
}

function EpisodeDetail({ selected }: { selected: Selected | null }) {
  if (!selected) {
    return <p className="text-sm text-muted">Hover or tap an episode to see its details.</p>;
  }
  const { season, episode: e } = selected;
  const rated = isRated(e);
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-surface p-4" aria-live="polite">
      {rated && (
        <span className={`grid size-14 shrink-0 place-items-center rounded-lg text-xl font-bold ${tierFor(e.voteAverage).cell}`}>
          {formatScore(e.voteAverage)}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted">
          S{season} · E{e.episodeNumber} · {formatDate(e.airDate)}
          {rated && ` · ${e.voteCount.toLocaleString("en-US")} votes · ${tierFor(e.voteAverage).label}`}
          {!rated && " · Not rated yet"}
        </p>
        <h4 className="mt-0.5 font-medium">{e.name}</h4>
        {e.overview && <p className="mt-1 line-clamp-2 text-sm text-foreground/70">{e.overview}</p>}
      </div>
    </div>
  );
}
