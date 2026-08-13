import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-bold">FruitLens</h1>
      <p className="max-w-sm text-sm text-black/60 dark:text-white/60">
        Point your camera at a fruit to identify it and check freshness.
      </p>
      <Link
        href="/scan"
        className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Start scanning
      </Link>
    </main>
  );
}
