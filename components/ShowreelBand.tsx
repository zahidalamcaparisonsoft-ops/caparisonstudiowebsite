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
        // The list is doubled, so wrapping at the halfway mark is invisible.
        const half = el.scrollWidth / 2;
        if (half > 0 && pos.current >= half) pos.current -= half;
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
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (pos.current >= half) pos.current -= half;
        else if (pos.current < 0) pos.current += half;
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
        className="flex cursor-grab gap-4 overflow-x-auto px-4 [scroll-behavior:auto] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
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
              className="group relative block h-28 w-48 shrink-0 select-none overflow-hidden rounded-lg border border-ink/10 text-left shadow-[0_10px_26px_-18px_rgba(5,30,24,.6)] sm:h-32 sm:w-56"
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

              <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 opacity-0 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                <svg width="11" height="13" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                  <path d="M15 9L1 17.66V.34L15 9z" fill="#fff" />
                </svg>
              </span>

              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2.5">
                <span className="block truncate text-xs font-bold text-white">
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
        className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40"
        style={{ background: "linear-gradient(to right, var(--section-bg), transparent)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40"
        style={{ background: "linear-gradient(to left, var(--section-bg), transparent)" }}
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
