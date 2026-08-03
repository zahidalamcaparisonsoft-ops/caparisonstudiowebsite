"use client";

import { useCallback, useRef, useState } from "react";
import { PROJECTS, type Project } from "@/lib/data";
import { clipsFor, type Clip } from "@/lib/clips";
import VideoPlayer from "./VideoPlayer";

/**
 * Full-bleed reel strip.
 *
 * Drag it either way, flick it, or scroll it with a trackpad.
 *
 * There is deliberately no auto-scroll: motion the visitor did not ask for
 * fights the drag, and pausing it on hover meant the strip stalled permanently
 * for anyone whose cursor happened to rest over it.
 *
 * Clicking a tile plays it here rather than navigating away; the case study is
 * a separate, deliberate destination from the work deck above.
 */

const STRIP: Project[] = [...PROJECTS, ...PROJECTS];
const DRAG_SLOP = 6; // px past which a gesture is a drag, not a click

export default function ShowreelBand() {
  const rail = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<{ clip: Clip; label: string } | null>(null);

  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const moved = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = rail.current;
    if (!el) return;
    moved.current = false;
    drag.current = { x: e.clientX, scroll: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    const el = rail.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > DRAG_SLOP) moved.current = true;
    el.scrollLeft = d.scroll - dx;
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  return (
    <section
      aria-label="Recent work"
      className="relative overflow-hidden border-y border-white/8 py-10"
      onPointerLeave={() => {
        drag.current = null;
      }}
    >
      <div
        ref={rail}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex cursor-grab gap-4 overflow-x-auto px-4 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {STRIP.map((project, i) => {
          const hue = Math.round(project.hue * 360);
          const clips = clipsFor(project.slug);
          const clip = clips[0];
          return (
            <button
              key={`${project.slug}-${i}`}
              type="button"
              // The second pass is a visual loop only — one set is enough for
              // assistive tech and for the tab order.
              aria-hidden={i >= PROJECTS.length}
              tabIndex={i >= PROJECTS.length ? -1 : undefined}
              onClick={() => {
                if (moved.current) {
                  moved.current = false;
                  return;
                }
                if (clip) setPlaying({ clip, label: project.title });
              }}
              className="group relative block h-28 w-48 shrink-0 select-none overflow-hidden rounded-lg border border-white/10 text-left sm:h-32 sm:w-56"
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
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent sm:w-40"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent sm:w-40"
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
