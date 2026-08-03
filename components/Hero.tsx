"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import MobileReel from "./MobileReel";
import { nextAvailableSlot } from "@/lib/quote";

// WebGL is client-only and lazily loaded, so it never blocks first paint and
// never ships to a crawler.
const VideoWall = dynamic(() => import("./webgl/VideoWall"), { ssr: false });

const REEL_SRC = "/reels/showreel-multicam.mp4";

const STATS = [
  { value: "1,240", label: "Videos delivered" },
  { value: "+38%", label: "Median retention lift" },
  { value: "34h", label: "Revision turnaround" },
];

export default function Hero() {
  const [showWall, setShowWall] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [cinema, setCinema] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Gate WebGL on width + motion preference. Phones get the film-strip
    // treatment, which keeps the largest share of the traffic fast.
    const capable =
      window.matchMedia("(min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShowWall(capable);
    setReady(true);
    setSlot(nextAvailableSlot());
  }, []);

  const onCinemaChange = useCallback((open: boolean) => setCinema(open), []);

  // No `.scene` on this section: its `perspective` would make the hero the
  // containing block for the fixed cinema frame, sizing it to the section
  // (898px) rather than the viewport (813px) and pushing the HUD off screen.
  // The hero's depth comes from WebGL, not CSS 3D.
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      <span
        aria-hidden="true"
        className="orb left-[-10%] top-[-5%] h-[520px] w-[520px] bg-mint/12"
      />
      <span
        aria-hidden="true"
        className="orb right-[-15%] top-[30%] h-[600px] w-[600px] bg-mint/8"
        style={{ animationDelay: "-6s" }}
      />

      {/* The wall bleeds off the right edge at rest and takes the whole frame
          once an angle is promoted — the page becomes the cinema rather than
          opening one on top of itself. */}
      <div
        className={`hidden md:block ${
          cinema
            ? // Fixed to the viewport, not the section: the hero is taller than
              // one screen, so an absolutely-positioned frame would push the
              // bottom of the HUD below the fold.
              "fixed inset-0 z-40 bg-black"
            : "absolute inset-y-0 right-0 w-[62%]"
        }`}
      >
        {showWall ? <VideoWall onCinemaChange={onCinemaChange} /> : null}

        {/* Feathering fades out in cinema so nothing sits over the picture. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/5 transition-opacity duration-700 ${
            cinema ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent transition-opacity duration-700 ${
            cinema ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      <div
        className={`relative z-10 mx-auto flex min-h-[100svh] max-w-[1240px] items-center px-5 pb-28 pt-32 transition-all duration-500 sm:px-8 md:pb-32 ${
          cinema ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="w-full md:max-w-[52%]">
          <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-mint">
            <span className="h-px w-7 bg-mint" />
            Video editing studio
          </span>

          <h1 className="h-hero mt-6 font-display font-extrabold text-white">
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

          {/* Shown only when the WebGL bay is not running — phones, and
              desktop with reduced motion. Gated on `ready` so a desktop
              visitor never mounts it, since a hidden <video> still downloads
              and decodes. */}
          {ready && !showWall ? (
            <div className="mt-9 max-w-md">
              <MobileReel src={REEL_SRC} />
            </div>
          ) : null}

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
    </section>
  );
}
