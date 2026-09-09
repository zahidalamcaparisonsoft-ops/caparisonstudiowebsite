"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { TEAM, type TeamMember } from "@/lib/data";

/**
 * The team as a curved wall of portraits you can drag through.
 *
 * The wall is a concave cylinder wrapping around the viewer: cards at the edges
 * are turned hard inward AND pushed toward the camera, so perspective renders
 * them larger than the ones in the middle. Pushing them away instead — the
 * intuitive reading — flattens the whole thing into a plain carousel.
 *
 * It steps to the next member every three seconds while left alone, and stops
 * the moment the pointer moves over it or a drag starts — the timer measures
 * time since the last pointer movement, so resting a cursor on the wall holds
 * it in place rather than fighting the visitor.
 *
 * The wall loops. The list is rendered enough times to outrun the widest
 * viewport, and the scroll position is wrapped by exactly one pass of it — so
 * a drag can be carried on in either direction for as long as anyone cares to,
 * and the idle step never has to rewind. Wrapping is invisible because the
 * position it lands on is showing the identical card.
 *
 * The people are the same people each pass, so only the first is real to a
 * screen reader; the rest are marked away.
 *
 * Transforms are written straight to the nodes on scroll rather than held in
 * state, so dragging never re-renders fifteen cards.
 *
 * `perspective` sits on the scrolling rail itself: it only applies to direct
 * children, and the cards are the rail's children.
 */

const MAX_ROT_DEG = 46;
const MAX_PUSH_PX = 190; // toward the viewer at the edges
/* Clamped so the nearest cards stay inside the rail's height. `overflow-x: auto`
   computes `overflow-y` to `auto`, so anything taller than the rail gets cut. */
const MAX_D = 1.35;
const DRAG_SLOP = 6;
const ADVANCE_MS = 3000; // idle time before stepping to the next member
const GLIDE_MS = 650;
/* Roughly what one card occupies, card plus gap, at the larger breakpoint.
   Only used to decide how many passes to render — a wall that is narrower
   than the screen would wrap with a hole in it, and a small team is the case
   that hits. Over-rendering costs markup, not requests: the extra passes are
   the same image URLs and come out of cache. */
const CARD_PITCH = 234;
/* Widest screen worth rendering enough passes for. */
const WIDEST = 2560;

export default function TeamWall({ members }: { members?: TeamMember[] }) {
  const people = members?.length ? members : TEAM;
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; lastX: number } | null>(null);
  const pos = useRef(0);

  /* Enough passes that folding by one is always reading content that exists:
     a screenful, plus the pass being folded away, plus the pass being folded
     onto. Two short of that and the seam shows on a wide monitor — three
     passes is fine at 1440 and runs out at 2560. */
  const passes = Math.max(
    3,
    Math.ceil(WIDEST / Math.max(1, people.length * CARD_PITCH)) + 2,
  );
  const wall = useMemo(
    () =>
      Array.from({ length: passes }, (_, pass) =>
        people.map((member, i) => ({ member, i, pass })),
      ).flat(),
    [people, passes],
  );

  /* One pass of the list, measured off the cards rather than assumed: the gap
     and the card width both change at the `sm` breakpoint, and the seam has to
     land exactly or it shows. */
  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return null;
    const kids = Array.from(el.children) as HTMLElement[];
    const n = people.length;
    if (kids.length <= n) return null;
    const origin = kids[0].offsetLeft;
    const period = kids[n].offsetLeft - origin;
    if (period <= 0) return null;
    return { el, kids, n, origin, period };
  }, [people.length]);

  /* The one position in the canonical pass that shows what `s` is showing. */
  const wrap = useCallback((s: number, origin: number, period: number) => {
    return origin + (((s - origin) % period) + period) % period;
  }, []);

  const apply = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    const reach = el.clientWidth / 2;
    for (const child of Array.from(el.children) as HTMLElement[]) {
      const centre = child.offsetLeft + child.offsetWidth / 2;
      const d = Math.max(-MAX_D, Math.min(MAX_D, (centre - mid) / reach));
      child.style.transform = `translateZ(${(Math.abs(d) * MAX_PUSH_PX).toFixed(0)}px) rotateY(${(-d * MAX_ROT_DEG).toFixed(1)}deg)`;
      child.style.zIndex = String(40 - Math.round(Math.abs(d) * 10));
    }
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    let frame = 0;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };

    /* Start part-way in, so there is wall to either side from the first
       frame, then fold that onto the canonical pass. */
    const m = measure();
    el.scrollLeft = m
      ? wrap((el.scrollWidth - el.clientWidth) / 2, m.origin, m.period)
      : (el.scrollWidth - el.clientWidth) / 2;
    pos.current = el.scrollLeft;
    apply();

    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [apply, measure, wrap]);

  const lastMove = useRef(0);
  const glide = useRef(0);

  /* Ease to a target scroll position. `scroll-behavior` is auto on this rail
     (the global smooth setting breaks the per-frame writes), so the glide is
     done by hand. */
  const glideTo = useCallback(
    (target: number) => {
      const el = rail.current;
      if (!el) return;
      cancelAnimationFrame(glide.current);
      const from = el.scrollLeft;
      const delta = target - from;
      const started = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - started) / GLIDE_MS);
        const eased = 1 - Math.pow(1 - k, 3);
        el.scrollLeft = from + delta * eased;
        if (k < 1) {
          pos.current = el.scrollLeft;
          glide.current = requestAnimationFrame(step);
          return;
        }
        /* Landed. If the step carried the wall into the next pass, fold it
           back now — at rest, on an identical card, where nothing shows. */
        const m = measure();
        if (m) el.scrollLeft = wrap(el.scrollLeft, m.origin, m.period);
        pos.current = el.scrollLeft;
      };
      glide.current = requestAnimationFrame(step);
    },
    [measure, wrap],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const el = rail.current;
      if (!el || drag.current) return;
      if (Date.now() - lastMove.current < ADVANCE_MS) return; // pointer is active on it

      const m = measure();
      if (!m) return;
      const { kids, period } = m;

      const centre = el.scrollLeft + el.clientWidth / 2;
      let current = 0;
      let best = Infinity;
      kids.forEach((k, i) => {
        const d = Math.abs(k.offsetLeft + k.offsetWidth / 2 - centre);
        if (d < best) {
          best = d;
          current = i;
        }
      });
      /* The card after this one, always — the wall is a loop, so there is no
         last card to turn back from. It is drawn in a later pass when the
         nearest card is the final one, and the glide folds back on landing. */
      const next = kids[current + 1];
      if (!next) return;
      const target = next.offsetLeft + next.offsetWidth / 2 - el.clientWidth / 2;
      /* Whichever copy of that position is nearest, so the step is one card
         wide rather than a scroll back across the whole wall. */
      const near =
        target + Math.round((el.scrollLeft - target) / period) * period;
      glideTo(near);
    }, 900);
    return () => clearInterval(id);
  }, [glideTo, measure]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = rail.current;
    if (!el) return;
    pos.current = el.scrollLeft;
    drag.current = { x: e.clientX, lastX: e.clientX };
    // No setPointerCapture — it retargets the follow-up click and is not
    // needed once move/up are tracked on the window.
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      const el = rail.current;
      if (!d || !el) return;
      if (Math.abs(e.clientX - d.x) > DRAG_SLOP) {
        pos.current -= e.clientX - d.lastX;
        /* Wrapped, not clamped. Running out of wall mid-drag was the thing
           that made it read as a strip with two ends rather than a wall that
           goes round. */
        const m = measure();
        if (m) pos.current = wrap(pos.current, m.origin, m.period);
        else
          pos.current = Math.max(
            0,
            Math.min(el.scrollWidth - el.clientWidth, pos.current),
          );
        el.scrollLeft = pos.current;
      }
      d.lastX = e.clientX;
    };
    const up = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [measure, wrap]);

  return (
    <div className="relative mt-8 overflow-hidden">
      <div
        ref={rail}
        onPointerDown={onPointerDown}
        onPointerMove={() => {
          lastMove.current = Date.now();
        }}
        aria-label="The team — drag to browse"
        className="flex cursor-grab gap-4 overflow-x-auto overflow-y-hidden px-[38vw] py-24 [scroll-behavior:auto] [scrollbar-width:none] active:cursor-grabbing sm:gap-6 sm:px-[40vw] [&::-webkit-scrollbar]:hidden"
        style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}
      >
        {wall.map(({ member, i, pass }) => {
          /* Keyed off the member's own index, so the same person is the same
             colour in every pass. */
          const hue = 148 + ((i * 23) % 90);
          return (
            <figure
              key={`${member.name}-${i}-${pass}`}
              /* Later passes are the same nine people again — one wall to a
                 screen reader, however many times it is drawn. */
              aria-hidden={pass > 0 || undefined}
              className="relative m-0 w-[168px] shrink-0 select-none sm:w-[210px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-ink/10 bg-black shadow-[0_50px_90px_-40px_rgba(5,30,24,.6)]">
                {member.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photo}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(120% 100% at 30% 12%, hsl(${hue} 44% 27%) 0%, hsl(${hue} 40% 13%) 52%, #050a08 100%)`,
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center font-display text-[2.6rem] font-extrabold tracking-[-0.04em] text-white/20"
                    >
                      {member.initials}
                    </span>
                  </>
                )}

                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/65 to-transparent"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <span className="block truncate font-display text-sm font-bold leading-tight text-white">
                    {member.name}
                  </span>
                  <span className="mt-1 block font-mono text-[10px] leading-snug tracking-[0.02em] text-mint">
                    {member.role}
                  </span>
                  <span className="mt-1.5 block font-mono text-[10px] text-white/55">
                    {member.reelCount} cuts
                  </span>
                </figcaption>
              </div>
            </figure>
          );
        })}
      </div>

      {/* Fade only at the screen edges, where cards are on their way out.
          Earlier these were wide enough to wash the outermost visible cards;
          keeping them narrow means they dissolve the run-off, not the content. */}
      <span
        aria-hidden="true"
        className="fade-edge pointer-events-none absolute inset-y-0 left-0 w-[3.5vw] sm:w-[5vw]"
      />
      <span
        aria-hidden="true"
        className="fade-edge fade-edge-r pointer-events-none absolute inset-y-0 right-0 w-[3.5vw] sm:w-[5vw]"
      />

      <p className="mt-3 text-center font-mono text-[11px] text-muted">
        Drag, or let it run
      </p>
    </div>
  );
}
