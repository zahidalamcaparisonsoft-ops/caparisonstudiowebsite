"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Raw-vs-final scrubber.
 *
 * The strongest sales tool an editing studio has: clients do not buy "editing",
 * they buy the difference between what they shot and what goes out. Nothing on
 * the original site showed that difference.
 *
 * Pass `beforeSrc` / `afterSrc` (image or video) to use real frames. Without
 * them the two panes render synthesised stand-ins that still demonstrate the
 * interaction — an ungraded camera frame on the left, a finished, graded and
 * titled frame on the right.
 */

type Props = {
  beforeSrc?: string;
  afterSrc?: string;
  title?: string;
  caption?: string;
};

export default function BeforeAfter({
  beforeSrc,
  afterSrc,
  title = "Deep Field — Ep. 14",
  caption = "…and that's the part nobody tells you about deep-sky imaging.",
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = host.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      setFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [setFromClientX]);

  return (
    <div className="w-full">
      <div
        ref={host}
        className="on-dark group relative aspect-video w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-ink/10 bg-black shadow-[0_30px_70px_-40px_rgba(5,30,24,.5)]"
        onPointerDown={(e) => {
          dragging.current = true;
          setFromClientX(e.clientX);
        }}
      >
        {/* AFTER — the finished, graded, titled frame. Full width underneath. */}
        <div className="absolute inset-0">
          {afterSrc ? (
            <video
              src={afterSrc}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <SynthFinal title={title} caption={caption} />
          )}
        </div>

        {/* BEFORE — raw camera frame, clipped to the left of the handle. */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          {beforeSrc ? (
            <video
              src={beforeSrc}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <SynthRaw />
          )}
        </div>

        {/* Labels */}
        <span
          className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/20 bg-black/70 px-2.5 py-1 font-mono text-[10px] tracking-wide text-white/80 backdrop-blur transition-opacity sm:left-5 sm:top-5"
          style={{ opacity: pos > 14 ? 1 : 0 }}
        >
          Raw
        </span>
        <span
          className="pointer-events-none absolute right-3 top-3 rounded-md border border-mint/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] tracking-wide text-mint backdrop-blur transition-opacity sm:right-5 sm:top-5"
          style={{ opacity: pos < 86 ? 1 : 0 }}
        >
          Final cut
        </span>

        {/* Handle */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-px bg-mint shadow-[0_0_18px_2px_rgba(27,237,172,.55)]"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-mint/60 bg-black/85 backdrop-blur">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
              <path
                d="M6 1L1 6l5 5M12 1l5 5-5 5"
                stroke="#1BEDAC"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {/* Keyboard-operable control layered over the whole frame. */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Reveal the raw footage or the final cut"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>

      <p className="mt-3 text-center font-mono text-xs text-muted">
        Drag to compare · same timecode, same footage
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Synthesised stand-in frames.
   Delete these once real stills or clips are supplied.
--------------------------------------------------------------------------- */

function SynthRaw() {
  return (
    <div className="relative h-full w-full bg-[#1a1c1b]">
      {/* Flat, low-contrast, slightly green-grey — an ungraded log frame. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_45%_35%,#3a3f3d_0%,#262a29_45%,#1a1c1b_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(120,130,125,.18)_0%,transparent_45%)]" />
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]" />

      {/* Camera overlay furniture */}
      <div className="absolute left-3 top-11 flex items-center gap-1.5 sm:left-5 sm:top-14">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span className="font-mono text-[10px] tracking-widest text-white/70">REC</span>
      </div>
      <span className="absolute bottom-3 left-3 font-mono text-[10px] tracking-widest text-white/55 sm:bottom-5 sm:left-5">
        A001_C014 · 01:14:22:08
      </span>
      <span className="absolute bottom-3 right-3 font-mono text-[10px] tracking-widest text-white/55 sm:bottom-5 sm:right-5">
        LOG · NO LUT
      </span>

      {/* Framing guides */}
      <div className="absolute inset-0 opacity-25">
        <span className="absolute left-1/3 top-0 h-full w-px bg-white/30" />
        <span className="absolute left-2/3 top-0 h-full w-px bg-white/30" />
        <span className="absolute left-0 top-1/3 h-px w-full bg-white/30" />
        <span className="absolute left-0 top-2/3 h-px w-full bg-white/30" />
      </div>
    </div>
  );
}

function SynthFinal({ title, caption }: { title: string; caption: string }) {
  return (
    <div className="relative h-full w-full bg-black">
      {/* Graded: deeper blacks, lifted mint highlights, real contrast. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_110%_at_42%_30%,#1c5e4b_0%,#0b2c24_42%,#03100c_78%,#000_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(102deg,rgba(27,237,172,.28)_0%,transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_78%_18%,rgba(140,251,218,.22),transparent_70%)]" />

      {/* Letterbox */}
      <span className="absolute inset-x-0 top-0 h-[7%] bg-black" />
      <span className="absolute inset-x-0 bottom-0 h-[7%] bg-black" />

      {/* Lower third */}
      <div className="absolute bottom-[16%] left-3 sm:left-6">
        <span className="block h-0.5 w-9 bg-mint" />
        <span className="mt-2 block font-display text-[clamp(.85rem,2.4vw,1.35rem)] font-extrabold leading-tight text-white">
          {title}
        </span>
        <span className="mt-0.5 block font-mono text-[9px] tracking-[0.04em] text-mint sm:text-[10px]">
          Caparison Studio
        </span>
      </div>

      {/* Burned-in caption */}
      <span className="absolute bottom-[9.5%] left-1/2 max-w-[80%] -translate-x-1/2 rounded bg-black/55 px-2 py-1 text-center text-[clamp(.5rem,1.5vw,.75rem)] font-semibold leading-snug text-white">
        {caption}
      </span>
    </div>
  );
}
