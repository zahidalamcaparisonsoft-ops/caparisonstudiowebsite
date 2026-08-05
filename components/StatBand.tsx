"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The studio's four figures.
 *
 * They fly in one at a time from a random corner of the screen, tumbling as
 * they come, and settle into the row counting up from zero. Driven by one rAF
 * clock rather than four CSS delays, because the count and the flight have to
 * agree: the number has to land on its value at the moment the figure stops
 * moving, not before.
 *
 * The corners and the spin are drawn on the client, after mount. Randomising
 * during render would give the server and the first client pass different
 * numbers and React would report a hydration mismatch; by the time the
 * observer fires, the vectors are in.
 *
 * The band lives inside a section with `overflow-hidden`, which is what lets
 * the start position sit off the side of the screen without the page growing
 * a horizontal scrollbar.
 */

const STATS = [
  { value: "2014", label: "Founded in Berlin" },
  { value: "14", label: "Editors, colourists, animators" },
  { value: "1,240", label: "Videos delivered" },
  { value: "98%", label: "On-time delivery" },
];

const STAGGER = 240; // between one figure setting off and the next
const FLIGHT = 950; // how long each takes to arrive and finish counting

/** Splits "1,240" into what to count and how to write it back out. */
function parse(raw: string) {
  const m = raw.match(/^(\D*?)([\d,]+)(\D*)$/);
  if (!m) return null;
  const [, prefix, digits, suffix] = m;
  const target = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  return { prefix, suffix, target, grouped: digits.includes(",") };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Vector = { x: number; y: number; spin: number; tilt: number };

/** A corner to come in from, and how much to tumble on the way. */
function throwFrom(): Vector {
  const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
  return {
    x: pick([-1, 1]) * (58 + Math.random() * 22), // vw
    y: pick([-1, 1]) * (34 + Math.random() * 26), // vh
    spin: pick([-360, -180, 180, 360]), // a whole flip, or two
    tilt: (Math.random() * 2 - 1) * 22, // degrees of roll
  };
}

export default function StatBand() {
  const ref = useRef<HTMLDListElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [vectors, setVectors] = useState<Vector[] | null>(null);
  const armed = useRef(false);

  useEffect(() => {
    setVectors(STATS.map(() => throwFrom()));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    let frame = 0;
    let start = 0;
    const total = STAGGER * (STATS.length - 1) + FLIGHT;

    const tick = (now: number) => {
      if (!start) start = now;
      const t = now - start;
      setElapsed(t);
      if (t < total) frame = requestAnimationFrame(tick);
      else setDone(true);
    };

    const begin = () => {
      if (armed.current) return;
      armed.current = true;
      window.clearTimeout(failsafe);
      frame = requestAnimationFrame(tick);
    };

    /* If the band is already on screen at mount there is nothing to wait for.
       And if the observer never fires — a fast scroll past, a browser that
       disagrees about the threshold — the figures must not be left sitting
       off-screen at zero opacity, so a timer shows them regardless. Nothing
       should be able to strand the content. */
    const failsafe = window.setTimeout(() => setDone(true), 6000);

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        begin();
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      io.disconnect();
      begin();
    }

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <dl
      ref={ref}
      // Perspective, or rotateY reads as a horizontal squash rather than a flip.
      style={{ perspective: "1100px" }}
      className="grid grid-cols-2 gap-y-9 border-y border-ink/10 py-10 md:grid-cols-4"
    >
      {STATS.map((stat, i) => {
        const parsed = parse(stat.value);
        // Until the client has drawn its vectors, fall back to something
        // stable so the server and first client render agree.
        const v = vectors?.[i] ?? {
          x: i % 2 === 0 ? -60 : 60,
          y: 0,
          spin: 0,
          tilt: 0,
        };
        const p = done ? 1 : Math.min(1, Math.max(0, (elapsed - i * STAGGER) / FLIGHT));
        const e = easeOut(p);

        const shown =
          !parsed || done || p >= 1
            ? stat.value
            : `${parsed.prefix}${
                parsed.grouped
                  ? Math.round(e * parsed.target).toLocaleString("en-US")
                  : Math.round(e * parsed.target)
              }${parsed.suffix}`;

        return (
          <div
            key={stat.label}
            style={
              done
                ? undefined
                : {
                    opacity: Math.min(1, p * 2.2),
                    transform: [
                      `translate3d(${((1 - e) * v.x).toFixed(2)}vw, ${((1 - e) * v.y).toFixed(2)}vh, 0)`,
                      `rotateY(${((1 - e) * v.spin).toFixed(1)}deg)`,
                      `rotateZ(${((1 - e) * v.tilt).toFixed(1)}deg)`,
                    ].join(" "),
                  }
            }
          >
            <dd className="font-display text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums text-ink">
              {shown}
            </dd>
            <dt className="mt-3 max-w-[14ch] text-xs leading-snug text-muted sm:text-sm">
              {stat.label}
            </dt>
          </div>
        );
      })}
    </dl>
  );
}
