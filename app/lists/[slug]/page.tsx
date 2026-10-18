import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CURATED_LISTS, findList, getDiscoverListItems, getFinaleEntries } from "@/lib/lists";
import { BrowseHeader } from "@/components/browse";
import { RankedList } from "@/components/ranked-list";
import { formatScore, tierFor } from "@/lib/rating";

export async function generateStaticParams() {
  return CURATED_LISTS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/lists/[slug]">): Promise<Metadata> {
  const list = findList((await params).slug);
  return list ? { title: list.title, description: list.description } : { title: "List not found" };
}

export default async function ListPage({ params }: PageProps<"/lists/[slug]">) {
  const list = findList((await params).slug);
  if (!list) notFound();
  return (
    <>
      <BrowseHeader title={list.title} subtitle={list.description} />
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        <Link href="/lists" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ChevronLeft className="size-4" /> All lists
        </Link>
        <Suspense fallback={<div className="skeleton h-[600px] rounded-2xl" />}>
          {list.kind === "finales" ? <Finales /> : <DiscoverItems slug={list.slug} />}
        </Suspense>
      </div>
    </>
  );
}

async function DiscoverItems({ slug }: { slug: string }) {
  const items = await getDiscoverListItems(slug);
  if (items.length === 0) return <p className="py-16 text-center text-muted">This list is empty right now.</p>;
  return <RankedList items={items} />;
}

async function Finales() {
  const entries = await getFinaleEntries();
  if (entries.length === 0) {
    return <p className="py-16 text-center text-muted">No finale data available yet. Add a TMDb token to build this list.</p>;
  }
  const byId = new Map(entries.map((e) => [e.show.id, e]));
  return (
    <RankedList
      items={entries.map((e) => e.show)}
      extra={(m) => {
        const e = byId.get(m.id)!;
        return (
          <span className="text-foreground/70">
            Finale <span className="text-foreground">“{e.episodeName}”</span>{" "}
            <span className="font-semibold" style={{ color: tierFor(e.finaleScore).color }}>
              {formatScore(e.finaleScore)}
            </span>{" "}
            vs. S{e.seasonNumber} avg {formatScore(e.seasonAverage)}{" "}
            <span className="text-emerald-400">(+{formatScore(e.finaleScore - e.seasonAverage)})</span>
          </span>
        );
      }}
    />
  );
}
