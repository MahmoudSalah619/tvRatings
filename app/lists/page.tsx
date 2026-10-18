import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CURATED_LISTS, getDiscoverListItems, getFinaleEntries, type CuratedList } from "@/lib/lists";
import { BrowseHeader } from "@/components/browse";
import { Poster } from "@/components/poster";

export const metadata: Metadata = { title: "Curated lists" };

export default function ListsPage() {
  return (
    <>
      <BrowseHeader title="Curated lists" subtitle="Rankings built from millions of TMDb ratings and episode-by-episode data." />
      <div className="mx-auto grid max-w-7xl 2xl:max-w-[100rem] gap-5 px-4 pt-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {CURATED_LISTS.map((list) => (
          <Suspense key={list.slug} fallback={<div className="skeleton h-64 rounded-3xl" />}>
            <ListCard list={list} />
          </Suspense>
        ))}
      </div>
    </>
  );
}

async function ListCard({ list }: { list: CuratedList }) {
  const posters =
    list.kind === "finales"
      ? (await getFinaleEntries().catch(() => [])).map((e) => e.show)
      : await getDiscoverListItems(list.slug).catch(() => []);
  return (
    <Link
      href={`/lists/${list.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition hover:border-white/25"
    >
      <div className="relative flex h-40 items-end justify-center gap-0 overflow-hidden bg-gradient-to-b from-surface-2 to-surface pt-6">
        {posters.slice(0, 5).map((m, i) => (
          <div
            key={m.id}
            className="-mx-3 w-24 transition duration-500 group-hover:-translate-y-2"
            style={{ transform: `rotate(${(i - 2) * 6}deg) translateY(${Math.abs(i - 2) * 10 + 16}px)`, zIndex: 5 - Math.abs(i - 2) }}
          >
            <Poster id={m.id} title={m.title} path={m.posterPath} size="w185" sizes="96px" className="shadow-xl shadow-black/60 ring-1 ring-white/10" />
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="flex items-start justify-between gap-2 font-display text-2xl leading-tight">
          {list.title}
          <ArrowUpRight className="mt-1 size-5 shrink-0 opacity-0 transition group-hover:opacity-100" />
        </h2>
        <p className="mt-1.5 text-sm text-foreground/65">{list.description}</p>
      </div>
    </Link>
  );
}
