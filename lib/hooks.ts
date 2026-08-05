"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/**
 * Scroll-driven reveal, via IntersectionObserver.
 *
 * The mock polled `document.querySelectorAll` every 700ms for the lifetime of
 * the page and hid content behind a 3-second failsafe. This does the same job
 * with no polling, and content starts visible so a JS failure can never leave
 * the page blank — `js-ready` opts in to hiding only once we know we can
 * animate back out of it.
 */
export function useRevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("js-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("js-ready");
    };
  }, []);
}

/** Page scroll progress, 0-1, rAF-throttled. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return progress;
}

/** Which section id is currently under the playhead. */
/**
 * Position along a track of equal-width chapters, 0 to 1.
 *
 * Raw scroll fraction is the wrong number for this. The clips on the rail are
 * all the same width but the sections are nothing like the same height, so a
 * linear fraction puts the playhead in the wrong clip almost everywhere —
 * measured seven of nine landing a whole chapter early. This walks the section
 * tops instead: which one the reading line is inside, plus how far through it,
 * mapped onto that clip's slot.
 */
export function useTrackPosition(ids: string[], offset = 96) {
  const [pos, setPos] = useState({ index: 0, within: 0, fraction: 0 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const tops = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el))
        .map((el) => el.getBoundingClientRect().top + window.scrollY);
      if (!tops.length) return;

      // The reading line is where an anchor jump lands, so clicking a clip
      // and scrolling to it by hand agree on which chapter you are in.
      const y = window.scrollY + offset;
      let i = 0;
      while (i < tops.length - 1 && y >= tops[i + 1]) i++;
      /* Both ends are clamped to where the page can actually go, because the
         reading line is inset by the header on both sides. Measured to the
         document's full height the last chapter could never fill — the line
         cannot get closer to the bottom than one viewport, so the rail stuck
         at 96% — and the first chapter started already 96px in, so the top of
         the page read 1%. */
      const ceiling = offset; // the line's value at scroll 0
      const floor = document.documentElement.scrollHeight - window.innerHeight + offset;
      const start = i === 0 ? Math.max(tops[0], ceiling) : tops[i];
      const end =
        i + 1 < tops.length ? tops[i + 1] : Math.max(start + 1, floor);
      const within = Math.min(1, Math.max(0, end > start ? (y - start) / (end - start) : 0));
      setPos({ index: i, within, fraction: (i + within) / tops.length });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids, offset]);

  return pos;
}

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );

    ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/**
 * Pointer-tracked lighting for `.lit` surfaces.
 *
 * Writes --mx/--my straight to the element's style rather than through React
 * state, so moving the mouse never triggers a re-render. Listeners are per
 * element and only bound while the pointer is inside it.
 */
export function useLitSurface<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let frame = 0;
    let next: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!next) return;
      el.style.setProperty("--mx", next.x.toFixed(3));
      el.style.setProperty("--my", next.y.toFixed(3));
      // Rotation is small on purpose. The depth comes from the shared
      // perspective and the lighting, not from leaning the card over.
      el.style.transform = `translate3d(0,-4px,28px) rotateY(${((next.x - 0.5) * 5).toFixed(2)}deg) rotateX(${((0.5 - next.y) * 4).toFixed(2)}deg)`;
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      next = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      el.style.transform = "";
      el.style.setProperty("--mx", "0.5");
      el.style.setProperty("--my", "0.5");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return ref;
}

/* ─────────────────────────────────────────────────────────── looping rail */

const DRAG_SLOP = 6;

/** One period is the distance from the first item to its own copy. Derived
    from the items rather than scrollWidth/2, so any padding on the rail — a
    lead-in, a gutter — is not mistaken for content. */
function periodOf(el: HTMLElement) {
  const kids = el.children;
  const n = kids.length / 2;
  if (n < 1) return 0;
  return (kids[n] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
}

/** Distance to the next item. */
function stepOf(el: HTMLElement) {
  const a = el.children[0] as HTMLElement | undefined;
  const b = el.children[1] as HTMLElement | undefined;
  if (!a) return 0;
  return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
}

const wrap = (v: number, p: number) => (p > 0 ? ((v % p) + p) % p : 0);

/**
 * A rail that steps one item along every few seconds and can be dragged
 * either way.
 *
 * The caller must render its list twice: with one copy the rail hits an end
 * and stalls there, and any list that happens to fit its container exactly
 * has nowhere to advance to at all.
 *
 * `moved` reports whether the pointer travelled, so a click handler on an
 * item can tell a click from the end of a drag — a pointerdown/up pair still
 * fires a click even when the pointer moved 200px in between.
 */
export function useLoopRail<T extends HTMLElement>({
  advanceMs = 3000,
  glideMs = 620,
}: { advanceMs?: number; glideMs?: number } = {}) {
  const ref = useRef<T>(null);
  const pos = useRef(0);
  const drag = useRef<{ x: number; y: number; lastX: number } | null>(null);
  const moved = useRef(false);
  const glide = useRef<{ from: number; to: number; start: number } | null>(null);
  const waitUntil = useRef(0);

  /** Buy quiet after a deliberate interaction. */
  const hold = useCallback(
    (beats = 1) => {
      waitUntil.current = performance.now() + advanceMs * beats;
    },
    [advanceMs],
  );

  const onPointerDown = useCallback((e: { clientX: number; clientY: number }) => {
    moved.current = false;
    glide.current = null;
    drag.current = { x: e.clientX, y: e.clientY, lastX: e.clientX };
    // No setPointerCapture — it retargets the follow-up click off the item,
    // so clicking one would stop working.
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      const el = ref.current;
      if (!d || !el) return;
      if (Math.abs(e.clientX - d.x) > DRAG_SLOP || Math.abs(e.clientY - d.y) > DRAG_SLOP * 3) {
        moved.current = true;
      }
      pos.current = wrap(pos.current - (e.clientX - d.lastX), periodOf(el));
      d.lastX = e.clientX;
      el.scrollLeft = pos.current;
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      hold();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [hold]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const el = ref.current;
      if (!el || drag.current || document.hidden) return;
      const p = periodOf(el);
      if (p <= 0) return;

      if (glide.current) {
        const g = glide.current;
        const k = Math.min(1, (now - g.start) / glideMs);
        pos.current = g.from + (g.to - g.from) * (1 - Math.pow(1 - k, 3));
        if (k >= 1) {
          glide.current = null;
          pos.current = wrap(pos.current, p);
          waitUntil.current = now + advanceMs;
        }
      } else if (now >= waitUntil.current) {
        glide.current = { from: pos.current, to: pos.current + stepOf(el), start: now };
      }
      el.scrollLeft = pos.current;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [advanceMs, glideMs]);

  return { ref, onPointerDown, moved, hold };
}
