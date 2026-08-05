import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-xs tracking-[0.04em] text-mint">
        404
      </span>
      <h1 className="mt-5 font-display text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none tracking-[-0.03em] text-white">
        This clip isn&apos;t in the timeline.
      </h1>
      <p className="mt-5 max-w-sm text-white/55">
        The page you were after has been moved or never existed.
      </p>
      <Link
        href="/"
        className="mt-9 rounded-full bg-mint px-7 py-3.5 text-sm font-bold text-black transition-all hover:bg-mint-bright"
      >
        Back to the studio
      </Link>
    </main>
  );
}
