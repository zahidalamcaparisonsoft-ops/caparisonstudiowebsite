"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStageProgress } from "@/lib/hooks";
import { nextAvailableSlot } from "@/lib/quote";

// Client-only and lazily loaded, so WebGL never blocks first paint.
const CloudField = dynamic(() => import("./webgl/CloudField"), { ssr: false });

const REEL_SRC = "/reels/showreel-hero.mp4";

function timecode(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * 24);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
}

export default function Hero() {
  // The section is taller than the viewport; the stage inside it is sticky.
  // Scrolling that extra height clears the clouds and hands over to the next
  // section, rather than the hero simply scrolling off.
  const [stage, progress] = useStageProgress<HTMLElement>();

  const inline = useRef<HTMLVideoElement>(null);
  const full = useRef<HTMLVideoElement>(null);

  const [slot, setSlot] = useState<string | null>(null);
  const [cinema, setCinema] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => setSlot(nextAvailableSlot()), []);

  const open = useCallback(() => {
    setCinema(true);
    const src = inline.current;
    const dst = full.current;
    if (src && dst) {
      // Hand the playhead over so the reel continues rather than restarting.
      dst.currentTime = src.currentTime;
      dst.muted = false;
      void dst.play().catch(() => {
        dst.muted = true;
        void dst.play().catch(() => {});
      });
      setMuted(dst.muted);
    }
  }, []);

  const close = useCallback(() => {
    setCinema(false);
    const dst = full.current;
    if (dst) {
      dst.pause();
      dst.muted = true;
    }
    setMuted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = cinema ? "hidden" : "";
    // Header and scroll rail hide via CSS on this class.
    document.documentElement.classList.toggle("cinema-open", cinema);
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("cinema-open");
    };
  }, [cinema]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!cinema) return;
    let raf = 0;
    const tick = () => {
      const el = full.current;
      if (el) {
        setTime(el.currentTime);
        if (Number.isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cinema]);

  // Content lifts and fades as the clouds clear.
  const lift = {
    transform: `translate3d(0, ${(-progress * 70).toFixed(1)}px, 0) scale(${(1 - progress * 0.07).toFixed(3)})`,
    opacity: Math.max(0, 1 - progress * 0.85),
  };

  return (
    <section id="top" ref={stage} className="relative h-[200svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Cloud bank — sits under the reel and fills the lower half. */}
        <div className="absolute inset-0">
          <CloudField progress={progress} />
        </div>

        {/* Grounds the bank so it does not stop at a hard edge. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent"
        />

        <div
          className="relative z-10 flex h-full flex-col items-center justify-center px-5 pb-20 pt-20 text-center sm:px-8 sm:pb-24 sm:pt-24"
          style={lift}
        >
          <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-mint sm:text-xs">
            <span className="h-px w-6 bg-mint" />
            Video editing studio
            <span className="h-px w-6 bg-mint" />
          </span>

          <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-extrabold leading-[1] tracking-[-0.035em] text-white">
            Cut for{" "}
            <span className="text-mint [text-shadow:0_0_70px_rgba(27,237,172,.5)]">
              retention
            </span>
            , not applause.
          </h1>

          <p className="mt-3 max-w-lg text-sm text-white/55">
            Long-form, shorts and product films for teams who publish every week.
          </p>

          {/* The reel is sized by viewport HEIGHT, not width — width follows from
              the aspect ratio. Sizing it by width overflowed short viewports and
              pushed the CTAs off screen. */}
          {/* inline-flex column: the container takes the button's width, so the
              slate above lines up with the frame exactly. */}
          <div className="relative mt-5 inline-flex max-w-full flex-col">
            <div className="mb-2 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
              <span className="text-mint">Showreel 2026</span>
              <span>4K · 23.976</span>
            </div>

            <button
              type="button"
              onClick={open}
              aria-label="Play the showreel"
              className="group relative block aspect-video h-[27svh] max-w-full overflow-hidden sm:h-[34svh] lg:h-[40svh] rounded-2xl border border-white/12 bg-black shadow-[0_40px_120px_-40px_rgba(27,237,172,.45)] transition-transform duration-500 hover:scale-[1.01]"
            >
              <video
                ref={inline}
                src={REEL_SRC}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />

              <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-mint/50 bg-black/45 backdrop-blur transition-all duration-500 group-hover:scale-110 group-hover:border-mint group-hover:bg-mint/20">
                <svg width="17" height="19" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                  <path d="M15 9L1 17.66V.34L15 9z" fill="#1BEDAC" />
                </svg>
              </span>

              <span className="absolute bottom-3 right-3 rounded-md border border-white/15 bg-black/70 px-2 py-1 font-mono text-[10px] text-white/75 backdrop-blur">
                02:24
              </span>
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#onboarding"
              className="rounded-full bg-mint px-7 py-3.5 text-center text-base font-bold text-black shadow-[0_0_30px_-4px_rgba(27,237,172,.65)] transition-all hover:-translate-y-0.5 hover:bg-mint-bright"
            >
              Start a project →
            </Link>
            <Link
              href="#work"
              className="rounded-full border border-white/15 bg-black/30 px-7 py-3.5 text-center text-base font-bold text-white backdrop-blur transition-all hover:border-mint/40 hover:bg-white/5"
            >
              See the work
            </Link>
          </div>

          {slot ? (
            <p className="mt-5 flex items-center gap-2.5 font-mono text-[11px] text-white/45">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              Next start date: {slot} · 2 slots left this month
            </p>
          ) : null}

        </div>

      </div>

      {/* ── Cinema overlay ── */}
      <div
        className={`fixed inset-0 z-[60] bg-black transition-opacity duration-500 ${
          cinema ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <video
          ref={full}
          src={REEL_SRC}
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        />

        <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-md border border-mint/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-mint backdrop-blur">
              Showreel · Program
            </span>
            <button
              type="button"
              onClick={close}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur transition-colors hover:border-mint/50 hover:text-mint"
              aria-label="Close the reel"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-mint">{timecode(time)}</span>
              <div className="relative flex-1">
                <div className="h-1 overflow-hidden rounded-full bg-white/15">
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
                    const el = full.current;
                    if (el) el.currentTime = Number(e.target.value);
                  }}
                  aria-label="Scrub the reel"
                  className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
                />
              </div>
              <span className="font-mono text-xs text-white/40">
                {timecode(duration)}
              </span>
              <button
                type="button"
                onClick={() => {
                  const el = full.current;
                  if (!el) return;
                  el.muted = !el.muted;
                  setMuted(el.muted);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur transition-colors hover:border-mint/50 hover:text-mint"
                aria-label={muted ? "Unmute" : "Mute"}
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
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
              Placeholder reel · press esc to exit
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
