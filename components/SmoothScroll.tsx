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
 *
 * The instance is put on `window` so the page can ask it to move. Lenis holds
 * the real scroll position and drives it from its own loop, so a component
 * calling `window.scrollTo` smoothly would be pulling against it and lose. A
 * caller that finds nothing there — reduced motion, the admin, before this
 * mounts — is expected to fall back to the native scroll, which is right
 * because in exactly those cases there is no Lenis to fight.
 */

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}
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

    window.__lenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [pathname]);

  return null;
}
