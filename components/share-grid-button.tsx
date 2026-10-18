"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Link2, Loader2, Share2, Check } from "lucide-react";

export function ShareGridButton({ showId, title }: { showId: number; title: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const imageSrc = `/api/grid/${showId}`;
  const fileName = `${title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase()}-episode-ratings.png`;

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const getFile = async () => {
    const res = await fetch(imageSrc);
    if (!res.ok) throw new Error("Image failed");
    return new File([await res.blob()], fileName, { type: "image/png" });
  };

  const shareImage = async () => {
    setBusy(true);
    try {
      const file = await getFile();
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${title} episode ratings`, url: location.href });
      } else {
        const url = URL.createObjectURL(file);
        const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error(err);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${location.origin}${location.pathname}#episodes`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/[0.07]";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm transition hover:border-white/30"
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Share2 className="size-3.5" />}
        Share
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-white/10 bg-surface/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <button type="button" onClick={shareImage} disabled={busy} className={item}>
            <Download className="size-4 text-muted" />
            Share / download image
          </button>
          <a href={imageSrc} target="_blank" rel="noreferrer" className={item}>
            <Share2 className="size-4 text-muted" />
            Open image in new tab
          </a>
          <button type="button" onClick={copyLink} className={item}>
            {copied ? <Check className="size-4 text-emerald-400" /> : <Link2 className="size-4 text-muted" />}
            {copied ? "Link copied" : "Copy link to graph"}
          </button>
        </div>
      )}
    </div>
  );
}
