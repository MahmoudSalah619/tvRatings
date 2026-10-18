import { ImageResponse } from "next/og";
import { getDetails, getSeasonRatings } from "@/lib/tmdb/api";
import { imageUrl } from "@/lib/tmdb/client";
import { RATING_TIERS, average, formatScore, tierFor } from "@/lib/rating";

// Satori can't read Tailwind classes, so mirror the tier colors as text/background pairs.
const TEXT_ON: Record<string, string> = {
  cinema: "#ffffff",
  awesome: "#ffffff",
  great: "#052e16",
  good: "#422006",
  regular: "#431407",
  bad: "#ffffff",
  garbage: "#ffffff",
};

/** Renders a show's episode grid as a shareable PNG. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number.parseInt((await params).id, 10);
  const media = Number.isFinite(id) ? await getDetails("tv", id).catch(() => null) : null;
  if (!media) return new Response("Not found", { status: 404 });

  const seasonNumbers = (media.seasons ?? []).filter((s) => s.seasonNumber > 0 && s.episodeCount > 0).map((s) => s.seasonNumber);
  const seasons = await getSeasonRatings(id, seasonNumbers);
  const maxEp = Math.max(1, ...seasons.map((s) => s.episodes.length));

  // Shrink cells for very long shows so the image stays a sane size.
  const cellW = Math.max(30, Math.min(64, Math.floor(1700 / Math.max(seasons.length, 1)) - 8));
  const cellH = Math.max(22, Math.min(46, Math.floor(1500 / maxEp) - 8));
  const gap = 6;
  const sidebar = 300;
  const width = sidebar + 80 + seasons.length * (cellW + gap) + 60;
  const height = Math.max(1100, 120 + maxEp * (cellH + gap) + 90);
  const fontSize = Math.round(Math.min(cellW * 0.38, cellH * 0.5));

  const poster = imageUrl(media.posterPath, "w342");
  const rated = seasons.flatMap((s) => s.episodes.filter((e) => e.voteCount > 0 && e.voteAverage > 0));
  const overall = average(rated.map((e) => e.voteAverage));

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0b0b0e", color: "#ededf0", padding: 40, gap: 36 }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", width: sidebar, gap: 18 }}>
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} width={sidebar} height={sidebar * 1.5} style={{ borderRadius: 16, objectFit: "cover", flexShrink: 0 }} alt="" />
          ) : (
            <div style={{ display: "flex", flexShrink: 0, width: sidebar, height: sidebar * 1.5, borderRadius: 16, background: "#1a1a21" }} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, color: "#a1a1aa" }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#f5b83d" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {overall !== null ? formatScore(overall) : "–"} avg. ({rated.length} rated)
          </div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>{media.title}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, fontSize: 17, color: "#d4d4d8" }}>
            {RATING_TIERS.map((t) => (
              <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: t.color }} />
                {t.label}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontSize: 18, color: "#f5b83d" }}>ReelRatings</div>
        </div>

        {/* Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", gap }}>
            {/* Row labels */}
            <div style={{ display: "flex", flexDirection: "column", gap, width: 48 }}>
              <div style={{ display: "flex", height: 28 }} />
              {Array.from({ length: maxEp }, (_, i) => (
                <div key={i} style={{ display: "flex", height: cellH, alignItems: "center", justifyContent: "flex-end", fontSize: 15, color: "#a1a1aa" }}>
                  E{i + 1}
                </div>
              ))}
              <div style={{ display: "flex", height: 44, alignItems: "center", justifyContent: "flex-end", fontSize: 15, color: "#a1a1aa" }}>
                AVG.
              </div>
            </div>

            {seasons.map((s) => {
              const avg = average(s.episodes.filter((e) => e.voteCount > 0 && e.voteAverage > 0).map((e) => e.voteAverage));
              return (
                <div key={s.seasonNumber} style={{ display: "flex", flexDirection: "column", gap, width: cellW }}>
                  <div style={{ display: "flex", height: 28, justifyContent: "center", alignItems: "center", fontSize: 16, color: "#a1a1aa" }}>
                    S{s.seasonNumber}
                  </div>
                  {Array.from({ length: maxEp }, (_, i) => {
                    const e = s.episodes[i];
                    if (!e) return <div key={i} style={{ display: "flex", height: cellH }} />;
                    const ok = e.voteCount > 0 && e.voteAverage > 0;
                    const tier = ok ? tierFor(e.voteAverage) : null;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          height: cellH,
                          borderRadius: 6,
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize,
                          fontWeight: 700,
                          background: tier ? tier.color : "transparent",
                          color: tier ? TEXT_ON[tier.key] : "#52525b",
                          border: tier ? "none" : "1px dashed #3f3f46",
                        }}
                      >
                        {ok ? formatScore(e.voteAverage) : "–"}
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", flexDirection: "column", height: 44, alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <div style={{ display: "flex", fontSize: fontSize + 2, fontWeight: 700 }}>{avg !== null ? formatScore(avg) : "–"}</div>
                    {avg !== null && <div style={{ display: "flex", width: cellW * 0.7, height: 4, borderRadius: 2, background: tierFor(avg).color }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: { "cache-control": "public, max-age=86400" },
    },
  );
}
