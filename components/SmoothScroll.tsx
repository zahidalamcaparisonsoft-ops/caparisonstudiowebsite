"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Eased scrolling for the public site.
 *
 * Lenis moves the real scroll position rather than transforming a wrapper, so
 * `window.scrollY` stays true and everything already driven by scroll — the
 * hero's tilt, the process steps, the studio figures, the timeline rail —
 * keeps working untouched.
 *
 * Off on the admin, where a panel of forms wants to answer the wheel
 * immediately, and off entirely for anyone who has asked for reduced motion.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Decelerating, with no overshoot — a spring would fight the scroll-driven
      // animations by arriving twice.
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
      smoothWheel: true,
      touchMultiplier: 1.7,
      // Anchor jumps clear the floating header, as scroll-padding used to.
      anchors: { offset: -96 },
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
