"use client";

/**
 * The hero's demo video.
 *
 * The real upload is wired up below. It is NOT live yet because Vimeo is
 * refusing to serve the player:
 *
 *   GET https://player.vimeo.com/video/1167173477  ->  401
 *
 * That 401 comes back for every referer, and for the bare player URL with no
 * referer at all, so it is the video's own privacy setting rather than anything
 * about our domain. oEmbed resolves fine ("Final demo draft", 2:10), which means
 * the video exists and is processed — only embedding is blocked.
 *
 * To switch it on, in Vimeo → the video → Settings → Privacy:
 *   • "Who can watch this video?"      → Anyone (or Unlisted)
 *   • "Where can this be embedded?"    → Anywhere, or add the site's domain
 * then set VIMEO_READY to true.
 *
 * Until then the panel plays the local placeholder reel, so the hero is never
 * broken.
 */

export const VIMEO_ID = "1167173477";

/** Flip to true once the embed above stops returning 401. */
export const VIMEO_READY = false;

const LOCAL_FALLBACK = "/reels/showreel-hero.mp4";

/* `background=1` is Vimeo's chromeless autoplay/loop/muted mode — the only mode
   that autoplays reliably, and the right one for a hero. `dnt=1` asks Vimeo not
   to track viewers. */
const VIMEO_PARAMS = [
  "background=1",
  "autoplay=1",
  "loop=1",
  "muted=1",
  "autopause=0",
  "dnt=1",
].join("&");

export default function HeroMedia({ title }: { title: string }) {
  if (VIMEO_ID && VIMEO_READY) {
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
