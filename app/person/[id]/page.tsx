import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getPerson } from "@/lib/tmdb/api";
import { imageUrl } from "@/lib/tmdb/client";
import { formatDate } from "@/lib/format";
import { getToday } from "@/lib/today";
import { parseId } from "@/components/detail/detail-page";
import { ExpandableText } from "@/components/detail/expandable-text";
import { MediaRow } from "@/components/media-row";
import { Filmography } from "@/components/person/filmography";

export async function generateMetadata({ params }: PageProps<"/person/[id]">): Promise<Metadata> {
  const person = await getPerson(Number.parseInt((await params).id, 10)).catch(() => null);
  return person ? { title: person.name, description: person.biography.slice(0, 160) } : { title: "Person not found" };
}

export default function PersonPage({ params }: PageProps<"/person/[id]">) {
  return (
    <Suspense fallback={<PersonSkeleton />}>
      {params.then(({ id }) => (
        <PersonContent id={parseId(id)} />
      ))}
    </Suspense>
  );
}

const NON_SCRIPTED_GENRES = [10763, 10764, 10767]; // News, Reality, Talk
const SELF_ROLE = /\b(self|himself|herself|themselves)\b/i;

function age(birthday: string, until: string) {
  const end = new Date(until);
  const b = new Date(birthday);
  let years = end.getUTCFullYear() - b.getUTCFullYear();
  const beforeBirthday =
    end.getUTCMonth() < b.getUTCMonth() || (end.getUTCMonth() === b.getUTCMonth() && end.getUTCDate() < b.getUTCDate());
  if (beforeBirthday) years--;
  return years;
}

async function PersonContent({ id }: { id: number }) {
  const [person, today] = await Promise.all([getPerson(id), getToday()]);
  if (!person) notFound();
  const photo = imageUrl(person.profilePath, "w500");
  // "Known for": their most-voted credits in their main department, skipping talk/news/reality
  // shows and appearances as themselves, which otherwise crowd out real roles.
  const knownFor = person.credits
    .filter((c) => (person.knownFor === "Acting" ? c.department === "Acting" : c.department !== "Acting"))
    .filter((c) => !c.genreIds.some((g) => NON_SCRIPTED_GENRES.includes(g)) && !SELF_ROLE.test(c.role))
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 14);

  const facts: [string, string][] = [];
  if (person.knownFor) facts.push(["Known for", person.knownFor]);
  if (person.birthday) {
    facts.push(["Born", `${formatDate(person.birthday)}${person.deathday ? "" : ` (age ${age(person.birthday, today)})`}`]);
  }
  if (person.deathday) {
    facts.push([
      "Died",
      `${formatDate(person.deathday)}${person.birthday ? ` (aged ${age(person.birthday, person.deathday)})` : ""}`,
    ]);
  }
  if (person.placeOfBirth) facts.push(["Birthplace", person.placeOfBirth]);
  facts.push(["Credits", String(person.credits.length)]);

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 pt-10 sm:px-6">
      <header className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden rounded-2xl bg-surface-2 shadow-2xl shadow-black/60 ring-1 ring-white/10 sm:w-60 md:w-full">
          {photo ? (
            <Image src={photo} alt={person.name} fill loading="eager" fetchPriority="high" sizes="260px" className="object-cover" />
          ) : (
            <span className="grid h-full place-items-center font-display text-7xl text-muted">{person.name.slice(0, 1)}</span>
          )}
        </div>
        <div className="animate-fade-up">
          <h1 className="font-display text-5xl tracking-tight sm:text-6xl lg:text-7xl">{person.name}</h1>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {facts.map(([k, v]) => (
              <div key={k} className="text-sm">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {person.biography && (
            <div className="mt-6 max-w-3xl">
              <ExpandableText text={person.biography} limit={700} />
            </div>
          )}
          <div className="mt-6 flex gap-3">
            {person.imdbId && (
              <a
                href={`https://www.imdb.com/name/${person.imdbId}/`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10"
              >
                IMDb <ExternalLink className="size-3.5" />
              </a>
            )}
            <a
              href={`https://www.themoviedb.org/person/${person.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10"
            >
              TMDb <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </header>

      <MediaRow title="Known for" items={knownFor} />
      {person.credits.length > 0 && <Filmography credits={person.credits} />}
    </div>
  );
}

function PersonSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 sm:px-6 md:grid-cols-[260px_1fr]">
      <div className="skeleton mx-auto aspect-[2/3] w-48 rounded-2xl sm:w-60 md:w-full" />
      <div className="space-y-4">
        <div className="skeleton h-16 w-2/3 rounded-xl" />
        <div className="skeleton h-4 w-full max-w-2xl rounded" />
        <div className="skeleton h-4 w-3/4 max-w-xl rounded" />
      </div>
    </div>
  );
}
