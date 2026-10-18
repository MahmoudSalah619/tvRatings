"use client";

import type { Episode, SeasonRatings } from "@/lib/tmdb/types";
import { average, formatScore, tierFor } from "@/lib/rating";

interface Point {
  x: number;
  y: number;
  season: number;
  episode: Episode;
}

const HEIGHT = 340;
const PAD = { top: 20, right: 24, bottom: 44, left: 40 };
const STEP = 16; // px between episodes
const SEASON_GAP = 18; // extra px between seasons
const SEASON_COLORS = ["#38bdf8", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#fb923c"];

function isRated(e: Episode) {
  return e.voteCount > 0 && e.voteAverage > 0;
}

export function EpisodeChart({
  seasons,
  selected,
  onSelect,
}: {
  seasons: SeasonRatings[];
  selected: { season: number; episode: Episode } | null;
  onSelect: (s: { season: number; episode: Episode }) => void;
}) {
  // Lay out x positions sequentially across seasons, with a gap between seasons.
  let x = PAD.left + 10;
  const groups = seasons.map((s) => {
    const startX = x;
    const points: Point[] = [];
    for (const e of s.episodes) {
      if (isRated(e)) points.push({ x, y: e.voteAverage, season: s.seasonNumber, episode: e });
      x += STEP;
    }
    const endX = x - STEP;
    x += SEASON_GAP;
    return { season: s, startX, endX, points, avg: average(points.map((p) => p.y)) };
  });
  const width = Math.max(640, x - SEASON_GAP + PAD.right);

  const all = groups.flatMap((g) => g.points.map((p) => p.y));
  if (all.length === 0) return <p className="text-sm text-muted">No rated episodes to chart yet.</p>;
  const minY = Math.max(0, Math.floor(Math.min(...all)) - 0.5);
  const maxY = 10;
  const yScale = (v: number) => PAD.top + ((maxY - v) / (maxY - minY)) * (HEIGHT - PAD.top - PAD.bottom);

  const ticks: number[] = [];
  for (let t = Math.ceil(minY); t <= maxY; t++) ticks.push(t);

  return (
    <div className="thin-scrollbar overflow-x-auto rounded-2xl border border-border bg-surface pb-1">
      <svg width={width} height={HEIGHT} role="img" aria-label="Episode ratings line chart" className="block">
        {/* Grid lines */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={yScale(t)} y2={yScale(t)} stroke="rgb(255 255 255 / 0.06)" />
            <text x={PAD.left - 10} y={yScale(t)} dy="0.32em" textAnchor="end" className="fill-[var(--muted)] text-[11px]">
              {t}
            </text>
          </g>
        ))}

        {groups.map((g, gi) => {
          const color = SEASON_COLORS[gi % SEASON_COLORS.length];
          const path = g.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${yScale(p.y)}`).join(" ");
          return (
            <g key={g.season.seasonNumber}>
              {/* Season band label */}
              <text
                x={(g.startX + g.endX) / 2}
                y={HEIGHT - PAD.bottom + 26}
                textAnchor="middle"
                className="fill-[var(--muted)] text-[11px] font-medium"
              >
                S{g.season.seasonNumber}
              </text>
              <line
                x1={g.startX - 4}
                x2={g.endX + 4}
                y1={HEIGHT - PAD.bottom + 10}
                y2={HEIGHT - PAD.bottom + 10}
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.6}
              />
              {/* Season average */}
              {g.avg !== null && (
                <line
                  x1={g.startX - 4}
                  x2={g.endX + 4}
                  y1={yScale(g.avg)}
                  y2={yScale(g.avg)}
                  stroke={color}
                  strokeDasharray="3 4"
                  opacity={0.45}
                >
                  <title>{`Season ${g.season.seasonNumber} average: ${formatScore(g.avg)}`}</title>
                </line>
              )}
              <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" opacity={0.85} />
              {g.points.map((p) => {
                const isSel = selected?.season === p.season && selected.episode.episodeNumber === p.episode.episodeNumber;
                return (
                  <circle
                    key={p.episode.episodeNumber}
                    cx={p.x}
                    cy={yScale(p.y)}
                    r={isSel ? 6.5 : 4.5}
                    fill={tierFor(p.y).color}
                    stroke={isSel ? "#fff" : "var(--surface)"}
                    strokeWidth={isSel ? 2.5 : 1.5}
                    className="cursor-pointer transition-[r]"
                    onMouseEnter={() => onSelect({ season: p.season, episode: p.episode })}
                    onClick={() => onSelect({ season: p.season, episode: p.episode })}
                  >
                    <title>{`S${p.season}E${p.episode.episodeNumber} · ${p.episode.name} · ${formatScore(p.y)}`}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
