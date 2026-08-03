"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_CLIP_SRC, type Clip } from "@/lib/clips";

/**
 * Inline playback stage for an opened project.
 *
 * Everything lives inside the picture: title top-left, transport centred, the
 * deliverables strip floating above the control bar the way a streaming app
 * stacks its episode row. Nothing sits below the panel, so the section keeps
 * its height whether the chrome is showing or not — and the strip comes along
 * into fullscreen, since it is inside the element that gets promoted.
 *
 * Chrome hides after a second of stillness and returns on pointer movement, but
 * only while something is playing. Auto-hiding the controls of a paused video
 * would leave a dead frame with no visible way to start it.
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
  /** Title / meta block, overlaid top-left and hidden with the chrome. */
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

  const bump = useCallback(() => {
    setChrome(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (playing) idleTimer.current = setTimeout(() => setChrome(false), IDLE_MS);
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
  const fade = `transition-opacity duration-300 ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`;

  return (
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

      {/* Title / meta */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-6 ${fade}`}
      >
        {header}
      </div>

      {/* Centre transport */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className={`absolute left-1/2 top-[42%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-mint hover:bg-mint/25 sm:h-18 sm:w-18 ${fade}`}
      >
        {playing ? (
          <svg width="15" height="17" viewBox="0 0 16 19" aria-hidden="true">
            <rect width="5" height="19" rx="1.5" fill="currentColor" />
            <rect x="11" width="5" height="19" rx="1.5" fill="currentColor" />
          </svg>
        ) : (
          <svg
            width="17"
            height="19"
            viewBox="0 0 16 18"
            fill="none"
            aria-hidden="true"
            className="ml-1"
          >
            <path d="M15 9L1 17.66V.34L15 9z" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* One scrim behind both the strip and the bar, so the picture is only
          darkened once rather than twice. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/70 to-transparent ${fade}`}
      />

      {/* ── Deliverables, floating above the control bar ── */}
      <div className={`absolute inset-x-0 bottom-[52px] sm:bottom-[60px] ${fade}`}>
        <div className="flex items-baseline gap-2.5 px-4 pb-2 sm:px-5">
          <span className="text-xs font-bold text-white sm:text-sm">Deliverables</span>
          <span className="truncate font-mono text-[10px] text-white/45">
            {clips.length} files · {title}
          </span>
        </div>

        <ul className="flex gap-2.5 overflow-x-auto px-4 pb-1 [scroll-behavior:auto] [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
          {clips.map((c, i) => {
            const h = Math.round(((hue + i * 0.06) % 1) * 360);
            const on = i === active;
            return (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-current={on}
                  className="group block w-[104px] text-left sm:w-[132px]"
                >
                  <span
                    className={`relative block aspect-video overflow-hidden rounded-md border transition-colors ${
                      on ? "border-mint" : "border-white/25 group-hover:border-white/60"
                    }`}
                  >
                    <span
                      className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                      style={{
                        background: `radial-gradient(120% 110% at 30% 10%, hsl(${h} 58% 24%) 0%, hsl(${h} 50% 10%) 50%, #030605 100%)`,
                      }}
                    />
                    {on ? <span className="absolute inset-0 bg-mint/20" /> : null}
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-px font-mono text-[8px] text-white/85">
                      {c.duration}
                    </span>
                  </span>
                  <span
                    className={`mt-1 block truncate text-[11px] font-semibold ${
                      on ? "text-mint" : "text-white/75 group-hover:text-white"
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

      {/* ── Control bar ── */}
      <div
        className={`absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 pb-3 sm:gap-4 sm:px-5 sm:pb-4 ${fade}`}
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
  );
}
