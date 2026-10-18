"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Horizontal snap-scrolling row with desktop arrow buttons. */
export function ScrollRow({ children, itemClassName = "w-36 sm:w-44 2xl:w-48" }: { children: React.ReactNode[]; itemClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="group/row relative">
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute top-[38%] -left-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-background/80 opacity-0 backdrop-blur transition group-hover/row:opacity-100 hover:bg-surface-2 md:grid"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute top-[38%] -right-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-background/80 opacity-0 backdrop-blur transition group-hover/row:opacity-100 hover:bg-surface-2 md:grid"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
