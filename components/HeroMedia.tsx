"use client";

/**
 * The hero's demo video.
 *
 * Set VIMEO_ID to the id of the uploaded demo (the digits in
 * vimeo.com/1234567890) and the Vimeo player takes over. Until then it plays
 * the local placeholder reel, so the page is never broken while you upload.
 *
 * `background=1` gives a chromeless, autoplaying, looping, muted player — the
 * only mode Vimeo allows to autoplay reliably, and the right one for a hero.
 */

export const VIMEO_ID = ""; // ← put the Vimeo id here

const LOCAL_FALLBACK = "/reels/showreel-hero.mp4";

const VIMEO_PARAMS = [
  "background=1",
  "autoplay=1",
  "loop=1",
  "muted=1",
  "autopause=0",
  "dnt=1", // ask Vimeo not to track viewers
].join("&");

export default function HeroMedia({ title }: { title: string }) {
  if (VIMEO_ID) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${VIMEO_ID}?${VIMEO_PARAMS}`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        loading="lazy"
        /* 16:9 cover — whichever axis is short gets overflowed, so the panel is
           always filled whatever its aspect. */
        className="pointer-events-none absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78vh)] -translate-x-1/2 -translate-y-1/2 border-0"
      />
    );
  }

  return (
    <video
      src={LOCAL_FALLBACK}
      autoPlay
      muted
      loop
      playsInline
      aria-label={title}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
