"use client";

import { TIMELINE_CLIPS } from "@/lib/data";
import { useActiveSection, useScrollProgress } from "@/lib/hooks";
import { useEffect, useMemo, useState } from "react";

/**
 * Scroll position as an NLE timeline: a timecode, a track of clips you can
 * click, and a playhead.
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
  const progress = useScrollProgress();
  const active = useActiveSection(IDS);
  const ids = useMemo(() => IDS, []);

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
              <div className="flex gap-1">
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
                  left: `${progress * 100}%`,
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
