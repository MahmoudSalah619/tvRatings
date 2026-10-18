"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-2 text-muted">We couldn&apos;t reach TMDb just now. Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-white"
      >
        Try again
      </button>
    </div>
  );
}
