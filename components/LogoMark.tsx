"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * The logo as a physical object: it hangs in space, drifts, and every so often
 * turns over.
 *
 * Two faces rather than one. A single flat image rotated 180° shows its own
 * mirror — the play triangle would point backwards halfway through every turn
 * — so the mark is stamped on both sides of the card and each face hides its
 * own back. The turn is always exactly half a revolution, so whichever face
 * lands is the right way round.
 *
 * The drift and the turn live on separate elements because they are both
 * transforms: on one element the later would simply replace the earlier.
 *
 * Intervals are random, and drawn on the client — a random figure chosen while
 * rendering would differ between the server and the first client pass, which
 * React reports as a hydration mismatch.
 */

const MIN_REST = 6500;
const MAX_REST = 15000;

export default function LogoMark({ className = "h-9 w-auto" }: { className?: string }) {
  const [turn, setTurn] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const schedule = () => {
      const wait = MIN_REST + Math.random() * (MAX_REST - MIN_REST);
      timer.current = window.setTimeout(() => {
        // Nothing turns while the tab is in the background; it would spend the
        // whole time flipping to catch up the moment you came back.
        if (!document.hidden) setTurn((t) => t + 180);
        schedule();
      }, wait);
    };
    schedule();

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <span className="logo3d">
      <span className="logo3d-float">
        <span className="logo3d-turn" style={{ transform: `rotateY(${turn}deg)` }}>
          <Image
            src="/logo-mark.png"
            alt=""
            width={330}
            height={345}
            priority
            className={`logo3d-face ${className}`}
          />
          <Image
            src="/logo-mark.png"
            alt=""
            width={330}
            height={345}
            aria-hidden="true"
            className={`logo3d-face logo3d-back ${className}`}
          />
        </span>
      </span>
    </span>
  );
}
