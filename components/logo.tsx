export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-8 grid-cols-2 gap-0.5 rounded-lg bg-surface-2 p-1.5 ring-1 ring-white/10">
        <span className="rounded-[2px] bg-sky-500" />
        <span className="rounded-[2px] bg-emerald-700" />
        <span className="rounded-[2px] bg-emerald-500" />
        <span className="rounded-[2px] bg-yellow-400" />
      </span>
      <span className="font-display text-2xl leading-none tracking-tight">
        Reel<span className="text-accent italic">Ratings</span>
      </span>
    </span>
  );
}
