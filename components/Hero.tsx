"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HeroMedia from "./HeroMedia";
import { CLIENTS } from "@/lib/data";
import { nextAvailableSlot } from "@/lib/quote";

/**
 * Light hero: centred type, then a large rounded media panel carrying the demo
 * reel, with figures overlaid and a client bar notched into its bottom edge.
 *
 * This is the only light section above the fold, so the header inverts over it
 * — see `Header.tsx`, which watches this section's box.
 */

const HERO_BG = "#F4F5F3";

export default function Hero() {
  const [slot, setSlot] = useState<string | null>(null);
  useEffect(() => setSlot(nextAvailableSlot()), []);

  return (
    <section
      id="top"
      className="relative overflow-hidden pb-20 pt-32 sm:pt-36"
      style={{ background: HERO_BG }}
    >
      {/* Type */}
      <div className="mx-auto max-w-[1080px] px-5 text-center sm:px-8">
        <p className="font-serif text-[13px] uppercase leading-snug tracking-[0.12em] text-[#1B211F] sm:text-[15px]">
          A video editing studio for teams that publish every week
        </p>

        <h1 className="mx-auto mt-6 max-w-[15ch] font-display text-[clamp(2.4rem,7vw,4.6rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-[#08100D]">
          Cut for retention, not applause
        </h1>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="#onboarding"
            className="group inline-flex items-center gap-3 rounded-full bg-[#08100D] py-2 pl-7 pr-2 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Start a project
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#08100D] transition-transform duration-300 group-hover:translate-x-0.5">
              <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
                <path
                  d="M1 6h12M9 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>

          {slot ? (
            <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-mono text-[11px] text-[#6B7773]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0A7256]" />
              Next start date: {slot} · 2 slots left this month
            </p>
          ) : null}
        </div>
      </div>

      {/* Media panel */}
      <div className="mx-auto mt-14 max-w-[1240px] px-5 sm:px-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#0B1512] sm:aspect-[16/10] lg:aspect-[16/9]">
          <HeroMedia title="Caparison Studio showreel" />

          {/* Keeps the overlaid figures legible over any footage. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.45)_0%,transparent_28%,transparent_58%,rgba(0,0,0,.6)_100%)]"
          />

          {/* Headline figure, top-left */}
          <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
            <span className="block font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-none tracking-[-0.04em] text-white">
              +38%
            </span>
            <span className="mt-1.5 block max-w-[16ch] text-xs leading-snug text-white/75 sm:text-sm">
              Median retention lift across 1,240 videos
            </span>
          </div>

          {/* Secondary figure, bottom-right — clear of the client bar. */}
          <div className="absolute bottom-24 right-5 max-w-[15rem] text-right sm:bottom-28 sm:right-8">
            <span className="block font-display text-lg font-extrabold leading-tight text-white sm:text-2xl">
              Five-day first cut
            </span>
            <span className="mt-1.5 block text-xs leading-snug text-white/70 sm:text-sm">
              Send the files and we confirm the delivery date the same day.
            </span>
          </div>

          {/* Client bar, notched into the bottom edge of the panel. */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            {/* The radius has to live on the element that paints the
                background, or the bar renders as a sharp rectangle. */}
            <div
              className="relative rounded-t-[1.6rem]"
              style={{ background: HERO_BG }}
            >
              {/* Concave corners either side, so the bar reads as cut out of the
                  panel rather than laid on top of it. */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-6 w-6 -translate-x-full"
                style={{
                  background: `radial-gradient(circle at 0 0, transparent 24px, ${HERO_BG} 24px)`,
                }}
              />
              <span
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-6 w-6 translate-x-full"
                style={{
                  background: `radial-gradient(circle at 100% 0, transparent 24px, ${HERO_BG} 24px)`,
                }}
              />

              <div className="flex items-center gap-5 px-6 pb-3 pt-3.5 sm:gap-8 sm:px-9">
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A938F] sm:block">
                  Trusted by
                </span>
                {CLIENTS.slice(0, 4).map((client) => (
                  <span
                    key={client}
                    className="whitespace-nowrap font-display text-xs font-bold text-[#1B211F] sm:text-sm"
                  >
                    {client}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
