"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_CLIP_SRC, type Clip } from "@/lib/clips";

/**
 * Inline playback stage for an opened project.
 *
 * The clip plays in the panel itself rather than taking over the screen, with
 * the transport centred over the picture and the deliverables list underneath.
 * Picking a deliverable swaps the source in place.
 *
 * Chrome (transport, title, deliverables) hides after a second of stillness and
 * comes back on any pointer movement — but only while something is playing.
 * Auto-hiding the controls of a paused video would leave a dead frame with no
 * visible way to start it.
 *
 * Fullscreen is available on demand via the control bar.
 */

const IDLE_MS = 1000;

function timecode(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function ProjectStage({
  clips,
  title,
  hue,
  header,
}: {
  clips: Clip[];
  title: string;
  hue: number;
  /** Title / meta block, overlaid on the picture and hidden with the chrome. */
  header: React.ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [full, setFull] = useState(false);

  const clip = clips[active];

  /* Show the chrome and restart the idle countdown. Only arms the timer while
     playing — see the note at the top. */
  const bump = useCallback(() => {
    setChrome(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (playing) {
      idleTimer.current = setTimeout(() => setChrome(false), IDLE_MS);
    }
  }, [playing]);

  useEffect(() => {
    bump();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [bump]);

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === stage.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const el = video.current;
      if (el) {
        setTime(el.currentTime);
        if (Number.isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggle = useCallback(() => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  }, []);

  const pick = useCallback((i: number) => {
    setActive(i);
    // An explicit click, so starting playback here is expected.
    requestAnimationFrame(() => {
      const el = video.current;
      if (el) void el.play().catch(() => {});
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.current?.requestFullscreen().catch(() => {});
  }, []);

  const hidden = !chrome;

  return (
    <div>
      {/* ── Stage ── */}
      <div
        ref={stage}
        onPointerMove={bump}
        onPointerLeave={() => playing && setChrome(false)}
        className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black"
        style={{ cursor: hidden ? "none" : "default" }}
      >
        <video
          ref={video}
          key={clip?.id}
          src={clip?.src ?? FALLBACK_CLIP_SRC}
          poster={clip?.poster}
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => {
            setPlaying(false);
            setChrome(true);
          }}
          onClick={toggle}
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Title / meta, overlaid */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 sm:p-6 ${
            hidden ? "opacity-0" : "opacity-100"
          }`}
        >
          {header}
        </div>

        {/* Centre transport */}
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-mint hover:bg-mint/25 sm:h-20 sm:w-20 ${
            hidden ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          {playing ? (
            <svg width="16" height="19" viewBox="0 0 16 19" aria-hidden="true">
              <rect width="5" height="19" rx="1.5" fill="currentColor" />
              <rect x="11" width="5" height="19" rx="1.5" fill="currentColor" />
            </svg>
          ) : (
            <svg width="18" height="21" viewBox="0 0 16 18" fill="none" aria-hidden="true" className="ml-1">
              <path d="M15 9L1 17.66V.34L15 9z" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* Control bar */}
        <div
          className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/85 to-transparent p-4 transition-opacity duration-300 sm:gap-4 sm:p-5 ${
            hidden ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <span className="shrink-0 font-mono text-[11px] text-white/85">
            {timecode(time)}
          </span>

          <div className="relative flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-white/25">
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

          <span className="shrink-0 font-mono text-[11px] text-white/50">
            {timecode(duration)}
          </span>

          <button
            type="button"
            onClick={() => {
              const el = video.current;
              if (!el) return;
              el.muted = !el.muted;
              setMuted(el.muted);
            }}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={
                  muted
                    ? "M4 9v6h4l5 4V5L8 9H4zM17 9l4 6M21 9l-4 6"
                    : "M4 9v6h4l5 4V5L8 9H4zM17 8.5a4.5 4.5 0 0 1 0 7"
                }
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={full ? "Exit fullscreen" : "Fullscreen"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d={
                  full
                    ? "M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"
                    : "M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"
                }
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Deliverables, hidden with the rest of the chrome ── */}
      <div
        className={`transition-opacity duration-300 ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
        onPointerMove={bump}
      >
        <div className="mt-5 flex items-baseline gap-3">
          <span className="text-sm font-bold text-white">Deliverables</span>
          <span className="font-mono text-[11px] text-white/35">
            {clips.length} files · {title}
          </span>
        </div>

        <ul className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {clips.map((c, i) => {
            const h = Math.round(((hue + i * 0.06) % 1) * 360);
            const on = i === active;
            return (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-current={on}
                  className="group w-[152px] text-left sm:w-[184px]"
                >
                  <span
                    className={`relative block aspect-video overflow-hidden rounded-lg border transition-colors ${
                      on ? "border-mint" : "border-white/12 group-hover:border-white/35"
                    }`}
                  >
                    <span
                      className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                      style={{
                        background: `radial-gradient(120% 110% at 30% 10%, hsl(${h} 58% 22%) 0%, hsl(${h} 50% 9%) 50%, #030605 100%)`,
                      }}
                    />
                    {on ? (
                      <span className="absolute inset-0 bg-mint/15" />
                    ) : (
                      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/5" />
                    )}
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] text-white/85">
                      {c.duration}
                    </span>
                  </span>
                  <span
                    className={`mt-2 block truncate text-xs font-semibold ${
                      on ? "text-mint" : "text-white/80 group-hover:text-white"
                    }`}
                  >
                    {c.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
