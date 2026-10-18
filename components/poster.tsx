import Image from "next/image";
import { imageUrl, type ImageSize } from "@/lib/tmdb/client";

/** Stable hue per title so placeholders look intentional instead of broken. */
function hueFor(id: number) {
  return (id * 47) % 360;
}

export function Poster({
  id,
  title,
  path,
  size = "w342",
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 40vw, 200px",
}: {
  id: number;
  title: string;
  path: string | null;
  size?: ImageSize;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const src = imageUrl(path, size);
  return (
    <div className={`relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-2 ${className}`}>
      {src ? (
        <Image src={src} alt={title} fill sizes={sizes} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} className="object-cover" />
      ) : (
        <PosterPlaceholder id={id} title={title} />
      )}
    </div>
  );
}

export function PosterPlaceholder({ id, title }: { id: number; title: string }) {
  const h = hueFor(id);
  return (
    <div
      className="absolute inset-0 flex items-end p-3"
      style={{
        background: `radial-gradient(120% 80% at 20% 0%, hsl(${h} 70% 45% / 0.9), transparent 60%), linear-gradient(160deg, hsl(${(h + 40) % 360} 60% 22%), hsl(${(h + 200) % 360} 40% 10%))`,
      }}
    >
      <span className="font-display text-xl leading-tight text-white/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.5)]">
        {title}
      </span>
    </div>
  );
}

export function Backdrop({
  id,
  title,
  path,
  className = "",
  priority = false,
}: {
  id: number;
  title: string;
  path: string | null;
  className?: string;
  priority?: boolean;
}) {
  const src = imageUrl(path, "w1280");
  const h = hueFor(id);
  if (src) {
    return <Image src={src} alt="" fill loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} sizes="100vw" className={`object-cover ${className}`} />;
  }
  return (
    <div
      aria-label={title}
      className={`absolute inset-0 ${className}`}
      style={{
        background: `radial-gradient(60% 80% at 75% 30%, hsl(${h} 70% 40% / 0.75), transparent 70%), radial-gradient(50% 60% at 20% 80%, hsl(${(h + 120) % 360} 60% 30% / 0.6), transparent 70%), #0b0b10`,
      }}
    />
  );
}
