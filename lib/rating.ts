export interface RatingTier {
  key: string;
  label: string;
  min: number;
  /** Tailwind classes for a filled rating cell. */
  cell: string;
  /** Hex color for dots and accents. */
  color: string;
}

// Thresholds mirror the SeriesGraph-style legend (highest first).
export const RATING_TIERS: RatingTier[] = [
  { key: "cinema", label: "Absolute Cinema", min: 9.7, cell: "bg-sky-500 text-white", color: "#0ea5e9" },
  { key: "awesome", label: "Awesome", min: 9.0, cell: "bg-emerald-800 text-white", color: "#166534" },
  { key: "great", label: "Great", min: 8.0, cell: "bg-emerald-500 text-emerald-950", color: "#22c55e" },
  { key: "good", label: "Good", min: 7.0, cell: "bg-yellow-400 text-yellow-950", color: "#facc15" },
  { key: "regular", label: "Regular", min: 6.0, cell: "bg-orange-500 text-orange-950", color: "#f97316" },
  { key: "bad", label: "Bad", min: 5.0, cell: "bg-red-500 text-white", color: "#ef4444" },
  { key: "garbage", label: "Garbage", min: 0, cell: "bg-purple-700 text-white", color: "#7e22ce" },
];

export function tierFor(score: number): RatingTier {
  return RATING_TIERS.find((t) => score >= t.min) ?? RATING_TIERS[RATING_TIERS.length - 1];
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
