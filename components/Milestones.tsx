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

/* The face, in viewBox units. */
const C = 280; // centre
const BEZEL = 272; // outer edge of the case
const FACE = 244; // where the case meets the dial
const TICKS = 232; // minute ring
const YEARS = 198; // the numerals
const CHAPTER = 158; // engraved ring the gear train sits inside
const HAND = 176; // how far the hand reaches

const mod = (v: number, m: number) => ((v % m) + m) % m;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Polar to cartesian, with 0° at the top of the face. */
const at = (angle: number, radius: number, cx = C, cy = C) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
};

/**
 * A cog, drawn about its own origin so the group placing it can also spin it.
 * Trapezoid teeth — narrower at the tip than the root — with the root arcs
 * closed between them, which is what stops it reading as a spiky star.
 */
function cog(r: number, teeth: number, depth: number) {
  const step = 360 / teeth;
  const root = step * 0.3;
  const tip = step * 0.16;
  const p = (a: number, rad: number) => at(a, rad, 0, 0);
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const [a1, a2, a3, a4] = [
      p(a - root, r),
      p(a - tip, r + depth),
      p(a + tip, r + depth),
      p(a + root, r),
    ];
    const next = p((i + 1) * step - root, r);
    d +=
      `${i === 0 ? "M" : "L"}${a1.x.toFixed(2)},${a1.y.toFixed(2)} ` +
      `L${a2.x.toFixed(2)},${a2.y.toFixed(2)} L${a3.x.toFixed(2)},${a3.y.toFixed(2)} ` +
      `L${a4.x.toFixed(2)},${a4.y.toFixed(2)} ` +
      `A${r} ${r} 0 0 1 ${next.x.toFixed(2)},${next.y.toFixed(2)} `;
  }
  return `${d}Z`;
}

/* The gear train behind the hands. Meshing gears turn opposite ways, and a
   small one has to turn faster than a big one, or the whole thing reads as
   decoration rather than a mechanism. */
const COGS = [
  { x: 0, y: 6, r: 54, teeth: 20, depth: 9, spin: 42, dir: 1, hub: 17 },
  { x: -64, y: -44, r: 34, teeth: 13, depth: 8, spin: 27, dir: -1, hub: 11 },
  { x: 62, y: -50, r: 38, teeth: 14, depth: 8, spin: 30, dir: -1, hub: 12 },
  { x: -70, y: 58, r: 27, teeth: 11, depth: 7, spin: 21, dir: -1, hub: 9 },
  { x: 68, y: 60, r: 31, teeth: 12, depth: 7, spin: 24, dir: -1, hub: 10 },
  { x: 4, y: -96, r: 19, teeth: 9, depth: 6, spin: 15, dir: 1, hub: 6 },
  { x: -8, y: 104, r: 16, teeth: 8, depth: 5, spin: 13, dir: 1, hub: 5 },
];

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
            viewBox="0 0 560 560"
            role="group"
            aria-label="Studio timeline, 2014 to 2026"
            onPointerDown={onPointerDown}
            className="w-full cursor-grab touch-none select-none drop-shadow-[0_30px_60px_rgba(5,30,24,.35)] active:cursor-grabbing"
          >
            <defs>
              {/* The metal. Swapping these three stops for ambers turns the
                  whole case brass; kept in the brand's green so the clock
                  belongs to the rest of the page. */}
              <linearGradient id="metal" x1="0" y1="0" x2="0.35" y2="1">
                <stop offset="0" stopColor="#9DEBCD" />
                <stop offset="0.35" stopColor="#43A181" />
                <stop offset="0.7" stopColor="#1E6B52" />
                <stop offset="1" stopColor="#0C3527" />
              </linearGradient>
              <linearGradient id="metalEdge" x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0" stopColor="#C6F4E2" />
                <stop offset="0.5" stopColor="#2C7C61" />
                <stop offset="1" stopColor="#0A2A1F" />
              </linearGradient>
              <radialGradient id="dial" cx="0.34" cy="0.26" r="0.85">
                <stop offset="0" stopColor="#17241F" />
                <stop offset="0.55" stopColor="#0C1512" />
                <stop offset="1" stopColor="#050A08" />
              </radialGradient>
              {/* A sheen across the top left, as glass over a face. */}
              <linearGradient id="glass" x1="0" y1="0" x2="0.7" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
                <stop offset="0.45" stopColor="#fff" stopOpacity="0.02" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Case */}
            <circle cx={C} cy={C} r={BEZEL} fill="url(#metalEdge)" />
            <circle cx={C} cy={C} r={BEZEL - 12} fill="url(#metal)" />
            <circle
              cx={C}
              cy={C}
              r={FACE + 5}
              fill="none"
              stroke="#0A2A1F"
              strokeOpacity="0.55"
              strokeWidth="3"
            />

            {/* Dial */}
            <circle cx={C} cy={C} r={FACE} fill="url(#dial)" />

            {/* Minute ring — five to a year, so the face still counts like a
                clock between the numerals. */}
            {Array.from({ length: N * 5 }, (_, i) => {
              const a = (i * 360) / (N * 5);
              const major = i % 5 === 0;
              const p0 = at(a, TICKS + (major ? 9 : 5));
              const p1 = at(a, TICKS - (major ? 5 : 0));
              return (
                <line
                  key={`t${i}`}
                  x1={p0.x}
                  y1={p0.y}
                  x2={p1.x}
                  y2={p1.y}
                  stroke="url(#metal)"
                  strokeOpacity={major ? 0.95 : 0.4}
                  strokeWidth={major ? 3 : 1.2}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Chapter ring around the movement */}
            <circle
              cx={C}
              cy={C}
              r={CHAPTER}
              fill="none"
              stroke="url(#metal)"
              strokeOpacity="0.5"
              strokeWidth="2"
            />
            <circle
              cx={C}
              cy={C}
              r={CHAPTER - 7}
              fill="none"
              stroke="url(#metal)"
              strokeOpacity="0.28"
              strokeWidth="1"
              strokeDasharray="2 7"
            />

            {/* Movement */}
            <g aria-hidden="true">
              {COGS.map((c, i) => (
                <g key={`c${i}`} transform={`translate(${C + c.x} ${C + c.y})`}>
                  <g
                    className={c.dir > 0 ? "cog-cw" : "cog-ccw"}
                    style={{ animationDuration: `${c.spin}s` }}
                  >
                    <path d={cog(c.r, c.teeth, c.depth)} fill="url(#metal)" fillOpacity="0.9" />
                    <circle r={c.hub} fill="#0B1410" />
                    <circle
                      r={c.hub}
                      fill="none"
                      stroke="url(#metal)"
                      strokeOpacity="0.7"
                      strokeWidth="2"
                    />
                    {/* Spokes, so the cog visibly turns. */}
                    {Array.from({ length: 5 }, (_, k) => {
                      const q = at((k * 360) / 5, c.r - c.hub - 2, 0, 0);
                      const h = at((k * 360) / 5, c.hub, 0, 0);
                      return (
                        <line
                          key={k}
                          x1={h.x}
                          y1={h.y}
                          x2={q.x}
                          y2={q.y}
                          stroke="url(#metal)"
                          strokeOpacity="0.45"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </g>
                </g>
              ))}
            </g>

            {/* Years */}
            {MILESTONES.map((m, i) => {
              const a = i * STEP;
              const on = i === index;
              const label = at(a, YEARS);
              return (
                <text
                  key={m.year}
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
                  fill={on ? "#8CFBDA" : "url(#metal)"}
                  className="cursor-pointer font-display text-[26px] font-extrabold"
                >
                  {m.year}
                </text>
              );
            })}

            {/* Hand — tapered to a point, with a counterweighted tail. */}
            <g aria-hidden="true">
              {(() => {
                const tipP = at(angle, HAND);
                const tailP = at(angle + 180, 44);
                const leftP = at(angle - 90, 9);
                const rightP = at(angle + 90, 9);
                return (
                  <>
                    <path
                      d={`M${tipP.x},${tipP.y} L${leftP.x},${leftP.y} L${tailP.x},${tailP.y} L${rightP.x},${rightP.y} Z`}
                      fill="#C6F4E2"
                    />
                    <circle cx={tailP.x} cy={tailP.y} r="13" fill="#C6F4E2" />
                    <circle cx={tipP.x} cy={tipP.y} r="7" fill="#8CFBDA" />
                  </>
                );
              })()}
              <circle cx={C} cy={C} r="15" fill="url(#metal)" />
              <circle cx={C} cy={C} r="6" fill="#050A08" />
            </g>

            {/* Glass */}
            <circle cx={C} cy={C} r={FACE} fill="url(#glass)" style={{ pointerEvents: "none" }} />
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
