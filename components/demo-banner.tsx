import { isDemoMode } from "@/lib/tmdb/client";

export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div className="bg-accent/10 px-4 py-2 text-center text-xs text-accent">
      Demo mode: showing sample data. Add <code className="font-mono">TMDB_TOKEN</code> to{" "}
      <code className="font-mono">.env.local</code> to load every title from TMDb.
    </div>
  );
}
