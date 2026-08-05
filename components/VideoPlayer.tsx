"use client";

import { useEffect, useRef, useState } from "react";
import { FALLBACK_CLIP_SRC, type Clip } from "@/lib/clips";

/**
 * Maximised player, shared by the work deck and the showreel strip.
 *
 * Autoplays because opening it is always an explicit click. Escape closes,
 * space toggles, and the page is locked while it is open.
 */

function timecode(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function VideoPlayer({
  clip,
  contextLabel,
  onClose,
}: {
  clip: Clip;
  /** Shown top-right — the project the clip belongs to. */
  contextLabel: string;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("cinema-open");
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("cinema-open");
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        const el = video.current;
        if (!el) return;
        if (el.paused) void el.play();
        else el.pause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = video.current;
      if (el) {
        setTime(el.currentTime);
        if (Number.isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="on-dark fixed inset-0 z-[70] flex flex-col bg-black">
      <video
        ref={video}
        src={clip.src ?? FALLBACK_CLIP_SRC}
        poster={clip.poster}
        autoPlay
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-full w-full object-contain"
      />

      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-mint/50 hover:text-mint"
          >
            <span aria-hidden="true">←</span> Back
          </button>
          <span className="rounded-md border border-mint/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] tracking-wide text-mint backdrop-blur">
            {contextLabel}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-white">{clip.title}</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const el = video.current;
                if (!el) return;
                if (el.paused) void el.play();
                else el.pause();
              }}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              {playing ? (
                <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden="true">
                  <rect width="3.5" height="13" rx="1" fill="currentColor" />
                  <rect x="7.5" width="3.5" height="13" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
                  <path d="M12 7L0 14V0z" fill="currentColor" />
                </svg>
              )}
            </button>

            <span className="font-mono text-xs text-white/80">{timecode(time)}</span>

            <div className="relative flex-1">
              <div className="h-1 overflow-hidden rounded-full bg-white/20">
                <span
                  className="block h-full rounded-full bg-mint"
                  style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 0.1)}
                step={0.01}
                value={time}
                onChange={(e) => {
                  const el = video.current;
                  if (el) el.currentTime = Number(e.target.value);
                }}
                aria-label="Scrub"
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>

            <span className="font-mono text-xs text-white/50">
              {timecode(duration)}
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.03em] text-white/30">
            Placeholder reel · esc to exit
          </span>
        </div>
      </div>
    </div>
  );
}

