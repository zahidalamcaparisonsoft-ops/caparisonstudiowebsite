"use client";

import { useEffect, useRef, useState } from "react";

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
