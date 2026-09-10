"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TESTIMONIAL_BAND,
  TESTIMONIALS,
  type TestimonialBand,
} from "@/lib/data";
import type { LoadedTestimonial } from "@/lib/content";
import { ratioOf } from "@/lib/aspect";

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
  "badge=0",
  "dnt=1",
].join("&");

/** Vimeo's player speaks JSON over postMessage from exactly this origin. */
const VIMEO_ORIGIN = "https://player.vimeo.com";

/** How far one press of an arrow moves the picker, as a share of its width. */
const SCROLL_STEP = 0.8;
/** How long an arrow takes to get there. */
const GLIDE_MS = 520;
/** Speed of the idle roll. Slow enough to read a name as it goes past. */
const ROLL_PX_PER_SEC = 26;
/** Quiet bought by a touch, since a finger has no "leave" to wait for. */
const TOUCH_HOLD_MS = 4000;
function timecode(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------- icons */

/**
 * The glyph on a figure's card.
 *
 * Chosen by position rather than by meaning: which icon a figure gets is a
 * property of where it sits in the row, so a caption can be rewritten without
 * anyone having to pick a picture for it.
 */
function StatIcon({ which }: { which: 0 | 1 | 2 }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (which === 0) {
    return (
      <svg {...common}>
        <path d="M5 20V13M12 20V5M19 20v-9" />
      </svg>
    );
  }
  if (which === 1) {
    return (
      <svg {...common}>
        <path d="M15.5 20v-1.4a3.4 3.4 0 0 0-3.4-3.4H6.9a3.4 3.4 0 0 0-3.4 3.4V20" />
        <circle cx="9.5" cy="8.2" r="3.1" />
        <path d="M20.5 20v-1.3a3.4 3.4 0 0 0-2.6-3.3M15.2 5.3a3.1 3.1 0 0 1 0 5.9" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3.5 16.5 9 11l4 4 7.5-7.5" />
      <path d="M15.5 7.5h5v5" />
    </svg>
  );
}

/** The white triangle in the eyebrow's green disc, and on a still. */
function PlayGlyph({ size = 14, fill = "#fff" }: { size?: number; fill?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.14}
      viewBox="0 0 16 18"
      fill="none"
      aria-hidden="true"
    >
      <path d="M15 9 1 17.66V.34L15 9Z" fill={fill} />
    </svg>
  );
}

/* ------------------------------------------------------------- hand-drawn */

/** A marker underline. Stroked with round caps, so it reads as drawn. */
function Swash({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 8.4C34 4.2 76 2.4 118 3.2c28 .5 54 2 79 4.6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Points the studio's note back at the picture. Wide layout only. */
function CurvedArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 92 78"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M86 5C62 8 36 20 20 41c-6 8-10 17-12 27"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 60 8 70.5 3 54"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* --------------------------------------------------------------- the band */

export default function Testimonials({
  items,
  band,
}: {
  items?: LoadedTestimonial[];
  band?: TestimonialBand;
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
  /* Vimeo ends on its own end screen — a grid of somebody else's videos. This
     covers it with the next client instead. */
  const [ended, setEnded] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  /* Set just before switching client, so the new one starts playing rather
     than dropping back to its poster. Everything else still returns to the
     still, which is what stops a stray click starting audio. */
  const carry = useRef(false);

  /* Switching client always returns to the still. Carrying playback across a
     switch would mean audio from someone the visitor did not choose. */
  useEffect(() => {
    /* `carry` is only ever set by the up-next control, so a switch from the
       picker still lands on the poster and starts nothing. */
    const carried = carry.current;
    carry.current = false;
    setPlaying(carried);
    setLive(carried);
    setEnded(false);
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

  /* Vimeo's own postMessage protocol: JSON in, JSON out, no SDK. Asking for
     the "ended" event is the whole reason this exists — there is no other way
     to know the film finished from outside the iframe. */
  const post = useCallback((message: Record<string, unknown>) => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify(message),
      VIMEO_ORIGIN,
    );
  }, []);

  /** Ask for the end, under both names the player might answer to. */
  const subscribe = useCallback(() => {
    post({ method: "addEventListener", value: "finish" });
    post({ method: "addEventListener", value: "ended" });
  }, [post]);

  useEffect(() => {
    if (!live || !t.vimeoId) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== VIMEO_ORIGIN) return;
      let data: unknown = e.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      const event = (data as { event?: string } | null)?.event;
      /* The player announces itself once loaded; subscriptions only stick
         after that, so the request is made on both `ready` and the iframe's
         own load, whichever lands first. */
      if (event === "ready") subscribe();
      /* Both names, because they are not interchangeable. The raw postMessage
         protocol still emits the old `finish`; `ended` is what the npm player
         SDK renames it to. Watching only for `ended` — which is what the
         modern docs describe — catches nothing at all. */
      else if (event === "finish" || event === "ended") setEnded(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [live, t.vimeoId, subscribe]);

  /** Start the film over, on the same client. */
  const replay = useCallback(() => {
    setEnded(false);
    post({ method: "setCurrentTime", value: 0 });
    post({ method: "play" });
  }, [post]);

  /** Whoever follows the one showing. Wraps, so the list never dead-ends. */
  const nextUp = list[(active + 1) % list.length];

  /** Hand over to the next client, wrapping at the end of the list. */
  const playNext = useCallback(() => {
    carry.current = true;
    setActive((a) => (a + 1) % list.length);
  }, [list.length]);

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

  /* Which of the two arrangements this client gets. Derived from the shape
     already resolved for the player — a portrait film is a reel and is staged
     like one; anything square or wider is staged wide. No new column and no
     new field: `aspect` is what oEmbed already told us. */
  const isReel = ratioOf(t.aspect) < 1;

  /* The heading's green tail. Split off only where the heading actually ends
     with it, so rewriting one and not the other reads plainly rather than
     breaking the sentence in the wrong place. */
  const accent =
    copy.headingAccent && copy.heading.endsWith(copy.headingAccent)
      ? copy.headingAccent
      : "";
  const headLead = accent
    ? copy.heading.slice(0, copy.heading.length - accent.length).trimEnd()
    : copy.heading;

  /* The line written on the picture. A landscape film is the studio's cut and
     a vertical one is the client's, so they do not say the same thing. */
  const filmNote = isReel ? copy.noteReel : copy.noteWide;

  /* Quotes arrive from the panel written both ways — some wrapped in
     quotation marks, some bare. The section sets its own pair, so whatever
     is on the string comes off first rather than being doubled. */
  const quote = t.quote.trim().replace(/^["\u201c\u201d'\u2018\u2019]+|["\u201c\u201d'\u2018\u2019]+$/g, "");

  /* One string, so JSX cannot slip a space in front of the comma, and
     trimmed, because several roles are stored with a trailing one. */
  const role = [t.role, t.company]
    .map((x) => (x || "").trim())
    .filter(Boolean)
    .join(", ");

  /* ── the parts ──
     Each is built once and rendered in both arrangements. Nothing below is
     mounted conditionally on `isReel`: switching client must not remount the
     player, or the film reloads and the transport jumps back to zero. What
     changes between the arrangements is which cell each part is placed in,
     and that lives on the wrappers in the grid at the bottom. */

  const intro = (
    <div data-reveal="1" className="min-w-0">
      <span className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white py-2 pl-2 pr-4 shadow-[0_2px_10px_rgba(6,40,30,0.06)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand">
          <PlayGlyph size={8} />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
          {copy.eyebrow}
        </span>
      </span>

      {/* Wide gives the heading the whole top row and it sets on one line;
          the reel gives it a column and breaks it at the accent. */}
      <h2
        className={`mt-6 font-display font-extrabold tracking-[-0.03em] text-ink ${
          isReel
            ? "text-[clamp(1.9rem,3vw,2.7rem)] leading-[1.05]"
            : "text-[clamp(2rem,3.4vw,3rem)] leading-[1.02]"
        }`}
      >
        {headLead}
        {accent ? (
          <>
            {isReel ? <br /> : " "}
            <span className="text-brand">{accent}</span>
          </>
        ) : null}
      </h2>

      <p
        className={`mt-4 text-body ${isReel ? "max-w-[24rem]" : "max-w-[46rem]"}`}
      >
        {copy.subhead}
      </p>

      {/* The reel underlines its subhead; the wide arrangement spends that
          mark on the quote instead. */}
      {isReel ? (
        <Swash className="mt-3 block h-[10px] w-[124px] text-mint" />
      ) : null}
    </div>
  );

  /* The handwritten line with an arrow back to the film. Wide only: in the
     reel the film sits beside the heading with no room for it, and the note
     on the picture says the studio's piece instead. */
  const outsideNote =
    !isReel && copy.scriptLine ? (
      <div className="hidden lg:block">
        <span className="block font-script text-xl leading-[1.25] text-ink/75 sm:text-2xl">
          {copy.scriptLine}
        </span>
        <CurvedArrow className="mt-1 h-[52px] w-[64px] text-ink/60" />
      </div>
    ) : null;

  const claim = (
    <div data-reveal="1" className="flex min-w-0 flex-col">
      <div className="flex items-center gap-4">
        {t.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.avatar}
            alt=""
            className="h-[54px] w-[54px] shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-mint-pale font-mono text-xs font-bold text-brand">
            {t.initials}
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          <span className="text-[19px] font-bold leading-tight text-ink">
            {t.name}
          </span>
          <span className="mt-0.5 text-[15px] text-muted">{role}</span>
        </span>
      </div>

      {/* An empty pair of quotation marks reads as a broken component rather
          than as a client who has not been quoted yet. */}
      {quote ? (
        <blockquote className="mt-5">
          <p className="stories-quote text-[19px] italic leading-snug text-ink sm:text-[21px]">
            &ldquo;{quote}&rdquo;
          </p>
          <Swash className="mt-2 block h-[10px] w-[168px] text-mint" />
        </blockquote>
      ) : null}

      {/* Their figures, however many they have, set on one line each rather
          than in cards. The cards stood 128px and the section has a screen to
          fit into; this holds the same numbers in 48. */}
      {stats.length ? (
        <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-2">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mint-pale text-brand">
                <StatIcon which={(i % 3) as 0 | 1 | 2} />
              </span>
              <span className="flex min-w-0 flex-col">
                <dd className="font-display text-[17px] font-extrabold leading-none text-ink">
                  {s.value}
                </dd>
                <dt className="mt-1 text-[12.5px] leading-tight text-muted">
                  {s.label}
                </dt>
              </span>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-6">
        {/* No token for this green: it is darker than `brand-deep` and reads
            as near-black with a green cast, which is what the CTA wants
            against a mint page. */}
        <a
          href="#onboarding"
          className="inline-flex items-center gap-2.5 rounded-full bg-[#06281e] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_14px_34px_-12px_rgba(10,114,86,0.55)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          Start a project
          <svg
            width="17"
            height="13"
            viewBox="0 0 18 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 7h15M10.5 1.5 16.5 7l-6 5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );

  /* min-w-0: a grid item defaults to min-width:auto, so without it a long
     word in the quote can push the column wider than its track.

     The reveal target's className is a constant string, and everything that
     varies by arrangement is on the grid wrapper this is placed into. */
  const player = (
    <div data-reveal="1" className="min-w-0">
      <div className={isReel ? "mx-auto w-full" : ""}>
        {/* Centred, because with a shared height the widths differ and a
          left-aligned vertical cut would sit in a lopsided column. */}
        <div
          ref={stage}
          className={`stage-film on-dark relative mx-auto overflow-hidden rounded-[18px] bg-black transition-shadow duration-500 ${
            isReel
              ? "shadow-[0_30px_70px_-40px_rgba(5,30,24,.55)]"
              : "border-2 border-mint shadow-[0_0_0_6px_rgba(27,237,172,0.12),0_30px_70px_-40px_rgba(5,30,24,.55)]"
          }`}
          /* The film's shape, and nothing else. Its size is the smaller of
           the row it sits in and the column it sits in, and `.stage-film`
           in globals.css works both out from the cell itself. */
          style={{ "--r": ratioOf(t.aspect) } as React.CSSProperties}
        >
          {t.vimeoId && live ? (
            <iframe
              ref={frame}
              onLoad={subscribe}
              src={`${VIMEO_ORIGIN}/video/${t.vimeoId}?${VIMEO_LIVE}`}
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

                  {/* The badge and the note share one row rather than
                    taking a corner each. Pinned independently, a 268px
                    line and a 113px badge met in the middle of a 320px
                    film and overlapped by 97px; in a flex row with a gap
                    between them there is no width at which they can. */}
                  <span className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3 sm:inset-x-5 sm:top-5">
                    <span className="flex shrink-0 items-center gap-2 rounded-lg bg-black/70 px-2.5 py-1.5 backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                        {isReel ? "Client reel" : "Featured client"}
                      </span>
                    </span>

                    {filmNote ? (
                      <span className="min-w-0 text-right">
                        {/* Balanced, so a two-line note breaks between its
                          sentences rather than filling the first line and
                          leaving one word under it. */}
                        <span className="stage-note block text-pretty font-script text-lg leading-[1.15] text-white [text-wrap:balance] sm:text-xl">
                          {filmNote}
                        </span>
                        <Swash className="ml-auto mt-1 block h-[9px] w-[92px] text-white" />
                      </span>
                    ) : null}
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

                  {/* The reel repeats the name on the picture, where the
                    claim column sits at the far side of a narrow film.
                    Wide states it once, in the claim. */}
                  {isReel ? (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col p-5 pb-[4.25rem]">
                      <span className="text-[17px] font-bold leading-tight text-white">
                        {t.name}
                      </span>
                      <span className="mt-0.5 text-[13px] text-white/70">
                        {role}
                      </span>
                    </span>
                  ) : null}
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
                    <path
                      d="M15 9L1 17.66V.34L15 9z"
                      fill="currentColor"
                    />
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

              {/* The reel bar carries play, scrub, clock and fullscreen
                only — the volume control is part of the wide staging. */}
              {isReel ? null : (
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
              )}

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

          {/* ── Up next ──
            Vimeo finishes on a grid of unrelated videos from whoever
            uploaded it. This sits on top of that, offering the next
            client instead. `inset-0` means it fits whichever film is
            showing without knowing which layout it is in. */}
          {ended && t.vimeoId ? (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-4 text-center">
              {nextUp.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={nextUp.poster}
                  alt=""
                  className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-black/75"
              />

              <span className="relative font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-mint">
                Up next
              </span>

              <button
                type="button"
                onClick={playNext}
                className="group relative flex flex-col items-center gap-3"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-black/45 backdrop-blur transition-all duration-300 group-hover:scale-105 group-hover:border-mint group-hover:bg-mint/25">
                  <svg
                    width="15"
                    height="18"
                    viewBox="0 0 16 18"
                    fill="none"
                    aria-hidden="true"
                    className="ml-1"
                  >
                    <path d="M15 9L1 17.66V.34L15 9z" fill="#fff" />
                  </svg>
                </span>
                <span className="flex flex-col">
                  <span className="text-base font-bold leading-tight text-white">
                    {nextUp.name}
                  </span>
                  <span className="mt-0.5 text-xs text-white/65">
                    {nextUp.role}
                    {nextUp.company ? `, ${nextUp.company}` : ""}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={replay}
                className="relative inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/75 transition-colors hover:border-mint/60 hover:text-white"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4h-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Replay
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const picker = (
    <div
      className="stories-picker flex items-center gap-4 lg:col-span-12 lg:col-start-1"
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
        className="flex flex-1 gap-3 overflow-x-auto py-1 [scroll-behavior:auto] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[...list, ...list].map((item, n) => {
          const i = n % list.length;
          /* The second pass is a visual loop only — one set is enough for
             assistive tech and for the tab order. */
          const echo = n >= list.length;
          const on = i === active && !echo;
          return (
            <li
              key={`${item.id}-${n}`}
              className="shrink-0"
              aria-hidden={echo || undefined}
            >
              {/* Every still is the same landscape crop whatever shape the
                  film behind it is: a row that took each film's own shape
                  stood a 9:16 thumbnail three times taller than a 16:9 one
                  and left the names on a ragged line. The frame is a border
                  the tile always carries, transparent until it is the one
                  selected, so nothing shifts by 2px on the way in. */}
              <button
                type="button"
                onClick={() => setActive(i)}
                tabIndex={echo ? -1 : undefined}
                aria-current={on}
                className={`group block w-[132px] rounded-[14px] border-2 p-1 text-left transition-all duration-300 sm:w-[152px] ${
                  on
                    ? "border-mint shadow-[0_0_0_4px_rgba(27,237,172,0.12),0_16px_34px_-18px_rgba(6,40,30,0.35)]"
                    : "border-transparent"
                }`}
              >
                <span
                  className={`on-dark relative block aspect-[16/10] overflow-hidden rounded-[10px] bg-black transition-opacity duration-300 ${
                    on ? "" : "opacity-80 group-hover:opacity-100"
                  }`}
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

                <span className="stories-caption mt-2 block px-0.5 pb-0.5">
                  <span className="block truncate text-[13px] font-bold leading-tight text-ink">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] leading-tight text-muted">
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
  );


  /* The floating nav is fixed at top-3/top-5 and stands 56px tall, so its
     underside is at 68px on a phone and 76px from `sm` up. The padding is
     written as that plus the clearance rather than as a round number, so it
     cannot drift from the nav it is there to clear. `scroll-mt` is the same
     distance again: the global `scroll-padding-top` is scoped to
     `html:not(.lenis)` and Lenis drives the homepage, so a jump to
     #testimonials landed the section's top edge behind the nav. */
  return (
    <section
      id="testimonials"
      /* overflow-hidden: the arcs below hang 64px past the right edge, which
         is 64px of horizontal scroll on any viewport narrower than they are.
         The picker scrolls inside its own box, so nothing here needs to. */
      /* scroll-mt-0: the top padding already clears the nav, so an anchor
         jump wants the section's own top edge at the top of the screen — a
         scroll margin on top of the padding pushed the picker down behind
         the rail. */
      className="stories section-tint relative isolate overflow-hidden scroll-mt-0 pb-16 lg:pb-10"
    >
      {/* Ground: a mint wash bleeding in from the right and a few thin arcs in
          the corner. Both should register as light rather than as a gradient
          anyone could point at. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 80% at 100% 42%, rgba(27,237,172,0.16) 0%, rgba(27,237,172,0.06) 42%, rgba(255,255,255,0) 72%)",
        }}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 420 420"
        fill="none"
        className="pointer-events-none absolute -right-16 -top-24 -z-10 h-[420px] w-[420px] text-mint"
      >
        {[150, 186, 222, 258].map((r) => (
          <circle
            key={r}
            cx="330"
            cy="90"
            r={r}
            stroke="currentColor"
            strokeOpacity="0.22"
            strokeWidth="1.2"
          />
        ))}
      </svg>

      {/* One grid, two arrangements.

          Every part above is placed into a cell of this grid and nothing is
          positioned against the player. What differs between a landscape
          client and a portrait one is only which row and column each cell
          takes — the parts themselves, and their order in the DOM, are the
          same either way, so switching client never remounts the film.

            wide            reel
            ────────────    ────────────────────────
            intro  1-9      intro   1-4
            note  10-12     player  5-8
            player 1-7      claim   9-12
            claim  8-12
            picker 1-12     picker  1-12

          The placement classes live on these wrappers and never on the
          `[data-reveal]` elements inside them. The reveal observer adds `in`
          imperatively and then unobserves; React owns `class`. An element
          that both reveals and changes class on a re-render loses `in` at the
          first aspect switch and stays at opacity 0 for good — which is
          exactly what emptied the claim column. Keeping the two on separate
          elements is what makes that structural rather than remembered. */}
      {/* One screen, on a laptop and up.

          The three rows are `auto / 1fr / auto`: the heading and the picker
          take what they need and the film's row takes the rest, so the film
          is sized by what is left over rather than by a number chosen in
          advance. Nothing here counts pixels — the row is already the right
          height by the time the film inside it is measured.

          The height subtracts both fixed overlays, not just the nav: the
          timeline rail is 74px along the bottom of every viewport from `md`
          up, and without it in the sum the thumbnail row sits behind the
          rail rather than above it.

          Below `lg` the height comes off and the rows stack, because a
          testimonial squeezed into a phone's viewport is unreadable and
          scrolling is what a phone is for. */}
      <div className="stories-screen shell grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)_auto]">
        <div
          className={
            isReel
              ? "min-h-0 lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:self-center"
              : "lg:col-span-9 lg:col-start-1 lg:row-start-1"
          }
        >
          {intro}
        </div>

        {/* Wide only. Rendered as nothing in the reel rather than moved, so
            the cell simply has no occupant and the grid closes over it. */}
        <div
          className={
            isReel
              ? "hidden"
              : "lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:self-end lg:pb-2"
          }
        >
          {outsideNote}
        </div>

        <div
          className={`stage-cell min-h-0 ${
            isReel
              ? "lg:col-span-4 lg:col-start-5 lg:row-start-2"
              : "lg:col-span-7 lg:col-start-1 lg:row-start-2"
          }`}
        >
          {player}
        </div>

        <div
          className={`min-h-0 ${
            isReel
              ? "lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:self-center"
              : "lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:self-start"
          }`}
        >
          {claim}
        </div>

        <div className="min-h-0 lg:col-span-12 lg:col-start-1 lg:row-start-3">
          {picker}
        </div>
      </div>
    </section>
  );
}
