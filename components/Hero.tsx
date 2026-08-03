"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { nextAvailableSlot } from "@/lib/quote";

// WebGL is client-only and lazily loaded, so it never blocks first paint and
// never ships to a crawler.
const VideoWall = dynamic(() => import("./webgl/VideoWall"), { ssr: false });

const STATS = [
  { value: "1,240", label: "Videos delivered" },
  { value: "+38%", label: "Median retention lift" },
  { value: "34h", label: "Revision turnaround" },
];

export default function Hero() {
  const [showWall, setShowWall] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);

  useEffect(() => {
    // Gate WebGL on pointer + width. Phones get the static treatment, which
    // keeps the largest share of an editing studio's traffic fast.
    const capable =
      window.matchMedia("(min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShowWall(capable);
    setSlot(nextAvailableSlot());
  }, []);

  return (
    <section id="top" className="scene relative min-h-[100svh] overflow-hidden">
      {/* Ambient depth behind the wall */}
      <span
        aria-hidden="true"
        className="orb left-[-10%] top-[-5%] h-[520px] w-[520px] bg-mint/12"
      />
      <span
        aria-hidden="true"
        className="orb right-[-15%] top-[30%] h-[600px] w-[600px] bg-mint/8"
        style={{ animationDelay: "-6s" }}
      />

      {/* The wall sits behind the copy and bleeds off the right edge. */}
      <div className="absolute inset-y-0 right-0 hidden w-[62%] md:block">
        {showWall ? <VideoWall /> : null}
        {/* Feathers the wall into the page so it reads as one space. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/5"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1240px] items-center px-5 pb-28 pt-32 sm:px-8 md:pb-32">
        <div className="w-full md:max-w-[52%]">
          <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-mint">
            <span className="h-px w-7 bg-mint" />
            Video editing studio
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.6rem,8.5vw,5.2rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white">
            Cut for{" "}
            <span className="text-mint [text-shadow:0_0_60px_rgba(27,237,172,.45)]">
              retention
            </span>
            , not applause.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
            Long-form, shorts and product films for teams who publish every week.
            Send the files — get a first cut in five days.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#onboarding"
              className="rounded-full bg-mint px-7 py-4 text-center text-base font-bold text-black shadow-[0_0_30px_-4px_rgba(27,237,172,.65)] transition-all hover:-translate-y-0.5 hover:bg-mint-bright hover:shadow-[0_0_46px_-2px_rgba(27,237,172,.9)]"
            >
              Start a project →
            </Link>
            <Link
              href="#work"
              className="rounded-full border border-white/15 px-7 py-4 text-center text-base font-bold text-white transition-all hover:border-mint/40 hover:bg-white/5"
            >
              See the work
            </Link>
          </div>

          {/* Availability — concrete, and it pre-qualifies. */}
          {slot ? (
            <p className="mt-5 flex items-center gap-2.5 font-mono text-xs text-white/45">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              Next start date: {slot} · 2 slots left this month
            </p>
          ) : null}

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 sm:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-[clamp(1.5rem,5vw,2.25rem)] font-extrabold leading-none tracking-[-0.02em] text-white [text-shadow:0_0_40px_rgba(27,237,172,.25)]">
                  {stat.value}
                </dd>
                <span aria-hidden="true" className="text-xs text-white/45 sm:text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Static hero visual for phones — no WebGL, no layout hole. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 h-[40vh] md:hidden">
        <span className="absolute inset-0 bg-[radial-gradient(120%_100%_at_70%_100%,rgba(27,237,172,.18),transparent_60%)]" />
      </div>
    </section>
  );
}
