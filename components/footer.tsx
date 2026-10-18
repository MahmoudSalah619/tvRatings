import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-md text-xs text-muted">
            This product uses the TMDb API but is not endorsed or certified by TMDb. Ratings and reviews are provided by{" "}
            <a href="https://www.themoviedb.org/" className="underline hover:text-foreground" target="_blank" rel="noreferrer">
              The Movie Database
            </a>
            .
          </p>
        </div>
        <ul className="flex gap-5 text-sm text-muted">
          <li>
            <Link href="/movies" className="hover:text-foreground">
              Movies
            </Link>
          </li>
          <li>
            <Link href="/tv" className="hover:text-foreground">
              TV Shows
            </Link>
          </li>
          <li>
            <Link href="/anime" className="hover:text-foreground">
              Anime
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
