"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CLIENT_LOGOS,
  TESTIMONIAL_BAND,
  TESTIMONIALS,
  type ClientLogo,
  type TestimonialBand,
} from "@/lib/data";
import type { LoadedTestimonial } from "@/lib/content";
import { pictureAtSharedHeight, ratioOf } from "@/lib/aspect";

/**
 * Client stories.
 *
 * For a video studio a video testimonial is the strongest asset there is: it
 * demonstrates the craft while it delivers the words. So the film leads, the
 * client's own figures sit beside their quote, and the studio-wide figures sit
 * above the lot — the claim and the evidence in one view rather than a wall of
 * quotes any studio could have written.
 *
 * Nothing autoplays. A testimonial that starts talking at you unprompted is
 * the fastest way to get a tab closed, so the first press is always the
 * visitor's — which is also what lets it start with sound rather than muted.
 *
 * Two players, because there are two kinds of source. A direct file gets the
 * transport below; a Vimeo id gets Vimeo's own controls, because driving
 * someone else's player from here means loading their SDK.
 *
 * Both the player and the picker take each film's own shape. Most of these are
 * shot vertically for social, and a 9:16 interview in a 16:9 box is a sliver
 * of face between two black bars.
 *
 * The picker rolls on its own and wraps, so it reads as a longer list than it
 * is — but it stops the moment a pointer is over it or a finger is on it.
 * Unlike the showreel band, every item here is a target you are meant to hit,
 * and a moving target is a worse picker than a still one.
 */

/* Controls on, Vimeo's own branding off, and asked not to track the viewer. */
const VIMEO_LIVE = [
  "autoplay=1",
  "muted=0",
  "controls=1",
  "title=0",
  "byline=0",
  "portrait=0",
  "dnt=1",
].join("&");

/** How far one press of an arrow moves the picker, as a share of its width. */
const SCROLL_STEP = 0.8;
/** How long an arrow takes to get there. */
const GLIDE_MS = 520;
/** Speed of the idle roll. Slow enough to read a name as it goes past. */
const ROLL_PX_PER_SEC = 26;
/** Quiet bought by a touch, since a finger has no "leave" to wait for. */
const TOUCH_HOLD_MS = 4000;
/** Picker height. Fixed, so a vertical still cannot make the row jump. */
const STILL_H =
  "[--still-h:104px] [--still-w:104px] sm:[--still-h:132px] sm:[--still-w:128px]";

function timecode(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------- icons */

function StatIcon({ which }: { which: 0 | 1 | 2 }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (which === 0) {
    return (
      <svg {...common}>
        <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
        <circle cx="10" cy="8" r="3.2" />
        <path d="M20 19v-1.4a3.5 3.5 0 0 0-2.6-3.35M15.6 5.2a3.2 3.2 0 0 1 0 6.05" />
      </svg>
    );
  }
  if (which === 1) {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.6" />
        <path
          d="M10.4 8.8 15.4 12l-5 3.2V8.8z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.6 12h16.8M12 3.4c2.1 2.3 3.2 5.3 3.2 8.6s-1.1 6.3-3.2 8.6c-2.1-2.3-3.2-5.3-3.2-8.6S9.9 5.7 12 3.4z" />
    </svg>
  );
}

/* --------------------------------------------------------------- the band */

export default function Testimonials({
  items,
  band,
  logos,
}: {
  items?: LoadedTestimonial[];
  band?: TestimonialBand;
  logos?: ClientLogo[];
}) {
  const list: LoadedTestimonial[] = items?.length
    ? items
    : TESTIMONIALS.map((x) => ({
        id: x.id,
        name: x.name,
        role: x.role,
        company: x.company,
        initials: x.initials,
        quote: x.quote,
        video: x.video,
        poster: x.poster,
        avatar: x.avatar,
        stats: x.stats ?? [],
      }));
  const copy = band ?? TESTIMONIAL_BAND;
  const marks = logos?.length ? logos : CLIENT_LOGOS;

  const [active, setActive] = useState(0);
  const t = list[Math.min(active, list.length - 1)];

  /* ── playback ── */
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [live, setLive] = useState(false); // Vimeo: has the embed been asked for
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [full, setFull] = useState(false);

  /* Switching client always returns to the still. Carrying playback across a
     switch would mean audio from someone the visitor did not choose. */
  useEffect(() => {
    setPlaying(false);
    setLive(false);
    setTime(0);
    setDuration(0);
    const el = video.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, [active]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const el = video.current;
      if (el) {
        setTime(el.currentTime);
        if (Number.isFinite(el.duration) && el.duration > 0)
          setDuration(el.duration);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === stage.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  /* The first press is the visitor's, which is what lets the film start with
     sound. Browsers only grant that to a real gesture; the muted retry is for
     the case where one is refused anyway. */
  const start = useCallback(() => {
    if (t.vimeoId) {
      setLive(true);
      setPlaying(true);
      return;
    }
    const el = video.current;
    if (!el) return;
    el.muted = false;
    setMuted(false);
    void el.play().catch(() => {
      el.muted = true;
      setMuted(true);
      void el.play().catch(() => {});
    });
  }, [t.vimeoId]);

  const toggle = useCallback(() => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.current?.requestFullscreen().catch(() => {});
  }, []);

  /* ── the picker rail ──
     The list is rendered twice and the position wraps at the halfway mark, so
     the roll is seamless. Two things this needs that are easy to miss:
       - `scroll-behavior: auto` on the rail. The global `html { scroll-
         behavior: smooth }` is inherited by every scroll container, and each
         sub-pixel write would then restart a smooth animation rather than move.
       - The position is kept in a ref, not read back off `scrollLeft`. At
         26px/s a frame advances under a pixel, which reading the DOM rounds
         away, and the rail would sit still. */
  const rail = useRef<HTMLUListElement>(null);
  const pos = useRef(0);
  const glide = useRef<{ from: number; to: number; start: number } | null>(
    null,
  );
  const hovered = useRef(false);
  const touchedUntil = useRef(0);
  /* Set once the pointer has left, so the roll picks up from wherever the
     visitor's own scrolling left the rail rather than snapping back. */
  const resync = useRef(false);

  const periodOf = (el: HTMLElement) => {
    const kids = el.children;
    const n = kids.length / 2;
    if (n < 1) return 0;
    return (
      (kids[n] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft
    );
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const el = rail.current;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!el) return;
      const period = periodOf(el);
      if (period <= 0) return;

      if (glide.current) {
        const g = glide.current;
        const k = Math.min(1, (now - g.start) / GLIDE_MS);
        pos.current = g.from + (g.to - g.from) * (1 - Math.pow(1 - k, 3));
        if (k >= 1) glide.current = null;
      } else {
        if (hovered.current || now < touchedUntil.current || document.hidden) {
          // Whatever the visitor scrolled to by hand is where the roll resumes.
          resync.current = true;
          return;
        }
        if (resync.current) {
          pos.current = el.scrollLeft;
          resync.current = false;
        }
        pos.current += ROLL_PX_PER_SEC * dt;
      }

      if (pos.current >= period) pos.current -= period;
      else if (pos.current < 0) pos.current += period;
      el.scrollLeft = pos.current;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* The arrows drive the same position, so they work while the roll is paused
     and the roll carries on from where they left it. */
  const nudge = useCallback((dir: number) => {
    const el = rail.current;
    if (!el) return;
    const from = el.scrollLeft;
    resync.current = false;
    pos.current = from;
    glide.current = {
      from,
      to: from + dir * el.clientWidth * SCROLL_STEP,
      start: performance.now(),
    };
  }, []);

  const stats = useMemo(() => t.stats.slice(0, 3), [t.stats]);

  /* The top padding clears the floating nav: it is fixed at top-3/top-5 and
     stands about 56px tall, so anything in the first ~80px of the section
     would sit under it — which is where the studio's figures live. */
  return (
    <section
      id="testimonials"
      className="section-tint relative pb-20 pt-32 md:pb-28 md:pt-36"
    >
      <div className="shell">
        {/* ── Heading, and the studio's own figures ── */}
        <div
          data-reveal="1"
          className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 h-mid font-display font-extrabold leading-[0.95] tracking-[-0.03em] text-ink">
              {copy.heading}
            </h2>
            <p className="mt-4 text-body">{copy.subhead}</p>
          </div>

          <dl className="flex shrink-0 divide-x divide-ink/10">
            {copy.stats.map((s, i) => (
              <div
                key={s.label}
                className="px-5 text-center first:pl-0 last:pr-0 sm:px-7"
              >
                <dd className="flex justify-center text-brand">
                  <StatIcon which={i as 0 | 1 | 2} />
                </dd>
                <dd className="mt-2 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
                  {s.value}
                </dd>
                <dt className="mt-0.5 text-xs text-muted sm:text-sm">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* ── The film, and what they said ── */}
        <div /* 1.25/.75 puts the picture at 705px, which is the height the whole
             stage is derived from — 397px for every shape. Wider than this
             and the three client figures beside it drop under ~130px each,
             where a caption like "Working Together" breaks to three lines. */
          className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:gap-12"
        >
          {/* min-w-0: a grid item defaults to min-width:auto, so without it a
              long word in the quote can push the column wider than its track. */}
          <div data-reveal="1" className="min-w-0">
            {/* Centred, because with a shared height the widths differ and a
                left-aligned vertical cut would sit in a lopsided column. */}
            <div
              ref={stage}
              className="on-dark relative mx-auto overflow-hidden rounded-2xl bg-black shadow-[0_30px_70px_-40px_rgba(5,30,24,.55)]"
              style={pictureAtSharedHeight(ratioOf(t.aspect))}
            >
              {t.vimeoId && live ? (
                <iframe
                  src={`https://player.vimeo.com/video/${t.vimeoId}?${VIMEO_LIVE}`}
                  title={`${t.name} — video testimonial`}
                  allow="autoplay; fullscreen; picture-in-picture"
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <>
                  {t.vimeoId ? null : (
                    <video
                      ref={video}
                      key={t.id}
                      src={t.video}
                      poster={t.poster}
                      playsInline
                      preload="metadata"
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onClick={toggle}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  {/* Vimeo has no still of its own until the embed mounts, so
                      the poster stands in for it. */}
                  {t.vimeoId && t.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.poster}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}

                  {!playing ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/45"
                      />

                      <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/70 px-2.5 py-1.5 backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                          Featured client
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={start}
                        aria-label={`Play ${t.name}'s testimonial`}
                        className="group absolute inset-0 flex items-center justify-center"
                      >
                        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/45 backdrop-blur transition-all duration-300 group-hover:scale-105 group-hover:border-mint group-hover:bg-mint/25 sm:h-20 sm:w-20">
                          <svg
                            width="18"
                            height="21"
                            viewBox="0 0 16 18"
                            fill="none"
                            aria-hidden="true"
                            className="ml-1"
                          >
                            <path d="M15 9L1 17.66V.34L15 9z" fill="#fff" />
                          </svg>
                        </span>
                      </button>

                      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col p-4 pb-16 sm:p-6 sm:pb-20">
                        <span className="text-lg font-bold text-white sm:text-xl">
                          {t.name}
                        </span>
                        <span className="text-sm text-white/65">
                          {t.role}
                          {t.company ? `, ${t.company}` : ""}
                        </span>
                      </span>
                    </>
                  ) : null}
                </>
              )}

              {/* ── Transport ──
                  Only over the local player. Vimeo's embed owns the bottom of
                  its own frame and there is nothing here to hold on to across
                  an iframe, so a bar drawn over it would be decoration that
                  covers their real controls. */}
              {!t.vimeoId ? (
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-8 sm:px-5 sm:pb-4">
                  <button
                    type="button"
                    onClick={playing ? toggle : start}
                    aria-label={playing ? "Pause" : "Play"}
                    className="shrink-0 text-white transition-colors hover:text-mint"
                  >
                    {playing ? (
                      <svg
                        width="13"
                        height="15"
                        viewBox="0 0 16 19"
                        aria-hidden="true"
                      >
                        <rect
                          width="5"
                          height="19"
                          rx="1.5"
                          fill="currentColor"
                        />
                        <rect
                          x="11"
                          width="5"
                          height="19"
                          rx="1.5"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="13"
                        height="15"
                        viewBox="0 0 16 18"
                        aria-hidden="true"
                      >
                        <path d="M15 9L1 17.66V.34L15 9z" fill="currentColor" />
                      </svg>
                    )}
                  </button>

                  <div className="relative flex-1">
                    <div className="h-1 overflow-hidden rounded-full bg-white/25">
                      <span
                        className="block h-full rounded-full bg-mint"
                        style={{
                          width: `${duration ? (time / duration) * 100 : 0}%`,
                        }}
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

                  <span className="shrink-0 font-mono text-[11px] text-white/80">
                    {timecode(time)} / {timecode(duration)}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const el = video.current;
                      if (!el) return;
                      el.muted = !el.muted;
                      setMuted(el.muted);
                    }}
                    aria-label={muted ? "Unmute" : "Mute"}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d={
                          muted
                            ? "M4 9v6h4l5 4V5L8 9H4zM17 9l4 6M21 9l-4 6"
                            : "M4 9v6h4l5 4V5L8 9H4zM17 8.5a4.5 4.5 0 0 1 0 7"
                        }
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={full ? "Exit fullscreen" : "Fullscreen"}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d={
                          full
                            ? "M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"
                            : "M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"
                        }
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* ── The claim, and their figures ── */}
          <div data-reveal="1" className="flex min-w-0 flex-col">
            {/* An empty pair of quotation marks reads as a broken component
                rather than as a client who has not been quoted yet. */}
            {t.quote ? (
              <>
                <span
                  aria-hidden="true"
                  className="font-display text-[5rem] font-extrabold leading-[0.55] text-mint-pale"
                >
                  &ldquo;
                </span>

                <blockquote className="mt-2 font-display text-[clamp(1.25rem,2.1vw,1.65rem)] font-extrabold leading-[1.28] tracking-[-0.02em] text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {t.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.avatar}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand/25 bg-mint/25 font-mono text-xs font-bold text-brand">
                    {t.initials}
                  </span>
                )}
                <span className="flex flex-col">
                  <span className="text-base font-bold text-ink">{t.name}</span>
                  <span className="text-sm text-muted">
                    {t.role}
                    {t.company ? `, ${t.company}` : ""}
                  </span>
                </span>
              </div>

              {copy.scriptLine ? (
                <span className="relative shrink-0 font-script text-xl leading-tight text-ink/75 sm:text-2xl">
                  {copy.scriptLine}
                  <span
                    aria-hidden="true"
                    className="mt-0.5 block h-[3px] w-3/5 rounded-full bg-mint/60"
                  />
                </span>
              ) : null}
            </div>

            {/* Their numbers, not our adjectives. */}
            {stats.length ? (
              <dl className="mt-7 grid grid-cols-3 divide-x divide-ink/10 border-t border-ink/10 pt-6">
                {stats.map((s) => (
                  <div key={s.label} className="px-4 first:pl-0 last:pr-0">
                    <dd className="font-display text-xl font-extrabold tracking-[-0.02em] text-brand sm:text-2xl">
                      {s.value}
                    </dd>
                    <dt className="mt-1 text-xs leading-snug text-muted sm:text-sm">
                      {s.label}
                    </dt>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>

        {/* ── Pick a client ──
            Sized by height, not width: every still is the same height and
            takes whatever width its own shape asks for, so a row of mostly
            vertical clips does not stand three times taller than a row of
            widescreen ones. The name sits under the still rather than over it
            — a 9:16 still is 74px wide here, which is no place for a name. */}
        <div
          className="mt-8 flex items-center gap-4"
          onPointerEnter={() => {
            hovered.current = true;
          }}
          onPointerLeave={() => {
            hovered.current = false;
          }}
          onTouchStart={() => {
            touchedUntil.current = performance.now() + TOUCH_HOLD_MS;
          }}
          onTouchEnd={() => {
            touchedUntil.current = performance.now() + TOUCH_HOLD_MS;
          }}
        >
          <ul
            ref={rail}
            aria-label="Choose a client"
            className={`flex flex-1 gap-4 overflow-x-auto pb-2 [scroll-behavior:auto] [scrollbar-width:none] ${STILL_H} [&::-webkit-scrollbar]:hidden`}
          >
            {[...list, ...list].map((item, n) => {
              const i = n % list.length;
              /* The second pass is a visual loop only — one set is enough for
                 assistive tech and for the tab order. */
              const echo = n >= list.length;
              const on = i === active && !echo;
              const ratio = ratioOf(item.aspect);
              return (
                <li
                  key={`${item.id}-${n}`}
                  className="shrink-0"
                  aria-hidden={echo || undefined}
                >
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    tabIndex={echo ? -1 : undefined}
                    aria-current={on}
                    className="group block text-left"
                    style={{
                      width: `max(var(--still-w), calc(var(--still-h) * ${ratio}))`,
                    }}
                  >
                    <span
                      className={`on-dark relative mx-auto block overflow-hidden rounded-xl bg-black transition-all duration-300 ${
                        on
                          ? "ring-2 ring-mint ring-offset-2 ring-offset-paper-2"
                          : "opacity-80 group-hover:opacity-100"
                      }`}
                      style={{
                        height: "var(--still-h)",
                        width: `calc(var(--still-h) * ${ratio})`,
                      }}
                    >
                      {item.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.poster}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : null}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                      />
                      <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 transition-transform duration-300 group-hover:scale-110">
                        <svg
                          width="9"
                          height="11"
                          viewBox="0 0 16 18"
                          aria-hidden="true"
                          className="ml-0.5"
                        >
                          <path d="M15 9L1 17.66V.34L15 9z" fill="#050807" />
                        </svg>
                      </span>
                    </span>

                    <span className="mt-2 block">
                      <span
                        className={`block truncate text-xs font-bold ${on ? "text-brand" : "text-ink"}`}
                      >
                        {item.name}
                      </span>
                      <span className="block truncate text-[11px] text-muted">
                        {item.company || item.role}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Previous clients"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-brand/50 hover:text-brand"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="More clients"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-brand/50 hover:text-brand"
            >
              →
            </button>
          </div>
        </div>

        {/* ── Trusted by ── */}
        {marks.length ? (
          <div
            data-reveal="1"
            className="mt-10 flex flex-col gap-6 rounded-2xl bg-white/70 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:gap-8"
          >
            <p className="shrink-0 max-w-[13rem] font-mono text-[10px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-muted lg:border-r lg:border-ink/10 lg:pr-8">
              {copy.logosLabel}
            </p>

            <ul className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-5 lg:gap-x-10">
              {marks.map((m) => (
                <li key={m.id}>
                  {m.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.logo}
                      alt={m.name}
                      loading="lazy"
                      className="h-7 w-auto object-contain sm:h-8"
                    />
                  ) : (
                    /* No mark uploaded yet — the name set in the display face
                       still reads as a logo rather than as a gap. */
                    <span className="font-display text-base font-extrabold tracking-[-0.02em] text-ink/75 sm:text-lg">
                      {m.name}
                    </span>
                  )}
                </li>
              ))}
              {copy.logosMore ? (
                <li className="text-sm text-muted">{copy.logosMore}</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
