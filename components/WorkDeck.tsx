"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  PROJECTS,
  type CategoryId,
  type Project,
} from "@/lib/data";
import { clipsFor, type Clip } from "@/lib/clips";
import ProjectStage from "./ProjectStage";

/**
 * The work section as a fanned deck.
 *
 * Cards sit on an arc — rotated around a pivot below the deck, the way a hand
 * of cards splays. Drag, scroll horizontally, use the arrow keys, or click a
 * card to bring it to centre; click the centre card and it flips open into a
 * detail view with that project's deliverables beneath it. Click one of those
 * and it maximises and plays.
 *
 * Vertical wheel is deliberately NOT captured: hijacking page scroll to drive a
 * carousel strands anyone who just wants to get past the section.
 */

const FAN_STEP_DEG = 10;
/* Rotation about a far pivot alone leaves the cards stacked, so each step also
   gets an explicit horizontal offset. Rotation supplies the splay; this
   supplies the gap. */
const FAN_STEP_X = 72;
const DRAG_PER_CARD = 110; // px of drag that advances one card
const DRAG_SLOP = 6;
/** How long a card holds the centre before the deck deals the next one. */
const DEAL_MS = 3000; // px of travel past which a pointer gesture is a drag, not a click

/* ---------------------------------------------------------------- poster art */

function PosterArt({
  project,
  poster = false,
}: {
  project: Project;
  /** Card treatment: adds the typographic layer that survives greyscale. */
  poster?: boolean;
}) {
  const hue = Math.round(project.hue * 360);

  if (project.poster) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={project.poster} alt="" className="h-full w-full object-cover" />;
  }

  return (
    <>
      <span
        className="absolute inset-0"
        style={{
          background: `radial-gradient(125% 110% at 26% 6%, hsl(${hue} 62% 24%) 0%, hsl(${hue} 55% 10%) 46%, #030605 100%)`,
        }}
      />
      <span
        className="absolute inset-0 opacity-70"
        style={{
          background: `linear-gradient(112deg, hsla(${hue}, 80%, 62%, .20) 0%, transparent 46%)`,
        }}
      />

      {/* Without art, a greyscaled gradient is a blank slab. Poster typography
          gives the side cards something to read at a glance. */}
      {poster ? (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[18%] h-px"
            style={{ background: `hsla(${hue}, 90%, 70%, .45)` }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-2 top-[22%] block break-words text-center font-display text-[1.9rem] font-extrabold uppercase leading-[0.88] tracking-[-0.04em] text-white/25 sm:text-[2.3rem]"
          >
            {project.client}
          </span>
        </>
      ) : null}

      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]"
      />
    </>
  );
}

/* --------------------------------------------------------------------- deck */

export default function WorkDeck({
  projects,
  categories,
  clips,
  categoryLabels,
}: {
  projects?: Project[];
  categories?: { id: string; label: string }[];
  clips?: Record<string, Clip[]>;
  categoryLabels?: Record<string, string>;
}) {
  const all = projects?.length ? projects : PROJECTS;
  const cats = categories?.length ? categories : CATEGORIES;
  const labels = categoryLabels ?? (CATEGORY_LABEL as Record<string, string>);
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const shown = useMemo(
    () => (filter === "all" ? all : all.filter((p) => p.cat === filter)),
    [filter, all],
  );

  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const q = window.matchMedia("(max-width: 640px)");
    const sync = () => setCompact(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  /* The fan is always symmetric, so the wing is whichever is smaller: the
     spread we want, or the distance to the nearer end. That alone collapses
     the fan to a single card once the centre reaches an end, so the centre is
     also kept `MIN_WING` in from either — the deck browses a little less far
     in exchange for never looking like a stack of one. */
  const MAX_WING = compact ? 2 : 3;
  /* More cards than the fan can hold: loop, so the extras come round rather
     than being hidden behind an end. Fewer, and there is nothing to loop —
     the fan just narrows symmetrically and the ends stay put. */
  const loop = shown.length > MAX_WING * 2 + 1;
  /* Every card is reachable either way now: looping wraps, and when the set
     fits, nothing is hidden for the highlight to be kept away from. */
  const lo = 0;
  const hi = shown.length - 1;
  const clampActive = useCallback(
    (i: number) =>
      loop
        ? ((i % shown.length) + shown.length) % shown.length
        : Math.min(hi, Math.max(lo, i)),
    [loop, lo, hi, shown.length],
  );
  const wing = MAX_WING;
  /* The midpoint of the whole set, used as the fan's centre when it is not
     looping. Fractional on an even count, which is exactly what is wanted. */
  const centre = (shown.length - 1) / 2;

  const open = openSlug ? (shown.find((p) => p.slug === openSlug) ?? null) : null;
  const openClips = open ? (clips?.[open.slug] ?? clipsFor(open.slug)) : [];

  // Recentre whenever the filter changes the set.
  useEffect(() => {
    setActive(clampActive(Math.floor(shown.length / 2)));
    setOpenSlug(null);
  }, [filter, shown.length, clampActive]);

  // Play the flip-in on the frame after the detail mounts.
  useEffect(() => {
    if (!openSlug) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [openSlug]);

  const step = useCallback(
    (dir: number) => setActive((a) => clampActive(a + dir)),
    [clampActive],
  );

  /* The deck deals itself the next card while it is left alone, so the fan
     reads as browsable rather than as a static illustration. Anything the
     visitor does — dragging, the arrows, opening a card — buys quiet, since
     the deck moving under a decision is worse than a deck that never moves. */
  const held = useRef(0);
  const dir = useRef(1);
  const hold = useCallback(() => {
    held.current = Date.now() + DEAL_MS * 3;
  }, []);

  useEffect(() => {
    if (openSlug || shown.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (Date.now() < held.current || document.hidden) return;
      setActive((a) => {
        // Turns round at the ends. Wrapping would sweep the whole fan back in
        // one move, and the cards beyond the wing are not rendered, so it
        // read as the deck blinking rather than travelling.
        if (!loop && (a + dir.current > hi || a + dir.current < lo)) dir.current *= -1;
        return clampActive(a + dir.current);
      });
    }, DEAL_MS);
    return () => window.clearInterval(id);
  }, [openSlug, shown.length, loop, lo, hi, clampActive]);

  /* drag */
  /* `drift` is how far the fan has been pulled, in cards, and it is
     fractional — the deck used to round to whole cards on every pointermove
     and then play a 600ms ease for each one, so a drag arrived as a series of
     lurches half a second behind the finger. Now the fan tracks the pointer
     exactly and only eases once, on release. */
  const [drift, setDrift] = useState(0);
  const [dragging, setDragging] = useState(false);
  const driftRef = useRef(0);
  const commit = useRef<(steps: number) => void>(() => {});
  commit.current = (steps) => setActive((a) => clampActive(a + steps));

  const drag = useRef<{ x: number; y?: number; from: number } | null>(null);
  /* A pointerdown/up pair on the same card still emits a click, so a drag that
     ends over a card would open it. This records whether the pointer actually
     travelled, and the card's click handler bails if it did. */
  const dragged = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (openSlug) return;
    hold();
    drag.current = { x: e.clientX, y: e.clientY, from: active };
    dragged.current = false;
    // Deliberately NO setPointerCapture here. Capturing on the deck retargets
    // the follow-up click away from the card, so a plain single click never
    // opened anything — only a drag did. Window listeners give the same
    // tracking without hijacking the click.
  };

  const count = useRef(shown.length);
  count.current = shown.length;

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      // Vertical travel counts too: a downward flick over a card was landing
      // as a click because only the X axis was being measured.
      if (Math.abs(dx) > DRAG_SLOP || Math.abs(e.clientY - (d.y ?? e.clientY)) > DRAG_SLOP * 3) {
        dragged.current = true;
      }
      if (dragged.current) setDragging(true);
      driftRef.current = -dx / DRAG_PER_CARD;
      setDrift(driftRef.current);
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      // Hand the whole cards over to `active` and let the leftover fraction
      // ease back to zero, which is the settle.
      commit.current(Math.round(driftRef.current));
      driftRef.current = 0;
      setDrift(0);
      setDragging(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  /* horizontal wheel / trackpad only — vertical stays with the page */
  const wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    if (openSlug) return;
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 4) return;
    const now = Date.now();
    if (now - wheelLock.current < 220) return;
    wheelLock.current = now;
    step(e.deltaX > 0 ? 1 : -1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (openSlug) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpenSlug(shown[active]?.slug ?? null);
    }
  };

  useEffect(() => {
    if (!openSlug) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenSlug(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSlug]);

  return (
    <section id="work" className="relative py-24 md:py-32">
      <div className="shell">
        <div data-reveal="1" className="text-center">
          <h2 className="h-mid font-display font-extrabold text-ink">
            Recent cuts.
          </h2>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {cats.map((cat) => {
            const on = filter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id as CategoryId | "all")}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  on
                    ? "border-brand/50 bg-mint/25 text-brand"
                    : "border-ink/12 bg-white text-body hover:border-brand/40 hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Deck ── */}
        <div
          role="group"
          aria-label="Project deck — use the arrow keys to browse"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onWheel={onWheel}
          className={`scene relative mt-12 touch-pan-y select-none transition-all duration-500 ${
            openSlug
              ? "pointer-events-none h-0 opacity-0"
              : "h-[380px] cursor-grab overflow-hidden opacity-100 active:cursor-grabbing sm:h-[470px]"
          }`}
        >
          {shown.map((project, i) => {
            const raw = i - active;
            /* Looping: the shortest way round the ring. A card crosses from one
               end of the fan to the other while it is beyond the wing and
               unrendered, so the wrap is never seen — and because each card
               keeps its own key, its transform still animates the whole way. */
            const off = loop
              ? raw - shown.length * Math.round(raw / shown.length)
              : raw;
            /* Not looping means the whole set already fits, so nothing is
               hidden — the fan just lays every card out around its own middle
               and the highlight travels along it. `fanShift` is a half step on
               an even count, which is what keeps the spread centred when no
               single card can sit in the middle. */
            /* Cull one ring wider than the fan and fade that ring out, so a
               card arriving at the edge dissolves in instead of appearing
               from nothing mid-move. */
            if (loop && Math.abs(off) > wing + 1) return null;

            const pos = (loop ? off : i - centre) - drift;
            const reach = Math.abs(pos);
            const edge = Math.min(1, Math.max(0, reach - wing));
            const abs = Math.min(reach, wing);
            const isCentre = reach < 0.5;
            const hidden = Boolean(openSlug);

            return (
              <button
                /* Keyed by project, not by slot. Keyed by slot, every card's
                   transform is a constant and only its contents change, so
                   there is nothing left for the transition to animate — which
                   is how the deck lost its movement. */
                key={project.slug}
                type="button"
                tabIndex={-1}
                aria-label={`Open ${project.title}`}
                onClick={() => {
                  if (dragged.current) {
                    dragged.current = false;
                    return;
                  }
                  hold();
                  setActive(clampActive(i));
                  setOpenSlug(project.slug);
                }}
                className="absolute left-1/2 top-0 h-[300px] w-[200px] -translate-x-1/2 overflow-hidden rounded-2xl border border-ink/10 shadow-[0_30px_70px_-30px_rgba(5,30,24,.55)] [transition-property:transform,opacity,filter] [will-change:transform,opacity] sm:h-[350px] sm:w-[236px]"
                style={{
                  // Rotating about a pivot below the deck is what makes it splay
                  // like a hand of cards rather than slide like a carousel.
                  transformOrigin: compact ? "50% 140%" : "50% 165%",
                  // Nothing eases while the finger is down; the fan is being
                  // positioned directly and any duration here is lag.
                  transitionDuration: dragging ? "0ms" : "620ms",
                  transitionTimingFunction: "cubic-bezier(.22,1,.28,1)",
                  transform: hidden
                    ? `translateX(${pos * 120}px) rotate(${pos * 26}deg) translateY(140px) scale(.7)`
                    : `translateX(${pos * (compact ? 30 : FAN_STEP_X)}px) rotate(${pos * (compact ? 6 : FAN_STEP_DEG)}deg) translateZ(${-abs * 26}px) scale(${1 - abs * 0.025})`,
                  zIndex: 20 - Math.round(abs),
                  opacity: hidden ? 0 : 1 - edge,
                  filter: isCentre
                    ? "none"
                    : `grayscale(1) brightness(${(2.1 - abs * 0.18).toFixed(2)}) contrast(.88)`,
                }}
              >
                <PosterArt project={project} poster />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25" />

                <span className="absolute left-2.5 top-2.5 rounded-md bg-mint px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                  {project.study.results[0].delta}
                </span>
                <span className="absolute right-2.5 top-2.5 rounded-md border border-white/20 bg-black/70 px-1.5 py-0.5 font-mono text-[9px] tracking-normal text-white/85 backdrop-blur">
                  {labels[project.cat] ?? project.cat}
                </span>

                <span className="absolute inset-x-3 bottom-3 text-left">
                  <span className="block truncate text-sm font-bold text-white">
                    {project.title}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] text-white/55">
                    {project.client} · {project.duration}
                  </span>
                </span>

                {isCentre ? (
                  <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-mint/50 bg-black/45 backdrop-blur">
                    <svg width="13" height="15" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                      <path d="M15 9L1 17.66V.34L15 9z" fill="#1BEDAC" />
                    </svg>
                  </span>
                ) : null}
              </button>
            );
          })}

        </div>

          {/* ── Detail: the centre card flipped open ── */}
        {open ? (
          <div
            className="on-dark scene relative z-40 mt-4 origin-top overflow-hidden rounded-3xl"
            style={{
              transform: entered ? "rotateY(0deg) scale(1)" : "rotateY(-78deg) scale(.82)",
              opacity: entered ? 1 : 0,
              transition: "transform 700ms cubic-bezier(.16,1,.3,1), opacity 500ms ease",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenSlug(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur transition-colors hover:border-mint/50 hover:text-mint"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <ProjectStage
              clips={openClips}
              title={open.title}
              hue={open.hue}
              header={
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* `format` often repeats the category verbatim, which reads
                        as a duplicate chip — show it only when it adds something. */}
                    {[
                      labels[open.cat] ?? open.cat,
                      ...(open.format.toLowerCase() === (labels[open.cat] ?? open.cat).toLowerCase()
                        ? []
                        : [open.format]),
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-md border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] tracking-normal text-white/85 backdrop-blur"
                      >
                        {chip}
                      </span>
                    ))}
                    <span className="rounded bg-mint px-2 py-1 font-mono text-[10px] font-bold text-ink">
                      {open.study.results[0].delta} {open.study.results[0].label.toLowerCase()}
                    </span>
                  </div>
                  <h3 className="mt-2.5 font-display text-[clamp(1.3rem,3vw,2.1rem)] font-extrabold leading-none tracking-[-0.03em] text-white">
                    {open.title}
                  </h3>
                  <Link
                    href={`/work/${open.slug}`}
                    className="pointer-events-auto mt-2 inline-block text-xs font-semibold text-mint underline underline-offset-4 hover:text-mint-bright"
                  >
                    Read the case study
                  </Link>
                </>
              }
            />
          </div>
        ) : null}

        {/* Deck controls */}
        {!openSlug ? (
          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => { hold(); step(-1); }}
              disabled={!loop && active <= lo}
              aria-label="Previous project"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-brand/50 hover:text-brand disabled:opacity-25"
            >
              ←
            </button>
            <span className="font-mono text-xs text-muted">
              {shown.length ? active + 1 : 0} / {shown.length}
            </span>
            <button
              type="button"
              onClick={() => { hold(); step(1); }}
              disabled={!loop && active >= hi}
              aria-label="Next project"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-brand/50 hover:text-brand disabled:opacity-25"
            >
              →
            </button>
          </div>
        ) : null}

        <p className="mt-4 text-center font-mono text-[11px] text-muted">
          {openSlug
            ? "Pick a file to play it · esc to go back"
            : "Drag, scroll or use ← → · click the centre card to open it"}
        </p>

        {/* Crawlable, pointer-free equivalent of the deck. */}
        <details className="mx-auto mt-8 max-w-md">
          <summary className="cursor-pointer text-center text-xs text-muted hover:text-ink">
            View all projects as a list
          </summary>
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {all.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  className="flex items-baseline justify-between gap-4 py-3 text-sm text-body transition-colors hover:text-brand"
                >
                  <span>{p.title}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted">
                    {labels[p.cat] ?? p.cat}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </div>

    </section>
  );
}
