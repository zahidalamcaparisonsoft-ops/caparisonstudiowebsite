"use client";

import { useEffect, useState } from "react";

/**
 * Makes the public site clickable from the admin's live editor.
 *
 * Mounted only when the page is loaded with `?edit=1`, which the admin does
 * inside an iframe. It outlines whatever section is under the pointer and
 * reports clicks to the parent frame, so the panel beside the preview can open
 * the right editor.
 *
 * Nothing here is a security boundary — it only runs when the URL asks for it,
 * and every write still goes through the database's own `is_admin()` check.
 * The worst a stranger can do by adding `?edit=1` is put a dotted outline on
 * their own screen.
 *
 * It works by delegation rather than by wrapping every section in a marker.
 * The sections already have the ids the rest of the site navigates by, so
 * there is nothing to add to them and no chance of the two drifting apart.
 */

const MSG = "caparison-live";

/** Sections that have an editor behind them, in the order they appear. */
const KNOWN = new Set([
  "top",
  "testimonials",
  "work",
  "journey",
  "story",
  "onboarding",
  "pricing",
  "faq",
  "footer",
]);

function regionOf(el: EventTarget | null): HTMLElement | null {
  if (!(el instanceof Element)) return null;
  const found = el.closest("section[id], footer");
  if (!found) return null;
  const id = found.tagName === "FOOTER" ? "footer" : found.id;
  return KNOWN.has(id) ? (found as HTMLElement) : null;
}

const idOf = (el: HTMLElement) => (el.tagName === "FOOTER" ? "footer" : el.id);

export default function LiveEditBridge() {
  const [box, setBox] = useState<DOMRect | null>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    document.documentElement.dataset.liveEdit = "on";

    const over = (e: PointerEvent) => {
      const el = regionOf(e.target);
      if (!el) {
        setBox(null);
        return;
      }
      setBox(el.getBoundingClientRect());
      setLabel(idOf(el));
    };

    const click = (e: MouseEvent) => {
      const el = regionOf(e.target);
      if (!el) return;
      // Inside the editor the site is a map, not a site: a click means "edit
      // this", so links must not navigate and players must not start.
      e.preventDefault();
      e.stopPropagation();
      window.parent?.postMessage(
        { source: MSG, type: "select", section: idOf(el) },
        window.location.origin,
      );
    };

    const clear = () => setBox(null);

    document.addEventListener("pointermove", over, true);
    document.addEventListener("click", click, true);
    window.addEventListener("scroll", clear, { passive: true });
    document.addEventListener("pointerleave", clear);

    // The panel asks the preview to jump to a section when one is chosen there.
    const message = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.source !== MSG || e.data.type !== "scrollTo") return;
      const id = e.data.section === "footer" ? null : e.data.section;
      const el = id ? document.getElementById(id) : document.querySelector("footer");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("message", message);

    window.parent?.postMessage({ source: MSG, type: "ready" }, window.location.origin);

    return () => {
      delete document.documentElement.dataset.liveEdit;
      document.removeEventListener("pointermove", over, true);
      document.removeEventListener("click", click, true);
      window.removeEventListener("scroll", clear);
      document.removeEventListener("pointerleave", clear);
      window.removeEventListener("message", message);
    };
  }, []);

  if (!box) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[200] rounded-lg border-2 border-dashed border-brand/70 bg-brand/[0.06]"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    >
      <span className="absolute left-0 top-0 rounded-br-lg rounded-tl-md bg-brand px-2 py-1 font-mono text-[11px] font-bold text-white">
        {label} · click to edit
      </span>
    </div>
  );
}
