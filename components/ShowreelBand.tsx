"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECTS, type Project } from "@/lib/data";
import { clipsFor, type Clip } from "@/lib/clips";
import VideoPlayer from "./VideoPlayer";

/**
 * Full-bleed reel strip.
 *
 * Rolls on its own, and can be dragged either way to find something.
 *
 * It pauses only while a drag is actually in progress — NOT on hover. Pausing
 * on hover was what stalled the strip permanently for anyone whose cursor
 * happened to come to rest over it.
 *
 * The list is rendered twice and the position wraps at the halfway mark, so the
 * roll is seamless in both directions.
 *
 * Two things this needs that are easy to miss:
 *   - `scroll-behavior: auto` on the rail. The global `html { scroll-behavior:
 *     smooth }` is inherited by every scroll container, and each sub-pixel
 *     write then restarts a smooth animation rather than moving.
 *   - Position accumulated in a ref, not read back off `scrollLeft`. At 30px/s
 *     a frame advances under a pixel, which reading the DOM value rounds away.
 *
 * Clicking a tile plays it here rather than navigating away; the case study is
 * a separate, deliberate destination from the work deck above.
 */


const DRAG_SLOP = 6; // px past which a gesture is a drag, not a click
const ROLL_PX_PER_SEC = 30;

export default function ShowreelBand({
  projects,
  clips,
}: {
  projects?: Project[];
  clips?: Record<string, Clip[]>;
}) {
  const items = projects?.length ? projects : PROJECTS;
  const STRIP: Project[] = [...items, ...items];
  const rail = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<{ clip: Clip; label: string } | null>(null);

  /* One period is the distance from the first tile to its own copy. Deriving
     it from scrollWidth/2 was fine while the rail had a couple of pixels of
     padding, but the lead-in that lines the strip up with the page content is
     counted in scrollWidth and is not part of the loop — halving it put the
     wrap in the wrong place and the strip visibly jumped. */
  const periodOf = (el: HTMLElement) => {
    const kids = el.children;
    const n = kids.length / 2;
    if (n < 1) return 0;
    return (kids[n] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
  };

  const drag = useRef<{ x: number; y: number; lastX: number } | null>(null);
  const pos = useRef(0);
  const moved = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = rail.current;
    if (!el) return;
    moved.current = false;
    drag.current = { x: e.clientX, y: e.clientY, lastX: e.clientX };
    // No setPointerCapture: capturing retargets the follow-up click away from
    // the tile, so a plain click would never open anything.
  }, []);

  // The roll itself.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const el = rail.current;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (el && !drag.current) {
        pos.current += ROLL_PX_PER_SEC * dt;
        // The list is doubled, so wrapping after one period is invisible.
        const period = periodOf(el);
        if (period > 0 && pos.current >= period) pos.current -= period;
        el.scrollLeft = pos.current;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      const el = rail.current;
      if (!d || !el) return;
      if (
        Math.abs(e.clientX - d.x) > DRAG_SLOP ||
        Math.abs(e.clientY - d.y) > DRAG_SLOP * 3
      ) {
        moved.current = true;
      }
      pos.current -= e.clientX - d.lastX;
      d.lastX = e.clientX;
      const period = periodOf(el);
      if (period > 0) {
        if (pos.current >= period) pos.current -= period;
        else if (pos.current < 0) pos.current += period;
      }
      el.scrollLeft = pos.current;
    };
    const up = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section
      aria-label="Recent work"
      className="section-brandtint seam-top seam-bottom relative overflow-hidden py-10"
      onPointerLeave={() => {
        drag.current = null;
      }}
    >
      <div
        ref={rail}
        onPointerDown={onPointerDown}
        className="shell-lead flex cursor-grab gap-5 overflow-x-auto [scroll-behavior:auto] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {STRIP.map((project, i) => {
          const hue = Math.round(project.hue * 360);
          const list = clips?.[project.slug] ?? clipsFor(project.slug);
          const clip = list[0];
          return (
            <button
              key={`${project.slug}-${i}`}
              type="button"
              // The second pass is a visual loop only — one set is enough for
              // assistive tech and for the tab order.
              aria-hidden={i >= items.length}
              tabIndex={i >= items.length ? -1 : undefined}
              onClick={() => {
                if (moved.current) {
                  moved.current = false;
                  return;
                }
                if (clip) setPlaying({ clip, label: project.title });
              }}
              className="group relative block aspect-video w-60 shrink-0 select-none overflow-hidden rounded-xl border border-ink/10 text-left shadow-[0_14px_34px_-20px_rgba(5,30,24,.6)] sm:w-[22rem]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                style={{
                  background: `radial-gradient(125% 110% at 25% 5%, hsl(${hue} 60% 20%) 0%, hsl(${hue} 52% 8%) 48%, #030605 100%)`,
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]"
              />

              <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 opacity-0 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                <svg width="15" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                  <path d="M15 9L1 17.66V.34L15 9z" fill="#fff" />
                </svg>
              </span>

              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3.5">
                <span className="block truncate text-sm font-bold text-white">
                  {project.title}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-mint">
                  {project.duration}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Feather both ends so the strip runs out of the page rather than
          stopping at it. */}
      <span
        aria-hidden="true"
        className="fade-edge pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28"
      />
      <span
        aria-hidden="true"
        className="fade-edge fade-edge-r pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28"
      />

      {playing ? (
        <VideoPlayer
          clip={playing.clip}
          contextLabel={playing.label}
          onClose={() => setPlaying(null)}
        />
      ) : null}
    </section>
  );
}
