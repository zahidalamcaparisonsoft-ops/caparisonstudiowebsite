"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The studio's journey as a clock.
 *
 * The dial carries one mark per year and the hand walks a year every few
 * seconds; the story for whatever year it is pointing at sits underneath. The
 * hand can be dragged straight to a year, and there is a pause button, because
 * text that moves on a timer while you are still reading it is the fastest way
 * to make a section useless.
 *
 * The hand's angle is one continuous number, not an index. Storing the index
 * and deriving the angle means 2026 → 2014 unwinds the whole face backwards;
 * letting the angle keep climbing means it just carries on round, and the year
 * falls out of it with a modulo.
 *
 * Placeholder content. The figures are kept in step with the band above
 * (fourteen people, 1,240 videos, 98% on time) so the two cannot contradict
 * each other, and each entry takes an optional `image` for a real photograph —
 * without one it falls back to a generated plate.
 */

type Milestone = {
  year: string;
  title: string;
  copy: string;
  hue: number;
  image?: string;
};

const MILESTONES: Milestone[] = [
  {
    year: "2014",
    title: "Two people and one edit suite",
    copy: "Founded in Berlin cutting music documentaries, working out of a room with one monitor between us.",
    hue: 152,
  },
  {
    year: "2015",
    title: "First paid festival cut",
    copy: "A forty-minute assembly turned round in nine days, which taught us what our own deadlines were actually worth.",
    hue: 172,
  },
  {
    year: "2016",
    title: "The first retainer",
    copy: "A weekly show that had to ship every Thursday. The cadence it forced on us became the way the studio runs.",
    hue: 196,
  },
  {
    year: "2017",
    title: "Templates, locked",
    copy: "Stopped rebuilding titles per project. One locked template per client, versioned, so nothing drifts between episodes.",
    hue: 214,
  },
  {
    year: "2018",
    title: "Colour and sound in-house",
    copy: "Stopped subcontracting the finish. One team from rushes to master, which took a week out of every delivery.",
    hue: 232,
  },
  {
    year: "2019",
    title: "Retention became the brief",
    copy: "Started reading the analytics behind every cut we shipped, and rewriting the first thirty seconds until they held.",
    hue: 258,
  },
  {
    year: "2020",
    title: "Review moved off email",
    copy: "Built the timecode review portal after losing one too many notes in a thread. Revisions have been comments on a frame ever since.",
    hue: 284,
  },
  {
    year: "2021",
    title: "Named editors",
    copy: "Every channel got one editor who stays with it, so the person cutting your video is the person who cut the last one.",
    hue: 310,
  },
  {
    year: "2022",
    title: "Five hundredth video",
    copy: "Delivered for automation channels, podcasts and product teams — and started publishing the retention data behind the cuts.",
    hue: 334,
  },
  {
    year: "2023",
    title: "Same-day quotes",
    copy: "Put the price on screen before the brief is sent. No call required to find out what a cut costs.",
    hue: 14,
  },
  {
    year: "2024",
    title: "Fourteen editors, four time zones",
    copy: "A crew that covers the clock, so a Friday delivery does not depend on one person's Friday.",
    hue: 38,
  },
  {
    year: "2025",
    title: "Ninety-eight per cent, on time",
    copy: "The delivery record stopped being a claim and started being a number we publish.",
    hue: 62,
  },
  {
    year: "2026",
    title: "1,240 videos in",
    copy: "Ten years on, the rule has not moved: the edit serves the watch time, not the editor's ego.",
    hue: 104,
  },
];

const N = MILESTONES.length;
const STEP = 360 / N; // degrees between years
const DWELL = 3000; // how long the hand rests on a year
const SWEEP = 620; // how long it takes to walk to the next
const R = 210; // dial radius in viewBox units

const mod = (v: number, m: number) => ((v % m) + m) % m;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Polar to cartesian, with 0° at the top of the face. */
const at = (angle: number, radius: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: 250 + radius * Math.cos(rad), y: 250 + radius * Math.sin(rad) };
};

function Plate({ item }: { item: Milestone }) {
  if (item.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.image} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 100% at 28% 10%, hsl(${item.hue} 46% 26%) 0%, hsl(${item.hue} 42% 13%) 52%, #050a08 100%)`,
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center font-display text-[clamp(3rem,9vw,6rem)] font-extrabold tracking-[-0.04em] text-white/12"
      >
        {item.year}
      </span>
    </>
  );
}

export default function Milestones() {
  /* One continuous angle. `index` is read back out of it. */
  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const target = useRef(0);
  const restUntil = useRef(0);
  const dragging = useRef(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const dial = useRef<SVGSVGElement>(null);
  const index = mod(Math.round(angle / STEP), N);
  const item = MILESTONES[index];

  /* ── the hand ── */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaused(true);
      return;
    }
    let frame = 0;
    let from = 0;
    let started = 0; // when the current sweep began; 0 means resting
    let sweepTo = 0; // the target that sweep is heading for

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (dragging.current) return;

      /* `started` decides whether a sweep is running, not the distance left.
         Measuring the remaining gap looks equivalent and is not: the cubic
         ease puts the hand within a hundredth of a degree of its target at
         about 93% of the way, so a gap test flips to "arrived" before the
         sweep finishes — and the branch that sets the dwell never runs. The
         hand then walked a year every half second with no rest at all. */
      if (started) {
        // A click or a key can retarget mid-sweep; pick the new one up from
        // wherever the hand has got to.
        if (target.current !== sweepTo) {
          from = angleRef.current;
          started = now;
          sweepTo = target.current;
        }
        const k = Math.min(1, (now - started) / SWEEP);
        angleRef.current = from + (sweepTo - from) * easeOut(k);
        if (k >= 1) {
          angleRef.current = sweepTo;
          started = 0;
          restUntil.current = now + DWELL;
        }
        setAngle(angleRef.current);
        return;
      }

      if (Math.abs(target.current - angleRef.current) > 0.001) {
        from = angleRef.current;
        started = now;
        sweepTo = target.current;
        return;
      }

      if (pausedRef.current) {
        // Keeps the clock from lurching the moment it is unpaused.
        restUntil.current = now + DWELL;
        return;
      }
      if (now >= restUntil.current) target.current = angleRef.current + STEP;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ── dragging the hand ── */
  const angleFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = dial.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const dx = clientX - (r.left + r.width / 2);
    const dy = clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < 12) return null; // too close to the pivot to mean anything
    const raw = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    /* Unwrap onto the turn the hand is already on, or dragging past the top
       would spin it a whole revolution the other way. */
    const base = angleRef.current;
    return base + ((((raw - base) % 360) + 540) % 360) - 180;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const a = angleFromPointer(e.clientX, e.clientY);
      if (a === null) return;
      dragging.current = true;
      angleRef.current = a;
      target.current = a;
      setAngle(a);
    },
    [angleFromPointer],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const a = angleFromPointer(e.clientX, e.clientY);
      if (a === null) return;
      angleRef.current = a;
      target.current = a;
      setAngle(a);
    };
    const up = () => {
      if (!dragging.current) return;
      dragging.current = false;
      // Settle onto the nearest year rather than between two.
      target.current = Math.round(angleRef.current / STEP) * STEP;
      restUntil.current = performance.now() + DWELL;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [angleFromPointer]);

  /** Sends the hand to a year the short way round. */
  const goTo = useCallback((i: number) => {
    const current = angleRef.current;
    const want = i * STEP;
    const delta = mod(want - current, 360);
    target.current = current + (delta > 180 ? delta - 360 : delta);
  }, []);

  const handFrom = at(angle, 112);
  const hand = at(angle, R - 34);

  return (
    <div className="mt-14">
      <div className="max-w-2xl">
        <h3 className="font-display text-[clamp(1.6rem,3.6vw,2.4rem)] font-extrabold leading-tight tracking-[-0.03em] text-ink">
          Ten years of other people&apos;s footage.
        </h3>
        <p className="mt-4 leading-relaxed text-body">
          Every year here changed how the next one was cut. Drag the hand, or let
          it walk.
        </p>
      </div>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
        {/* ── The dial ── */}
        <div className="relative mx-auto w-full max-w-[420px]">
          <svg
            ref={dial}
            viewBox="-42 -30 584 584"
            role="group"
            aria-label="Studio timeline, 2014 to 2026"
            onPointerDown={onPointerDown}
            className="w-full cursor-grab touch-none select-none active:cursor-grabbing"
          >
            <circle cx="250" cy="250" r={R} fill="none" stroke="rgba(7,20,16,.1)" strokeWidth="1" />
            <circle cx="250" cy="250" r={R - 30} fill="none" stroke="rgba(7,20,16,.06)" strokeWidth="1" />

            {MILESTONES.map((m, i) => {
              const a = i * STEP;
              const on = i === index;
              const tick0 = at(a, R);
              const tick1 = at(a, on ? R - 20 : R - 12);
              const label = at(a, R + 26);
              return (
                <g key={m.year}>
                  <line
                    x1={tick0.x}
                    y1={tick0.y}
                    x2={tick1.x}
                    y2={tick1.y}
                    stroke={on ? "var(--color-brand)" : "rgba(7,20,16,.22)"}
                    strokeWidth={on ? 3 : 1.5}
                    strokeLinecap="round"
                  />
                  {/* A real button per year, so the dial is reachable without
                      a pointer and every year has a name in the tree. */}
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    role="button"
                    tabIndex={0}
                    aria-label={`Show ${m.year}`}
                    aria-current={on}
                    onClick={() => goTo(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goTo(i);
                      }
                    }}
                    className={`cursor-pointer font-mono text-[19px] transition-colors ${
                      on ? "fill-[var(--color-brand)] font-bold" : "fill-[var(--color-muted)]"
                    }`}
                  >
                    {m.year}
                  </text>
                </g>
              );
            })}

            {/* The hand. It starts clear of the centre year rather than at the
                pivot — run to the middle it cut straight through the figure. */}
            <line
              x1={handFrom.x}
              y1={handFrom.y}
              x2={hand.x}
              y2={hand.y}
              stroke="var(--color-brand)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx={hand.x} cy={hand.y} r="9" fill="var(--color-brand)" />
            <circle cx={hand.x} cy={hand.y} r="15" fill="none" stroke="var(--color-brand)" strokeOpacity=".3" strokeWidth="2" />

            {/* Year in the middle of the face */}
            <text
              x="250"
              y="250"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-[var(--color-ink)] font-display text-[62px] font-extrabold tracking-[-0.04em]"
              style={{ pointerEvents: "none" }}
            >
              {item.year}
            </text>
          </svg>

          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-pressed={paused}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-body transition-colors hover:border-brand/50 hover:text-brand"
            >
              {paused ? (
                <svg width="11" height="13" viewBox="0 0 16 18" aria-hidden="true">
                  <path d="M15 9L1 17.66V.34L15 9z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="11" height="13" viewBox="0 0 12 14" aria-hidden="true">
                  <rect x="0" y="0" width="4" height="14" rx="1" fill="currentColor" />
                  <rect x="8" y="0" width="4" height="14" rx="1" fill="currentColor" />
                </svg>
              )}
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>

        {/* ── The year's story ── */}
        <div>
          <div className="on-dark relative aspect-[16/10] overflow-hidden rounded-2xl border border-ink/10 shadow-[0_30px_70px_-40px_rgba(5,30,24,.5)]">
            {/* Keyed by year so a change re-mounts and re-runs the fade. */}
            <div key={item.year} className="absolute inset-0 [animation:plateIn_.5s_ease-out]">
              <Plate item={item} />
            </div>
          </div>

          <div key={item.year} className="mt-6 [animation:plateIn_.5s_ease-out]">
            <span className="font-mono text-sm font-bold text-brand">{item.year}</span>
            <h4 className="mt-2 font-display text-xl font-extrabold tracking-[-0.02em] text-ink sm:text-2xl">
              {item.title}
            </h4>
            <p className="mt-3 max-w-xl leading-relaxed text-body">{item.copy}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
