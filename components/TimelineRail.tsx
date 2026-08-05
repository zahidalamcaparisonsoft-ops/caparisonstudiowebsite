"use client";

import { TIMELINE_CLIPS } from "@/lib/data";
import { useActiveSection, useScrollProgress } from "@/lib/hooks";
import { useMemo } from "react";

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

  return (
    <div className="timeline-rail pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden md:block">
      <div className="shell pb-5">
        <div className="pointer-events-auto rounded-2xl border border-white/12 bg-[#0A0F0D]/92 px-4 py-3 shadow-[0_20px_60px_-22px_rgba(5,30,24,.6)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] tracking-widest text-mint">
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
                          ? "border-mint/60 bg-mint/20"
                          : "border-white/12 bg-white/[0.05] hover:border-mint/40 hover:bg-white/[0.1]"
                      }`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {/* Waveform-ish ticks, so a clip looks like a clip. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 opacity-40"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(90deg, rgba(27,237,172,.5) 0 1px, transparent 1px 5px)",
                        }}
                      />
                      <span
                        className={`relative z-10 flex h-full items-center justify-center px-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                          isActive ? "text-mint" : "text-white/70 group-hover:text-white"
                        }`}
                      >
                        {clip.label}
                      </span>
                    </a>
                  );
                })}
              </div>

              {/* Playhead */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-1.5 bottom-[-6px] w-px bg-mint shadow-[0_0_12px_2px_rgba(27,237,172,.55)]"
                style={{ left: `${progress * 100}%` }}
              >
                <span className="absolute -left-[3px] -top-1 h-[7px] w-[7px] rotate-45 bg-mint" />
              </div>
            </div>

            <span className="hidden font-mono text-[11px] tracking-widest text-white/60 lg:inline">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
