"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACTION_META,
  DECISIONS,
  FINAL_RUNTIME,
  RAW_RUNTIME,
  TOTAL_DELTA,
  timecode,
  type Decision,
} from "@/lib/anatomy";

/**
 * Scrubbable edit timeline.
 *
 * Full-bleed on purpose — it is the one section that breaks the 1240px
 * container, which is what makes it read as the centrepiece rather than
 * another card grid.
 */

function decisionAt(seconds: number): Decision {
  for (const d of DECISIONS) {
    if (seconds >= d.at && seconds < d.at + d.span) return d;
  }
  return DECISIONS[DECISIONS.length - 1];
}

export default function AnatomyOfACut() {
  const track = useRef<HTMLDivElement>(null);
  const [head, setHead] = useState(54);
  const [playing, setPlaying] = useState(false);
  const dragging = useRef(false);

  const active = decisionAt(head);
  const activeIndex = DECISIONS.indexOf(active);

  const setFromClientX = useCallback((clientX: number) => {
    const el = track.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    setHead(Math.min(RAW_RUNTIME - 1, Math.max(0, pct * RAW_RUNTIME)));
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      setFromClientX(e.clientX);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [setFromClientX]);

  // Walk the decisions one at a time rather than scrubbing in real time —
  // the point is the reasoning, not the runtime.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setHead((prev) => {
        const i = DECISIONS.indexOf(decisionAt(prev));
        const next = DECISIONS[i + 1];
        if (!next) {
          setPlaying(false);
          return prev;
        }
        return next.at + 1;
      });
    }, 3200);
    return () => clearInterval(id);
  }, [playing]);

  const jump = (i: number) => {
    setPlaying(false);
    setHead(DECISIONS[i].at + 1);
  };

  return (
    <section
      id="anatomy"
      className="relative overflow-hidden border-y border-white/8 py-24 md:py-32"
    >
      <span
        aria-hidden="true"
        className="orb left-[8%] top-[12%] h-[520px] w-[520px] bg-mint/8"
      />

      {/* Heading stays in the container; the timeline below does not. */}
      <div className="relative mx-auto mb-14 max-w-[1240px] px-5 sm:px-8">
        <div data-reveal="1" className="max-w-3xl">
          <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-mint">
            <span className="h-px w-7 bg-mint" />
            Anatomy of a cut
          </span>
          <h2 className="h-loud mt-5 font-display font-extrabold text-white">
            Eight decisions.
            <br />
            Three and a half minutes gone.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            This is one real episode, before and after. Scrub the assembly to see
            what we removed and why — the reasoning is the product.
          </p>
        </div>
      </div>

      {/* ── Full-bleed timeline ── */}
      <div className="relative px-5 sm:px-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Runtime summary */}
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 font-mono text-xs">
              <span className="text-white/40">
                RAW <span className="text-white/70">{timecode(RAW_RUNTIME)}</span>
              </span>
              <span className="text-mint">
                FINAL <span className="text-mint-bright">{timecode(FINAL_RUNTIME)}</span>
              </span>
              <span className="text-white/40">
                RETENTION{" "}
                <span className="text-mint-bright">+{TOTAL_DELTA} pts</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              className="flex items-center gap-2.5 rounded-full border border-mint/35 bg-mint/10 px-4 py-2 text-xs font-bold text-mint transition-colors hover:bg-mint/20"
            >
              {playing ? (
                <>
                  <svg width="9" height="11" viewBox="0 0 9 11" aria-hidden="true">
                    <rect width="3" height="11" fill="currentColor" />
                    <rect x="6" width="3" height="11" fill="currentColor" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg width="10" height="11" viewBox="0 0 10 11" aria-hidden="true">
                    <path d="M10 5.5L0 11V0z" fill="currentColor" />
                  </svg>
                  Walk me through it
                </>
              )}
            </button>
          </div>

          {/* RAW track */}
          <div
            ref={track}
            className="relative h-24 cursor-ew-resize touch-none select-none overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] sm:h-28"
            onPointerDown={(e) => {
              dragging.current = true;
              setPlaying(false);
              setFromClientX(e.clientX);
            }}
          >
            {DECISIONS.map((d, i) => {
              const removed = d.action === "cut";
              const isActive = i === activeIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    jump(i);
                  }}
                  aria-label={`${ACTION_META[d.action].label}: ${d.label}`}
                  aria-pressed={isActive}
                  className="absolute inset-y-0 border-r border-black/60 transition-opacity"
                  style={{
                    left: `${(d.at / RAW_RUNTIME) * 100}%`,
                    width: `${(d.span / RAW_RUNTIME) * 100}%`,
                    background: removed
                      ? "repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 6px, rgba(255,255,255,.015) 6px 12px)"
                      : `linear-gradient(180deg, rgba(27,237,172,${isActive ? 0.4 : 0.22}), rgba(27,237,172,${isActive ? 0.16 : 0.07}))`,
                    opacity: isActive ? 1 : 0.75,
                  }}
                >
                  {/* Hidden on phones — the narrow segments make these collide. */}
                  <span className="pointer-events-none absolute inset-x-0 top-2 hidden px-2 text-left font-mono text-[9px] uppercase tracking-wider text-white/45 sm:block">
                    {timecode(d.at)}
                  </span>
                  {/* Waveform suggestion */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-3 h-8 opacity-40"
                    style={{
                      backgroundImage: removed
                        ? "repeating-linear-gradient(90deg, rgba(255,255,255,.2) 0 1px, transparent 1px 4px)"
                        : "repeating-linear-gradient(90deg, rgba(27,237,172,.6) 0 1px, transparent 1px 4px)",
                      maskImage:
                        "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
                    }}
                  />
                </button>
              );
            })}

            {/* Playhead */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white shadow-[0_0_14px_2px_rgba(255,255,255,.5)]"
              style={{ left: `${(head / RAW_RUNTIME) * 100}%` }}
            >
              <span className="absolute -left-[4px] -top-[3px] h-2 w-2 rotate-45 bg-white" />
            </div>

            <input
              type="range"
              min={0}
              max={RAW_RUNTIME - 1}
              value={Math.round(head)}
              onChange={(e) => {
                setPlaying(false);
                setHead(Number(e.target.value));
              }}
              aria-label="Scrub the raw assembly"
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />
          </div>

          {/* FINAL track — same scale, so the length difference is the message. */}
          <div className="mt-3 flex items-center gap-4">
            <div
              className="relative h-9 overflow-hidden rounded-lg border border-mint/30"
              style={{ width: `${(FINAL_RUNTIME / RAW_RUNTIME) * 100}%` }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-mint/35 to-mint/20" />
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(27,237,172,.7) 0 1px, transparent 1px 4px)",
                }}
              />
              <span className="absolute inset-0 flex items-center px-3 font-mono text-[10px] uppercase tracking-widest text-mint-bright">
                Final cut · {timecode(FINAL_RUNTIME)}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
              ← {timecode(RAW_RUNTIME - FINAL_RUNTIME)} removed
            </span>
          </div>
        </div>
      </div>

      {/* ── Annotation ── */}
      <div className="relative mx-auto mt-10 max-w-[1600px] px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div
            key={activeIndex}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`flex items-center gap-2 rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${ACTION_META[active.action].tone}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${ACTION_META[active.action].dot}`}
                />
                {ACTION_META[active.action].label}
              </span>
              <span className="font-mono text-[11px] text-white/35">
                {timecode(active.at)} – {timecode(active.at + active.span)}
              </span>
              {active.delta > 0 ? (
                <span className="ml-auto font-mono text-xs text-mint-bright">
                  +{active.delta} pts retention
                </span>
              ) : null}
            </div>

            <h3 className="h-quiet mt-4 font-display font-extrabold text-white">
              {active.label}
            </h3>
            <p className="mt-3 max-w-2xl leading-relaxed text-white/60">
              {active.detail}
            </p>
          </div>

          {/* Step dots */}
          <div className="flex gap-2 lg:flex-col">
            {DECISIONS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => jump(i)}
                aria-label={`Decision ${i + 1}: ${d.label}`}
                aria-current={i === activeIndex}
                className={`h-2 flex-1 rounded-full transition-colors lg:h-2 lg:w-2 lg:flex-none ${
                  i === activeIndex ? "bg-mint" : "bg-white/15 hover:bg-white/35"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Non-interactive fallback: the same reasoning as plain text. */}
        <details className="mt-6">
          <summary className="cursor-pointer font-mono text-xs text-white/35 hover:text-white/60">
            Read all eight decisions as a list
          </summary>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            {DECISIONS.map((d, i) => (
              <div key={i} className="border-l border-white/10 pl-4">
                <dt className="text-sm font-bold text-white">
                  {ACTION_META[d.action].label} — {d.label}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-white/50">
                  {d.detail}
                  {d.delta > 0 ? (
                    <span className="mt-1 block font-mono text-xs text-mint">
                      +{d.delta} pts retention
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </section>
  );
}
