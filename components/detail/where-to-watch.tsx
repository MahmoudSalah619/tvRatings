"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MonitorPlay } from "lucide-react";
import type { Provider, WatchProviders } from "@/lib/tmdb/types";
import { imageUrl } from "@/lib/tmdb/client";

const STORAGE_KEY = "reel:region";

function guessRegion(available: string[]): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && available.includes(saved)) return saved;
  } catch {}
  for (const lang of navigator.languages ?? [navigator.language]) {
    const region = lang.split("-")[1]?.toUpperCase();
    if (region && available.includes(region)) return region;
  }
  return available.includes("US") ? "US" : available[0];
}

export function WhereToWatch({ providers }: { providers: WatchProviders }) {
  const regions = useMemo(() => Object.keys(providers).sort(), [providers]);
  const [region, setRegion] = useState<string | null>(null);

  useEffect(() => {
    if (regions.length) setRegion(guessRegion(regions));
  }, [regions]);

  const names = useMemo(() => {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      return null;
    }
  }, []);
  const regionName = (code: string) => names?.of(code) ?? code;

  const current = region ? providers[region] : undefined;
  const groups: [string, Provider[]][] = current
    ? [
        ["Stream", current.stream],
        ["Free", current.free],
        ["Rent", current.rent],
        ["Buy", current.buy],
      ].filter((g): g is [string, Provider[]] => (g[1] as Provider[]).length > 0)
    : [];

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Where to watch</h2>
        {/* Rendered after mount only: region names differ between Node's and the browser's ICU data. */}
        {region !== null && (
          <label className="flex items-center gap-2 text-sm text-muted">
            Region
            <select
              value={region ?? ""}
              onChange={(e) => {
                setRegion(e.target.value);
                try {
                  localStorage.setItem(STORAGE_KEY, e.target.value);
                } catch {}
              }}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:border-accent/60 focus:outline-none"
            >
              {[...regions].sort((x, y) => regionName(x).localeCompare(regionName(y))).map((r) => (
                <option key={r} value={r}>
                  {regionName(r)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {regions.length === 0 ? (
        <Empty text="No streaming information is available for this title yet." />
      ) : !current ? (
        <div className="skeleton h-24 rounded-2xl" />
      ) : groups.length === 0 ? (
        <Empty text={`Not available to stream in ${regionName(region!)} right now.`} />
      ) : (
        <div className="space-y-5 rounded-2xl border border-border bg-surface p-5">
          {groups.map(([label, list]) => (
            <div key={label} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <span className="w-16 shrink-0 text-xs font-medium tracking-wider text-muted uppercase">{label}</span>
              <ul className="flex flex-wrap gap-3">
                {list.map((p) => {
                  const logo = imageUrl(p.logoPath, "w92");
                  return (
                    <li key={p.id}>
                      <a
                        href={current.link}
                        target="_blank"
                        rel="noreferrer"
                        title={`${label} on ${p.name}`}
                        className="group flex items-center gap-2 rounded-xl border border-white/5 bg-surface-2 py-1.5 pr-3 pl-1.5 text-sm transition hover:border-white/20"
                      >
                        {logo ? (
                          <Image src={logo} alt="" width={32} height={32} className="rounded-lg" />
                        ) : (
                          <MonitorPlay className="size-8 p-1.5 text-muted" />
                        )}
                        {p.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p className="text-xs text-muted">
            Availability data by{" "}
            <a href="https://www.justwatch.com/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
              JustWatch
            </a>{" "}
            via TMDb.
          </p>
        </div>
      )}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
      <MonitorPlay className="size-5" />
      {text}
    </div>
  );
}
