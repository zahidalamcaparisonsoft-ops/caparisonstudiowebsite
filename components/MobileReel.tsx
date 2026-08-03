"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Phone treatment for the showreel.
 *
 * No WebGL on phones, but also no stock player: the reel sits inside a film
 * strip — sprocket holes down both edges, a burned-in slate above and a
 * timecode below. Tap the frame to play, which is also the gesture that lets
 * us unmute.
 */
export default function MobileReel({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const onTime = () => setTime(el.currentTime);
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, []);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      el.muted = false;
      void el.play().catch(() => {
        // Some browsers still refuse unmuted playback — fall back to muted.
        el.muted = true;
        void el.play().catch(() => {});
      });
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const tc = `00:${String(Math.floor(time % 60)).padStart(2, "0")}:${String(
    Math.floor((time % 1) * 24),
  ).padStart(2, "0")}`;

  return (
    <figure className="m-0">
      <div className="flex items-center justify-between px-1 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
        <span className="text-mint">Showreel 2026</span>
        <span>4K · 23.976</span>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/12 bg-black">
        {/* Sprocket holes */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-black"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent 0 8px, rgba(255,255,255,.22) 8px 16px, transparent 16px 24px)",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-black"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent 0 8px, rgba(255,255,255,.22) 8px 16px, transparent 16px 24px)",
          }}
        />

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause the showreel" : "Play the showreel"}
          className="relative block w-full px-4"
        >
          <video
            ref={video}
            src={src}
            loop
            muted
            playsInline
            autoPlay
            className="aspect-video w-full object-cover"
          />

          {!playing ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-mint/50 bg-black/55 backdrop-blur">
                <svg width="15" height="17" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                  <path d="M15 9L1 17.66V.34L15 9z" fill="#1BEDAC" />
                </svg>
              </span>
            </span>
          ) : null}
        </button>
      </div>

      <figcaption className="flex items-center justify-between px-1 pt-2 font-mono text-[10px] text-white/35">
        <span className="text-mint">{tc}</span>
        <span>Placeholder reel</span>
      </figcaption>
    </figure>
  );
}
