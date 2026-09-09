"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The hero's demo video — "Final demo draft" on Vimeo.
 *
 * Two states:
 *
 *  ambient  muted, looping, chromeless. Nobody arriving on the page gets
 *           sound they did not ask for.
 *  live     user pressed play: restarts from zero, unmuted, full controls.
 *
 * The Vimeo switch is a src swap plus a remount (`key`), because
 * `background=1` hard-disables the control bar — there is no parameter that
 * turns it back on for a live player. Remounting inside the click also keeps
 * the gesture attached, which is what lets it autoplay with sound.
 *
 * The wait is covered by Vimeo's own still for the same film, in the HTML from
 * the first byte. It used to be covered by a second, unrelated reel, which
 * meant downloading 417KB to throw away and showing the visitor footage that
 * was not the one they were about to watch — and the two of them raced each
 * other for the connection on the way in.
 *
 * The still lifts when the player says it is *playing*, not when the iframe
 * says it has loaded: `onLoad` fires for the player page, several hundred
 * milliseconds before a frame exists, and for Vimeo's error page too. Vimeo's
 * postMessage protocol is the only way to hear about real playback from the
 * outside of a cross-origin frame — the same protocol the testimonial band
 * uses to hear about the end of one.
 *
 * A local file is still supported and still preferred when there is one: set
 * `videoUrl` (or clear the Vimeo id) and it plays directly, same origin, with
 * no negotiation at all.
 */

export const VIMEO_ID = "1167173477";

const LOCAL_FALLBACK = "/reels/showreel-hero.mp4";

/** Vimeo's player speaks JSON over postMessage from exactly this origin. */
const VIMEO_ORIGIN = "https://player.vimeo.com";

/* The player does not always answer: an ad blocker, a privacy extension or a
   blocked embed all leave the postMessage channel silent. So the still also
   lifts a moment after the frame loads, which is roughly when there is
   something behind it to see. Counted from load rather than from mount, so
   this is never slower than simply revealing on load — which is all the hero
   used to do. A real playback event beats it whenever one arrives. */
const REVEAL_AFTER_LOAD_MS = 1200;

const AMBIENT_PARAMS = [
  "background=1", // chromeless autoplay/loop/muted
  "autoplay=1",
  "loop=1",
  "muted=1",
  "autopause=0",
  "dnt=1", // ask Vimeo not to track viewers
].join("&");

const LIVE_PARAMS = [
  "autoplay=1",
  "muted=0",
  "controls=1",
  "title=0",
  "byline=0",
  "portrait=0",
  "dnt=1",
].join("&");

export default function HeroMedia({
  title,
  vimeoId,
  videoUrl,
  poster,
  onLiveChange,
}: {
  title: string;
  /** From the admin panel; falls back to the built-in id. */
  vimeoId?: string;
  videoUrl?: string;
  /** Vimeo's still for the same film, covering the wait. */
  poster?: string;
  /** Lets the hero clear its overlays once real playback starts. */
  onLiveChange?: (live: boolean) => void;
}) {
  const id = vimeoId ?? VIMEO_ID;
  /* A file of our own beats an embed every time — same origin, no handshake —
     so Vimeo is only asked for when there is no file to play. */
  const localSrc = videoUrl || (id ? "" : LOCAL_FALLBACK);
  const [live, setLive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const local = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Ask the player to tell us when it starts. It answers on the same channel,
     so the listener below picks up both the reply and the event. */
  const subscribe = useCallback(() => {
    const win = frame.current?.contentWindow;
    if (!win) return;
    for (const value of ["play", "playing", "timeupdate"]) {
      win.postMessage(
        JSON.stringify({ method: "addEventListener", value }),
        VIMEO_ORIGIN,
      );
    }
  }, []);

  const onFrameLoad = useCallback(() => {
    subscribe();
    if (graceTimer.current) clearTimeout(graceTimer.current);
    graceTimer.current = setTimeout(() => setPlaying(true), REVEAL_AFTER_LOAD_MS);
  }, [subscribe]);

  useEffect(
    () => () => {
      if (graceTimer.current) clearTimeout(graceTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!id) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== VIMEO_ORIGIN) return;
      let event: unknown;
      try {
        event = typeof e.data === "string" ? JSON.parse(e.data)?.event : undefined;
      } catch {
        return;
      }
      /* `play` is the older name for it and `playing` the newer; `timeupdate`
         is the belt and braces, since it cannot fire before a frame exists. */
      if (event === "play" || event === "playing" || event === "timeupdate")
        setPlaying(true);
      if (event === "ready") subscribe();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [id, subscribe]);

  function play() {
    setLive(true);
    onLiveChange?.(true);

    // Local path: rewind, unmute, hand over the native controls.
    const el = local.current;
    if (el && !id) {
      el.currentTime = 0;
      el.muted = false;
      el.controls = true;
      void el.play().catch(() => {});
    }
  }

  return (
    <>
      {/* The still, in the HTML from the first byte. It is the same film's own
          frame, so there is nothing to notice when the player takes over. */}
      {poster && !live ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          /* The largest thing above the fold, and the first thing anyone
             sees — the one image on the page that must not be lazy. */
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-0" : "opacity-100"
          }`}
        />
      ) : null}

      {/* A file of our own, where there is one. */}
      {localSrc && !(live && id) ? (
        <video
          ref={local}
          src={localSrc}
          autoPlay
          muted
          loop
          playsInline
          aria-label={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {id ? (
        <iframe
          ref={frame}
          key={live ? "live" : "ambient"}
          src={`https://player.vimeo.com/video/${id}?${live ? LIVE_PARAMS : AMBIENT_PARAMS}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          onLoad={onFrameLoad}
          className={
            live
              ? // Exactly the panel box, so Vimeo's control bar stays on screen.
                // The ambient crop below would push it out of view.
                "absolute inset-0 h-full w-full border-0"
              : `pointer-events-none absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78vh)] -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-700 ${
                  playing ? "opacity-100" : "opacity-0"
                }`
          }
        />
      ) : null}

      {!live ? (
        <button
          type="button"
          onClick={play}
          aria-label="Play the showreel with sound"
          className="group absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/35 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-mint hover:bg-mint/25 sm:h-24 sm:w-24"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-white/25 opacity-70 transition-transform duration-700 group-hover:scale-125 group-hover:opacity-0"
          />
          <svg
            width="22"
            height="26"
            viewBox="0 0 16 18"
            fill="none"
            aria-hidden="true"
            className="ml-1"
          >
            <path d="M15 9L1 17.66V.34L15 9z" fill="#fff" />
          </svg>
        </button>
      ) : null}
    </>
  );
}
