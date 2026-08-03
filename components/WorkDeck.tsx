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
import { FALLBACK_CLIP_SRC, clipsFor, type Clip } from "@/lib/clips";

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

const FAN_STEP_DEG = 8;
const DRAG_PER_CARD = 110; // px of drag that advances one card

/* ---------------------------------------------------------------- poster art */

function PosterArt({ project }: { project: Project }) {
  const hue = Math.round(project.hue * 360);
  return project.poster ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={project.poster} alt="" className="h-full w-full object-cover" />
  ) : (
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
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]"
      />
    </>
  );
}

/* ------------------------------------------------------------------- player */

function timecode(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function Player({
  clip,
  project,
  onClose,
}: {
  clip: Clip;
  project: Project;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("cinema-open");
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("cinema-open");
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        const el = video.current;
        if (!el) return;
        if (el.paused) void el.play();
        else el.pause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = video.current;
      if (el) {
        setTime(el.currentTime);
        if (Number.isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black">
      <video
        ref={video}
        src={clip.src ?? FALLBACK_CLIP_SRC}
        poster={clip.poster}
        autoPlay
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-full w-full object-contain"
      />

      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-mint/50 hover:text-mint"
          >
            <span aria-hidden="true">←</span> Back
          </button>
          <span className="rounded-md border border-mint/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-mint backdrop-blur">
            {project.title}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-white">{clip.title}</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const el = video.current;
                if (!el) return;
                if (el.paused) void el.play();
                else el.pause();
              }}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              {playing ? (
                <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden="true">
                  <rect width="3.5" height="13" rx="1" fill="currentColor" />
                  <rect x="7.5" width="3.5" height="13" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
                  <path d="M12 7L0 14V0z" fill="currentColor" />
                </svg>
              )}
            </button>

            <span className="font-mono text-xs text-white/80">{timecode(time)}</span>

            <div className="relative flex-1">
              <div className="h-1 overflow-hidden rounded-full bg-white/20">
                <span
                  className="block h-full rounded-full bg-mint"
                  style={{ width: `${duration ? (time / duration) * 100 : 0}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 0.1)}
                step={0.01}
                value={time}
                onChange={(e) => {
                  const el = video.current;
                  if (el) el.currentTime = Number(e.target.value);
                }}
                aria-label="Scrub"
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>

            <span className="font-mono text-xs text-white/50">
              {timecode(duration)}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
            Placeholder reel · esc to exit
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- deck */

export default function WorkDeck() {
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const shown = useMemo(
    () => (filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter)),
    [filter],
  );

  const [active, setActive] = useState(() => Math.floor(PROJECTS.length / 2));
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
  const [clip, setClip] = useState<Clip | null>(null);

  const open = openSlug ? (shown.find((p) => p.slug === openSlug) ?? null) : null;
  const clips = open ? clipsFor(open.slug) : [];

  // Reset to the first card whenever the filter changes the set.
  useEffect(() => {
    setActive(Math.floor(shown.length / 2));
    setOpenSlug(null);
  }, [filter, shown.length]);

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
    (dir: number) =>
      setActive((a) => Math.min(shown.length - 1, Math.max(0, a + dir))),
    [shown.length],
  );

  /* drag */
  const drag = useRef<{ x: number; from: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (openSlug) return;
    drag.current = { x: e.clientX, from: active };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const delta = Math.round((d.x - e.clientX) / DRAG_PER_CARD);
    setActive(Math.min(shown.length - 1, Math.max(0, d.from + delta)));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

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
    if (!openSlug || clip) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenSlug(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSlug, clip]);

  return (
    <section id="work" className="relative px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <div data-reveal="1" className="text-center">
          <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-mint">
            <span className="h-px w-7 bg-mint" />
            Selected work
          </span>
          <h2 className="h-mid mt-5 font-display font-extrabold text-white">
            Recent cuts.
          </h2>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const on = filter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id as CategoryId | "all")}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  on
                    ? "border-mint/60 bg-mint/15 text-mint"
                    : "border-white/12 bg-white/[0.03] text-white/60 hover:border-mint/30 hover:text-white"
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
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          className={`scene relative mt-12 touch-pan-y select-none transition-all duration-500 ${
            openSlug
              ? "pointer-events-none h-0 opacity-0"
              : "h-[360px] cursor-grab overflow-hidden opacity-100 active:cursor-grabbing sm:h-[430px]"
          }`}
        >
          {shown.map((project, i) => {
            const off = i - active;
            const abs = Math.abs(off);
            if (abs > (compact ? 2 : 4)) return null;
            const isCentre = off === 0;
            const hidden = Boolean(openSlug);

            return (
              <button
                key={project.slug}
                type="button"
                tabIndex={-1}
                aria-hidden={!isCentre}
                onClick={() => (isCentre ? setOpenSlug(project.slug) : setActive(i))}
                className="absolute left-1/2 top-0 h-[300px] w-[200px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/12 shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)] transition-all duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] sm:h-[350px] sm:w-[236px]"
                style={{
                  // Rotating about a pivot below the deck is what makes it splay
                  // like a hand of cards rather than slide like a carousel.
                  transformOrigin: compact ? "50% 140%" : "50% 165%",
                  transform: hidden
                    ? `rotate(${off * 26}deg) translateY(140px) scale(.7)`
                    : `rotate(${off * (compact ? 5 : FAN_STEP_DEG)}deg) translateZ(${-abs * 48}px) scale(${1 - abs * 0.03})`,
                  zIndex: 20 - abs,
                  opacity: hidden ? 0 : abs > (compact ? 2 : 3) ? 0 : 1,
                  filter: isCentre
                    ? "none"
                    : `grayscale(1) brightness(${(1.75 - abs * 0.16).toFixed(2)}) contrast(.92)`,
                }}
              >
                <PosterArt project={project} />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25" />

                <span className="absolute left-2.5 top-2.5 rounded-md bg-mint px-1.5 py-0.5 font-mono text-[10px] font-bold text-black">
                  {project.study.results[0].delta}
                </span>
                <span className="absolute right-2.5 top-2.5 rounded-md border border-white/20 bg-black/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/85 backdrop-blur">
                  {CATEGORY_LABEL[project.cat]}
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
            className="scene relative z-40 mt-4 origin-top"
            style={{
              transform: entered
                ? "rotateY(0deg) scale(1)"
                : "rotateY(-78deg) scale(.82)",
              opacity: entered ? 1 : 0,
              transition:
                "transform 700ms cubic-bezier(.16,1,.3,1), opacity 500ms ease",
              pointerEvents: "auto",
            }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black">
              <div className="relative aspect-video sm:aspect-[2/1] lg:aspect-[21/8]">
                <PosterArt project={open} />
                <span className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

                <button
                  type="button"
                  onClick={() => setOpenSlug(null)}
                  aria-label="Close"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur transition-colors hover:border-mint/50 hover:text-mint"
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

                {/* The hero itself plays the project's main deliverable. */}
                {clips[0] ? (
                  <button
                    type="button"
                    onClick={() => setClip(clips[0])}
                    aria-label={`Play ${clips[0].title}`}
                    className="group absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-mint/50 bg-black/45 backdrop-blur transition-all duration-500 hover:scale-110 hover:border-mint hover:bg-mint/20"
                  >
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                      <path d="M15 9L1 17.66V.34L15 9z" fill="#1BEDAC" />
                    </svg>
                  </button>
                ) : null}

                <div className="absolute inset-x-4 bottom-4 sm:inset-x-7 sm:bottom-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* `format` often repeats the category verbatim, which reads
                        as a duplicate chip — show it only when it adds something. */}
                    {[
                      CATEGORY_LABEL[open.cat],
                      ...(open.format.toLowerCase() === CATEGORY_LABEL[open.cat].toLowerCase()
                        ? []
                        : [open.format]),
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-md border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/85 backdrop-blur"
                      >
                        {chip}
                      </span>
                    ))}
                    <span className="rounded-md border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/85 backdrop-blur">
                      {open.duration}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[clamp(1.5rem,3.6vw,2.6rem)] font-extrabold leading-none tracking-[-0.03em] text-white">
                    {open.title}
                  </h3>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {/* Outcome figure, not a review score — no star. */}
                    <span className="rounded bg-mint px-2 py-0.5 font-mono text-[11px] font-bold text-black">
                      {open.study.results[0].delta}
                    </span>
                    <span className="font-mono text-xs text-white/60">
                      {open.study.results[0].label}
                    </span>
                    <Link
                      href={`/work/${open.slug}`}
                      className="text-xs font-semibold text-mint underline underline-offset-4 hover:text-mint-bright"
                    >
                      Read the case study
                    </Link>
                  </div>
                </div>
              </div>

              {/* Deliverables — click one to maximise and play. */}
              <div className="px-4 py-5 sm:px-7">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-bold text-white">Deliverables</span>
                  <span className="font-mono text-[11px] text-white/35">
                    {clips.length} files
                  </span>
                </div>

                <ul className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {clips.map((c, ci) => {
                    const hue = Math.round(((open.hue + ci * 0.06) % 1) * 360);
                    return (
                      <li key={c.id} className="shrink-0">
                        <button
                          type="button"
                          onClick={() => setClip(c)}
                          className="group w-[168px] text-left sm:w-[196px]"
                        >
                          <span className="relative block aspect-video overflow-hidden rounded-lg border border-white/12">
                            <span
                              className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                              style={{
                                background: `radial-gradient(120% 110% at 30% 10%, hsl(${hue} 58% 22%) 0%, hsl(${hue} 50% 9%) 50%, #030605 100%)`,
                              }}
                            />
                            <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/0" />
                            <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                              <svg width="10" height="12" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                                <path d="M15 9L1 17.66V.34L15 9z" fill="#fff" />
                              </svg>
                            </span>
                            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] text-white/85">
                              {c.duration}
                            </span>
                          </span>
                          <span className="mt-2 block truncate text-xs font-semibold text-white/85 group-hover:text-white">
                            {c.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {/* Deck controls */}
        {!openSlug ? (
          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={active === 0}
              aria-label="Previous project"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-mint/40 hover:text-mint disabled:opacity-25"
            >
              ←
            </button>
            <span className="font-mono text-xs text-white/40">
              {shown.length ? active + 1 : 0} / {shown.length}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={active >= shown.length - 1}
              aria-label="Next project"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-mint/40 hover:text-mint disabled:opacity-25"
            >
              →
            </button>
          </div>
        ) : null}

        <p className="mt-4 text-center font-mono text-[11px] text-white/30">
          {openSlug
            ? "Pick a file to play it · esc to go back"
            : "Drag, scroll or use ← → · click the centre card to open it"}
        </p>

        {/* Crawlable, pointer-free equivalent of the deck. */}
        <details className="mx-auto mt-8 max-w-md">
          <summary className="cursor-pointer text-center text-xs text-white/35 hover:text-white/60">
            View all projects as a list
          </summary>
          <ul className="mt-4 divide-y divide-white/8 border-y border-white/8">
            {PROJECTS.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  className="flex items-baseline justify-between gap-4 py-3 text-sm text-white/70 transition-colors hover:text-mint"
                >
                  <span>{p.title}</span>
                  <span className="shrink-0 font-mono text-[11px] text-white/35">
                    {CATEGORY_LABEL[p.cat]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </div>

      {clip && open ? (
        <Player clip={clip} project={open} onClose={() => setClip(null)} />
      ) : null}
    </section>
  );
}
