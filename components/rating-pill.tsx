import { Star } from "lucide-react";
import { formatScore, tierFor } from "@/lib/rating";

export function RatingPill({ score, className = "" }: { score: number; className?: string }) {
  if (!score) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-muted backdrop-blur ${className}`}>
        NR
      </span>
    );
  }
  const tier = tierFor(score);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-xs font-semibold tabular-nums backdrop-blur ${className}`}
      title={tier.label}
    >
      <Star className="size-3" fill={tier.color} stroke="none" />
      {formatScore(score)}
    </span>
  );
}

/** Large circular score used on detail pages. */
export function ScoreRing({ score, votes }: { score: number; votes: number }) {
  const tier = tierFor(score);
  const pct = Math.max(0, Math.min(100, score * 10));
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative grid size-16 place-items-center rounded-full"
        style={{ background: `conic-gradient(${tier.color} ${pct}%, rgb(255 255 255 / 0.08) 0)` }}
      >
        <div className="grid size-[54px] place-items-center rounded-full bg-background">
          <span className="text-lg font-bold tabular-nums">{score ? formatScore(score) : "–"}</span>
        </div>
      </div>
      <div className="text-sm leading-tight">
        <div className="font-medium" style={{ color: tier.color }}>
          {score ? tier.label : "Not rated"}
        </div>
        <div className="text-muted">{votes.toLocaleString("en-US")} votes on TMDb</div>
      </div>
    </div>
  );
}
