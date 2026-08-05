"use client";

import { TIMELINE_CLIPS } from "@/lib/data";
import { useTrackPosition } from "@/lib/hooks";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Scroll position as an NLE timeline: a timecode, a track of clips you can
 * click, and a playhead.
 *
 * The playhead is placed by chapter, not by scroll fraction — the clips are
 * equal widths and the sections are not equal heights, so a linear fraction
 * put the marker a whole clip out almost everywhere. The lit clip and the
 * marker read the same measurement, so they cannot disagree.
 *
 * A timeline is dark, so the rail is dark for the length of the white page.
 * The footer is the one band that is darker still, and a dark rail on it
 * turned into a faint outline — so over any `.on-dark` band the whole rail
 * flips to a white track. Same instrument, lit the other way round.
 */

const IDS = TIMELINE_CLIPS.map((c) => c.id);

function timecode(progress: number) {
  // Maps scroll position onto a runtime, so the page reads as a piece of
  // footage being scrubbed rather than a document being scrolled.
  const total = 154; // 02:34
  const seconds = Math.round(progress * total);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function TimelineRail() {
  const ids = useMemo(() => IDS, []);
  /* Everything on the rail reads the same number, so the playhead, the
     timecode and the percentage cannot disagree about where you are. */
  const { index, within, fraction: progress } = useTrackPosition(ids);
  /* The lit clip comes from the same measurement as the playhead. Deciding it
     separately — an observer watching the middle of the viewport, while the
     playhead followed the line an anchor lands on — meant the two disagreed
     about which section you were in, and the marker sat outside the clip it
     had lit. */
  const active = ids[Math.min(index, ids.length - 1)];

  /* The playhead is placed against the clips themselves, not as a percentage
     of the track. The clips are laid out with gaps between them, so a
     percentage lands on a slightly different grid and the marker drifts into
     the gaps. Measured once and on resize — reading layout every scroll frame
     to place a 1px line is not worth it. */
  const track = useRef<HTMLDivElement>(null);
  const [clips, setClips] = useState<{ left: number; width: number }[]>([]);
  useEffect(() => {
    const measure = () => {
      const el = track.current;
      if (!el) return;
      setClips(
        [...el.children].map((c) => ({
          left: (c as HTMLElement).offsetLeft,
          width: (c as HTMLElement).offsetWidth,
        })),
      );
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  const slot = clips[Math.min(index, clips.length - 1)];
  const next = clips[Math.min(index + 1, clips.length - 1)];
  /* Travel to the NEXT clip's left edge, not to this one's right edge —
     otherwise the last few percent of a section park the marker in the gap
     between two clips instead of arriving at the one it is entering. */
  const span = next && next.left > slot?.left ? next.left - slot.left : (slot?.width ?? 0);
  const headLeft = slot ? `${slot.left + within * span}px` : `${progress * 100}%`;

  // True while the rail is sitting over a dark band.
  const [onDark, setOnDark] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Sample the rail's own centre, not the bottom of the window: what
      // matters is the band actually behind the track.
      const y = window.innerHeight - 44;
      setOnDark(
        [...document.querySelectorAll(".on-dark")].some((el) => {
          const r = el.getBoundingClientRect();
          return r.top <= y && r.bottom >= y && r.width > window.innerWidth * 0.8;
        }),
      );
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

  const accent = onDark ? "#0A7256" : "#1BEDAC";

  return (
    <div className="timeline-rail pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden md:block">
      <div className="shell pb-5">
        <div
          className={`pointer-events-auto rounded-2xl border px-4 py-3 backdrop-blur-xl transition-colors duration-500 ${
            onDark
              ? "border-ink/10 bg-white/94 shadow-[0_20px_60px_-24px_rgba(0,0,0,.7)]"
              : "border-white/12 bg-[#0A0F0D]/92 shadow-[0_20px_60px_-22px_rgba(5,30,24,.6)]"
          }`}
        >
          <div className="flex items-center gap-4">
            <span
              className={`font-mono text-[11px] font-medium tabular-nums tracking-[0.1em] transition-colors ${
                onDark ? "text-brand" : "text-mint"
              }`}
            >
              {timecode(progress)}
            </span>

            {/* The track. Each clip is a real scroll target. */}
            <div className="relative flex-1">
              <div ref={track} className="flex gap-1">
                {ids.map((id) => {
                  const clip = TIMELINE_CLIPS.find((c) => c.id === id)!;
                  const isActive = active === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={`group relative h-7 flex-1 overflow-hidden rounded-md border transition-colors duration-300 ${
                        isActive
                          ? onDark
                            ? "border-brand/45 bg-mint/30"
                            : "border-mint/60 bg-mint/20"
                          : onDark
                            ? "border-ink/10 bg-ink/[0.05] hover:border-brand/40 hover:bg-mint/15"
                            : "border-white/12 bg-white/[0.05] hover:border-mint/40 hover:bg-white/[0.1]"
                      }`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {/* Waveform-ish ticks, so a clip looks like a clip. They
                          sit behind the label and are dialled right back —
                          at full strength they striped straight through it. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `repeating-linear-gradient(90deg, ${accent} 0 1px, transparent 1px 6px)`,
                        }}
                      />
                      {/* Label sits on its own plate, so the ticks never run
                          through the letterforms. */}
                      <span
                        className={`relative z-10 flex h-full items-center justify-center px-2 text-[11px] font-semibold tracking-normal transition-colors ${
                          isActive
                            ? onDark
                              ? "text-brand-deep"
                              : "text-mint"
                            : onDark
                              ? "text-body group-hover:text-ink"
                              : "text-white/85 group-hover:text-white"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute inset-y-1 left-1 right-1 rounded transition-colors ${
                            onDark ? "bg-white/70" : "bg-[#0A0F0D]/70"
                          }`}
                        />
                        <span className="relative">{clip.label}</span>
                      </span>
                    </a>
                  );
                })}
              </div>

              {/* Playhead */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-1.5 bottom-[-6px] w-px transition-colors"
                style={{
                  left: headLeft,
                  background: accent,
                  boxShadow: `0 0 12px 2px ${onDark ? "rgba(10,114,86,.3)" : "rgba(27,237,172,.55)"}`,
                }}
              >
                <span
                  className="absolute -left-[3px] -top-1 h-[7px] w-[7px] rotate-45"
                  style={{ background: accent }}
                />
              </div>
            </div>

            <span
              className={`hidden font-mono text-[11px] font-medium tabular-nums tracking-[0.1em] transition-colors lg:inline ${
                onDark ? "text-body" : "text-white/70"
              }`}
            >
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
