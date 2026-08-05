"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The studio's four figures.
 *
 * They fly in one at a time from alternating sides and settle into the row,
 * counting up from zero as they travel. Driven by one rAF clock rather than
 * four CSS delays, because the count and the flight have to agree: the number
 * has to land on its value at the moment the card stops moving, not before.
 *
 * The band lives inside a section with `overflow-hidden`, which is what lets
 * the start position sit off the side of the screen without the page growing
 * a horizontal scrollbar.
 */

const STATS = [
  { value: "2021", label: "Founded in Berlin" },
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

export default function StatBand() {
  const ref = useRef<HTMLDListElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

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

    // Runs once, when the row is genuinely on screen — the figures counting
    // up above the fold and being missed is the whole failure mode here.
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <dl
      ref={ref}
      className="grid grid-cols-2 gap-y-9 border-y border-ink/10 py-10 md:grid-cols-4"
    >
      {STATS.map((stat, i) => {
        const parsed = parse(stat.value);
        // Alternates left, right, left, right as they come in.
        const side = i % 2 === 0 ? -1 : 1;
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
                    transform: `translate3d(${((1 - e) * side * 60).toFixed(2)}vw, 0, 0)`,
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
