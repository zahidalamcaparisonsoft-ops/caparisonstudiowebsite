"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import HeroMedia from "./HeroMedia";
import { CLIENTS } from "@/lib/data";
import { nextAvailableSlot } from "@/lib/quote";
import { useLoopRail } from "@/lib/hooks";
import type { HeroContent } from "@/lib/content";

/**
 * Hero: centred type, then a large rounded media panel carrying the demo reel,
 * with figures overlaid and a client bar notched into its bottom edge.
 *
 * The panel is the page's first dark island — the reel needs a dark surround
 * to read as footage rather than as a hole in the white.
 */

const HERO_BG = "#FFFFFF";

/* The panel starts laid back like a plate on a table and rises to flat as you
   scroll. Driven off raw scrollY rather than the element's own box because the
   hero is pinned to the top of the document — that makes "fully tilted at rest"
   exact rather than dependent on viewport height. */
const MAX_TILT_DEG = 34;
const TILT_DISTANCE = 460; // px of scroll that takes it from plate to flat
/* Hinging on the bottom edge pushes the far edge down the screen, which buried
   the plate below the fold at rest. This lifts it while tilted and releases to
   zero as it flattens, so the flat layout is untouched. */
const TILT_LIFT = 130;

export default function Hero({ content, clients }: { content?: HeroContent; clients?: string[] }) {
  const c = content;
  const names = clients?.length ? clients : CLIENTS;
  const [slot, setSlot] = useState<string | null>(null);
  // Once the visitor actually presses play, the overlaid figures get out of the
  // way — they would otherwise sit on top of the video and its control bar.
  const [live, setLive] = useState(false);
  const [flat, setFlat] = useState(0); // 0 = full plate, 1 = flat on
  const reduced = useRef(false);
  useEffect(() => setSlot(nextAvailableSlot()), []);
  const onLiveChange = useCallback((v: boolean) => setLive(v), []);

  // The client names step along on the same rail the testimonial picker uses.
  const { ref: clientRail, onPointerDown: onClientDown } =
    useLoopRail<HTMLDivElement>();

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setFlat(1);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      setFlat(Math.min(1, Math.max(0, window.scrollY / TILT_DISTANCE)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Pressing play flattens it immediately — nobody should watch a tilted video.
  const tilt = live ? 0 : (1 - flat) * MAX_TILT_DEG;

  return (
    <section
      id="top"
      className="relative overflow-hidden pb-20 pt-32 sm:pt-36"
      style={{ background: HERO_BG }}
    >
      {/* Type */}
      <div className="shell">
        <div className="mx-auto max-w-[1080px] text-center">
        <p className="text-[13px] font-medium leading-snug tracking-[0.02em] text-body sm:text-sm">
          {c?.eyebrow ?? "A video editing studio for teams that publish every week"}
        </p>

        <h1 className="mx-auto mt-6 max-w-[15ch] font-display text-[clamp(2.4rem,7vw,4.6rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink">
          {c?.headline ?? "Cut for retention, not applause"}
        </h1>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="#onboarding"
            className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-7 pr-2 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            {c?.ctaLabel ?? "Start a project"}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:translate-x-0.5">
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
            <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-mono text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Next start date: {slot} · 2 slots left this month
            </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Media panel */}
      <div
        className="shell mt-10"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 0%" }}
      >
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-surface shadow-[0_60px_120px_-50px_rgba(8,16,13,.7)] sm:aspect-[16/10] lg:aspect-[16/9]"
          style={{
            // Hinges on its bottom edge, so the top recedes and the near edge
            // stays put — a plate lying down rather than a card spinning.
            transformOrigin: "50% 100%",
            transform: `translateY(${(-(live ? 0 : 1 - flat) * TILT_LIFT).toFixed(1)}px) rotateX(${tilt.toFixed(2)}deg) scale(${(0.94 + flat * 0.06).toFixed(3)})`,
            transition: live ? "transform 700ms cubic-bezier(.16,1,.3,1)" : "none",
          }}
        >
          <HeroMedia
            title="Caparison Studio showreel"
            vimeoId={c?.vimeoId}
            videoUrl={c?.videoUrl}
            onLiveChange={onLiveChange}
          />

          {/* Keeps the overlaid figures legible over any footage. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.45)_0%,transparent_28%,transparent_58%,rgba(0,0,0,.6)_100%)] transition-opacity duration-500 ${
              live ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Headline figure, top-left */}
          <div
            className={`absolute left-5 top-5 transition-opacity duration-500 sm:left-8 sm:top-8 ${live ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <span className="block font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-none tracking-[-0.04em] text-white">
              {c?.statValue ?? "+38%"}
            </span>
            <span className="mt-1.5 block max-w-[16ch] text-xs leading-snug text-white/75 sm:text-sm">
              {c?.statLabel ?? "Median retention lift across 1,240 videos"}
            </span>
          </div>

          {/* Secondary figure, bottom-right — clear of the client bar. */}
          <div
            className={`absolute bottom-24 right-5 max-w-[15rem] text-right transition-opacity duration-500 sm:bottom-28 sm:right-8 ${live ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <span className="block font-display text-lg font-extrabold leading-tight text-white sm:text-2xl">
              {c?.promiseTitle ?? "Five-day first cut"}
            </span>
            <span className="mt-1.5 block text-xs leading-snug text-white/70 sm:text-sm">
              {c?.promiseBody ?? "Send the files and we confirm the delivery date the same day."}
            </span>
          </div>

          {/* Client bar, notched into the bottom edge of the panel. */}
          <div
            className={`absolute inset-x-0 bottom-0 flex justify-center transition-opacity duration-500 ${live ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
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

              <div className="flex items-center gap-4 px-6 pb-3 pt-3.5 sm:gap-6 sm:px-9">
                <span className="hidden shrink-0 font-mono text-[10px] tracking-[0.04em] text-muted sm:block">
                  Trusted by
                </span>
                {/* Fixed width, or the bar would size itself to every client
                    and there would be nothing to scroll. Doubled, so the loop
                    never reaches an end. */}
                <div
                  ref={clientRail}
                  onPointerDown={onClientDown}
                  className="rail-fade flex w-[190px] cursor-grab select-none gap-5 overflow-x-auto [scroll-behavior:auto] [scrollbar-width:none] active:cursor-grabbing sm:w-[330px] sm:gap-8 [&::-webkit-scrollbar]:hidden"
                  style={{ ["--rail-fade" as string]: "1.5rem" }}
                >
                  {[...names, ...names].map((client, i) => (
                    <span
                      key={`${client}-${i}`}
                      aria-hidden={i >= names.length || undefined}
                      className="shrink-0 whitespace-nowrap font-display text-xs font-bold text-body sm:text-sm"
                    >
                      {client}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
