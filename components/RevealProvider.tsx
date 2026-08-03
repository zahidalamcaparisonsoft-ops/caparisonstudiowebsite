"use client";

import { useRevealObserver } from "@/lib/hooks";

/** Mounts the IntersectionObserver that drives `[data-reveal]`. */
export default function RevealProvider() {
  useRevealObserver();
  return null;
}
