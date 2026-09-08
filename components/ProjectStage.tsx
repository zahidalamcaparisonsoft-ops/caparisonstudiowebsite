"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_CLIP_SRC, type Clip } from "@/lib/clips";
import { pictureBox, ratioOf } from "@/lib/aspect";
import type { LoadedProject } from "@/lib/content";

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

/* Controls on, Vimeo's own branding off, and asked not to track the viewer. */
const VIMEO_LIVE = [
  "autoplay=1",
  "muted=0",
  "controls=1",
  "title=0",
  "byline=0",
  "portrait=0",
  "dnt=1",
].join("&");

/** How much of the viewport height the stage's picture may take. 72vh of
    picture plus roughly 150px of deliverables strip is about all a laptop has. */
const MAX_PICTURE_VH = 72;

function timecode(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function ProjectStage({
  clips,
  vimeoId,
  poster,
  title,
  hue,
  header,
  siblings,
  currentSlug,
  categoryLabel,
  onPick,
  startLive = false,
  aspect,
  onClose,
}: {
  clips: Clip[];
  /** Set on a project whose film lives on Vimeo — it plays instead of `clips`. */
  vimeoId?: string;
  /** The still shown before the first press. Vimeo's, unless one was uploaded. */
  poster?: string;
  title: string;
  hue: number;
  /** Title / meta block, overlaid top-left and hidden with the chrome. */
  header: React.ReactNode;
  /** Everything under the active filter, in deck order — the whole set, not a window. */
  siblings: LoadedProject[];
  currentSlug: string;
  /** Names the filter the strip is showing, e.g. "YouTube automation". */
  categoryLabel: string;
  /** Switches the stage to another project without closing it. */
  onPick: (slug: string) => void;
  /** Whether to start playing rather than waiting on the poster. */
  startLive?: boolean;
  /** width / height of the film, so the player is the shape of the picture. */
  aspect?: number;
  /** Renders the close control inside the picture, where the picture is. */
  onClose?: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [full, setFull] = useState(false);
  /* Vimeo only: whether the embed has been asked for yet. */
  const [live, setLive] = useState(startLive);

  /* The clip list is no longer switchable from here — the strip below now
     carries the other projects instead — so the local player takes the first
     one. Only the bundled samples ever reach it: everything from the panel
     has a Vimeo id. */
  const clip = clips[0];

  /* The picture takes the film's shape. A vertical cut in a 16:9 frame is a
     strip down the middle of two black bars, which is most of the screen
     spent on nothing. */
  const ratio = ratioOf(aspect);

  /* The stage is not remounted between projects — the deck swaps its props —
     so without this, opening a second project would find it still playing on
     the first one's press. Picking from the strip arrives with `startLive`,
     which is what carries playback across the switch. */
  useEffect(() => setLive(startLive), [currentSlug, startLive]);

  const bump = useCallback(() => {
    setChrome(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (playing)
      idleTimer.current = setTimeout(() => setChrome(false), IDLE_MS);
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
        if (Number.isFinite(el.duration) && el.duration > 0)
          setDuration(el.duration);
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

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.current?.requestFullscreen().catch(() => {});
  }, []);

  /* Sits inside the picture, not on the panel around it. Once the picture can
     be narrower than the panel — which is what a vertical film does — a close
     button pinned to the panel's corner floats off in the white beside it. */
  const close = onClose ? (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur transition-colors hover:border-mint/50 hover:text-mint"
    >
      <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
        <path
          d="M1 1l12 12M13 1L1 13"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </button>
  ) : null;

  const hidden = !chrome;
  const fade = `transition-opacity duration-300 ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`;

  /* Everything else under the current filter, as a row of stills.
     It sits below the picture rather than over it. Vimeo's control bar owns
     the bottom of its own frame, and an overlay would cover play, scrub and
     fullscreen — and could not get out of the way either, since the chrome
     here hides on `pointermove` and an iframe keeps those events to itself.
     Below the picture, you can switch films while one is playing, which is
     the whole point of the row. */
  const strip =
    siblings.length > 1 ? (
      <div className="mt-3">
        <div className="flex items-baseline gap-2.5 px-1 pb-2">
          <span className="text-xs font-bold text-white sm:text-sm">
            {categoryLabel}
          </span>
          <span className="truncate font-mono text-[10px] text-white/45">
            {siblings.length} videos
          </span>
        </div>

        {/* The row is sized by height, not by width: every still is the same
            height and takes whatever width its own shape asks for. Sizing them
            by width instead would make a vertical still three times the height
            of a widescreen one, and the row would change height with whatever
            happened to be in the filter. The caption keeps a floor under it so
            a narrow vertical still has a title you can read. */}
        <ul className="flex gap-2.5 overflow-x-auto pb-1 [--still-h:72px] [--still-w:104px] [scroll-behavior:auto] [scrollbar-width:none] sm:[--still-h:92px] sm:[--still-w:132px] [&::-webkit-scrollbar]:hidden">
          {siblings.map((p) => {
            const on = p.slug === currentSlug;
            const ratio = ratioOf(p.aspect);
            return (
              <li key={p.slug} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onPick(p.slug)}
                  aria-current={on}
                  className="group block text-left"
                  style={{
                    width: `max(var(--still-w), calc(var(--still-h) * ${ratio}))`,
                  }}
                >
                  <span
                    className={`relative mx-auto block overflow-hidden rounded-md border transition-colors ${
                      on
                        ? "border-mint"
                        : "border-white/25 group-hover:border-white/60"
                    }`}
                    style={{
                      height: "var(--still-h)",
                      width: `calc(var(--still-h) * ${ratio})`,
                    }}
                  >
                    {p.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.poster}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span
                        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                        style={{
                          background: `radial-gradient(120% 110% at 30% 10%, hsl(${Math.round(
                            p.hue * 360,
                          )} 58% 24%) 0%, hsl(${Math.round(p.hue * 360)} 50% 10%) 50%, #030605 100%)`,
                        }}
                      />
                    )}

                    {on ? (
                      <span className="absolute inset-0 bg-mint/25" />
                    ) : null}

                    {p.duration ? (
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-px font-mono text-[8px] text-white/85">
                        {p.duration}
                      </span>
                    ) : null}
                  </span>

                  <span
                    className={`mt-1 block truncate text-[11px] font-semibold ${
                      on ? "text-mint" : "text-white/75 group-hover:text-white"
                    }`}
                  >
                    {p.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ) : null;

  /* A project whose film is on Vimeo is played by Vimeo.
     The transport below drives an HTMLVideoElement, and there is nothing for
     it to hold on to across an iframe — scrubbing someone else's player means
     loading their SDK. So the embed brings its own controls, and this stage
     supplies only the still and the first press. Pressing it mounts the
     iframe with the gesture still attached, which is what lets it start with
     sound rather than silently. */
  if (vimeoId) {
    return (
      <>
        <div
          ref={stage}
          className="on-dark relative mx-auto overflow-hidden rounded-2xl bg-black"
          style={pictureBox(ratio, MAX_PICTURE_VH)}
        >
          {close}
          {live ? (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?${VIMEO_LIVE}`}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <>
              {poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(125% 110% at 26% 6%, hsl(${Math.round(
                      hue * 360,
                    )} 62% 24%) 0%, hsl(${Math.round(hue * 360)} 55% 10%) 46%, #030605 100%)`,
                  }}
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />

              <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-6">
                {header}
              </div>

              <button
                type="button"
                onClick={() => setLive(true)}
                aria-label={`Play ${title}`}
                className="group absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:border-mint hover:bg-mint/25 sm:h-20 sm:w-20"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-white/25 opacity-70 transition-transform duration-700 group-hover:scale-125 group-hover:opacity-0"
                />
                <svg
                  width="19"
                  height="22"
                  viewBox="0 0 16 18"
                  fill="none"
                  aria-hidden="true"
                  className="ml-1"
                >
                  <path d="M15 9L1 17.66V.34L15 9z" fill="currentColor" />
                </svg>
              </button>
            </>
          )}
        </div>
        {strip}
      </>
    );
  }

  return (
    <>
      <div
        ref={stage}
        onPointerMove={bump}
        onPointerLeave={() => playing && setChrome(false)}
        className="on-dark relative mx-auto overflow-hidden rounded-2xl bg-black"
        style={{
          ...pictureBox(ratio, MAX_PICTURE_VH),
          cursor: hidden ? "none" : "default",
        }}
      >
        {close}
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
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
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
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
      {strip}
    </>
  );
}
