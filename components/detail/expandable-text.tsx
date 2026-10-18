"use client";

import { useState } from "react";

export function ExpandableText({ text, limit = 420 }: { text: string; limit?: number }) {
  const [open, setOpen] = useState(false);
  const long = text.length > limit;
  const shown = open || !long ? text : text.slice(0, limit).trimEnd() + "…";
  return (
    <div>
      <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/80">{shown}</p>
      {long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="mt-2 text-sm font-medium text-accent hover:underline">
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
