"use client";

import { useState } from "react";

/**
 * The hero's demo video — "Final demo draft" (2:10) on Vimeo.
 *
 * `background=1` is Vimeo's chromeless autoplay/loop/muted mode: the only mode
 * that autoplays reliably, and the right one for a hero. `dnt=1` asks Vimeo not
 * to track viewers.
 *
 * The local reel renders underneath and plays until the iframe reports loaded,
 * which covers the negotiation gap so the panel is never an empty box.
 *
 * It does NOT cover a blocked embed: `onLoad` fires for Vimeo's error page too,
 * and the iframe is cross-origin so there is no way to tell the difference from
 * here. If Vimeo ever refuses to serve this video, set VIMEO_ID to "" and the
 * local file takes over completely.
 */

export const VIMEO_ID = "1167173477";

const LOCAL_FALLBACK = "/reels/showreel-hero.mp4";

const VIMEO_PARAMS = [
  "background=1",
  "autoplay=1",
  "loop=1",
  "muted=1",
  "autopause=0",
  "dnt=1",
].join("&");

export default function HeroMedia({ title }: { title: string }) {
  const [vimeoLoaded, setVimeoLoaded] = useState(false);

  return (
    <>
      {/* Base layer: always mounted, always playing. */}
      <video
        src={LOCAL_FALLBACK}
        autoPlay
        muted
        loop
        playsInline
        aria-label={title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {VIMEO_ID ? (
        <iframe
          src={`https://player.vimeo.com/video/${VIMEO_ID}?${VIMEO_PARAMS}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          onLoad={() => setVimeoLoaded(true)}
          /* 16:9 cover — whichever axis is short gets overflowed, so the panel
             is always filled whatever its aspect. */
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78vh)] -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-700 ${
            vimeoLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </>
  );
}
