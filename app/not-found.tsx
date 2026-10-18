import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <p className="font-display text-8xl text-accent">404</p>
      <h1 className="mt-4 font-display text-4xl">This reel is missing</h1>
      <p className="mt-2 text-muted">We couldn&apos;t find that title. It may have been removed from TMDb.</p>
      <Link href="/" className="mt-8 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-white">
        Back to home
      </Link>
    </div>
  );
}
