"use client";

import { useRef, useState } from "react";

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
 * The local reel renders underneath and plays until the iframe reports loaded,
 * covering the negotiation gap. It does NOT cover a blocked embed: `onLoad`
 * fires for Vimeo's error page too, and the iframe is cross-origin, so there
 * is no way to tell from here. Set VIMEO_ID to "" to use the local file only.
 */

export const VIMEO_ID = "1167173477";

const LOCAL_FALLBACK = "/reels/showreel-hero.mp4";

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
  onLiveChange,
}: {
  title: string;
  /** From the admin panel; falls back to the built-in id. */
  vimeoId?: string;
  videoUrl?: string;
  /** Lets the hero clear its overlays once real playback starts. */
  onLiveChange?: (live: boolean) => void;
}) {
  const id = vimeoId ?? VIMEO_ID;
  const localSrc = videoUrl || LOCAL_FALLBACK;
  const [live, setLive] = useState(false);
  const [vimeoLoaded, setVimeoLoaded] = useState(false);
  const local = useRef<HTMLVideoElement>(null);

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
      {/* Ambient underlay — hidden once Vimeo takes over for real playback. */}
      {!(live && id) ? (
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
          key={live ? "live" : "ambient"}
          src={`https://player.vimeo.com/video/${id}?${live ? LIVE_PARAMS : AMBIENT_PARAMS}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          onLoad={() => setVimeoLoaded(true)}
          className={
            live
              ? // Exactly the panel box, so Vimeo's control bar stays on screen.
                // The ambient crop below would push it out of view.
                "absolute inset-0 h-full w-full border-0"
              : `pointer-events-none absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78vh)] -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-700 ${
                  vimeoLoaded ? "opacity-100" : "opacity-0"
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
