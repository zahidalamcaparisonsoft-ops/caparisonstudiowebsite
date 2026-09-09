"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Client stories — two layouts of one section.
 *
 * `wide` puts a 16:9 film under the headline with the rail beside it; `reel`
 * puts a 9:16 film in the middle with the text on one side and the rail on the
 * other. Everything else — the eyebrow, the quote, the figures, the picker —
 * is shared, so the variants differ only where they have to.
 *
 * Self-contained: no data layer, no design tokens, no icon package. Colours are
 * literal so the section drops into any Tailwind project unchanged.
 */

type Variant = "wide" | "reel";

/* ------------------------------------------------------------------ palette */

const GREEN = "#10B981";
const INK = "#0A0F0D";
const MUTED = "#5F6F6A";
const HAIRLINE = "#E4EEE9";

/* The clock in the reference. Used until a real file reports its own. */
const DESIGN_TIME = 21;
const DESIGN_DURATION = 156;

/**
 * One client, and everything the rail says about them.
 *
 * `captionRole` is the short form under the thumbnail; `railRole` is the longer
 * one beside the quote — the reference gives both for the featured client.
 *
 * The figures carry no icon. Which icon a figure gets is a property of the
 * position, not of the number, so the three are fixed at the render site and a
 * caption can be rewritten without anyone having to pick a glyph for it.
 */
type Stat = { value: string; label: string };

type Story = {
  id: string;
  name: string;
  captionRole: string;
  railRole: string;
  /** Absent until the client has actually said something on the record. */
  quote?: string;
  /** Absent until there are real figures. All three, or none. */
  stats?: [Stat, Stat, Stat];
  /** A real file, if there is one. The controls drive it. */
  src?: string;
  /**
   * The still behind the play button. None of these have one yet, so the card
   * falls back to its gradient. Intended path: public/testimonials/<id>.webp
   */
  poster?: string;
};

/**
 * The featured client is the only entry with a quote and figures. The other six
 * are real people with real roles, and nothing else — they are waiting on a
 * quote and three numbers each, from the client.
 *
 * Nothing here is to be invented. A testimonial is a claim someone made, and a
 * figure is something that happened; writing either on a client's behalf is a
 * fabrication however plausible it reads. Leave an entry bare until the words
 * come back — the rail is built to show a name with no quote under it.
 */
const STORIES: Story[] = [
  {
    id: "ashwin",
    name: "Ashwin Van Kampen",
    captionRole: "AVK Media",
    railRole: "Founder, AVK Media",
    quote: "From raw footage to real results.",
    stats: [
      { value: "3x", label: "Faster editing" },
      { value: "1M+", label: "Views generated" },
      { value: "50%", label: "More output" },
    ],
  },
  // TODO: real data
  {
    id: "narado",
    name: "Narado Powell",
    captionRole: "Channel Owner",
    railRole: "Channel Owner",
  },
  // TODO: real data
  {
    id: "radu",
    name: "Radu Albert",
    captionRole: "Channel Owner",
    railRole: "Channel Owner",
  },
  // TODO: real data
  {
    id: "peter",
    name: "Peter Deeley",
    captionRole: "Channel Owner",
    railRole: "Channel Owner",
  },
  // TODO: real data
  {
    id: "gaurav",
    name: "Gaurav Patel",
    captionRole: "Channel Owner",
    railRole: "Channel Owner",
  },
  // TODO: real data
  {
    id: "paul",
    name: "Paul Chen",
    captionRole: "Channel Owner",
    railRole: "Channel Owner",
  },
  // TODO: real data
  {
    id: "amit",
    name: "Amit",
    captionRole: "The Link Guy",
    railRole: "The Link Guy",
  },
];

/* Which icon sits on which figure, by position. */
const STAT_ICONS = ["bars", "people", "trend"] as const;

/* Caveat if the host page loads it; a script fallback if not. */
const SCRIPT = 'var(--font-script, "Caveat", "Segoe Script", cursive)';

function clock(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/* -------------------------------------------------------------- hand-drawn */

/**
 * A marker underline. Drawn as a stroked path with round caps rather than a
 * text-decoration, so it keeps the uneven, drawn-in-one-go quality — a border
 * would read as a rule.
 */
function Swash({
  className = "",
  color = GREEN,
  width = 4,
}: {
  className?: string;
  color?: string;
  width?: number;
}) {
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
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The note-to-picture pointer in the wide layout. */
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
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 60 8 70.5 3 54"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------- icons */

function StatIcon({ kind }: { kind: "bars" | "people" | "trend" }) {
  const base = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: GREEN,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "bars") {
    return (
      <svg {...base}>
        <path d="M5 20V13M12 20V5M19 20v-9" />
      </svg>
    );
  }
  if (kind === "people") {
    return (
      <svg {...base}>
        <path d="M15.5 20v-1.4a3.4 3.4 0 0 0-3.4-3.4H6.9a3.4 3.4 0 0 0-3.4 3.4V20" />
        <circle cx="9.5" cy="8.2" r="3.1" />
        <path d="M20.5 20v-1.3a3.4 3.4 0 0 0-2.6-3.3M15.2 5.3a3.1 3.1 0 0 1 0 5.9" />
      </svg>
    );
  }
  return (
    <svg {...base}>
      <path d="M3.5 16.5 9 11l4 4 7.5-7.5" />
      <path d="M15.5 7.5h5v5" />
    </svg>
  );
}

function PlayGlyph({
  size = 14,
  fill = "#fff",
}: {
  size?: number;
  fill?: string;
}) {
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

/* ---------------------------------------------------------------- the page */

export default function ClientStories({
  variant = "wide",
  src: srcProp,
  poster: posterProp,
}: {
  variant?: Variant;
  /** A fallback file, for stories that carry none of their own. */
  src?: string;
  poster?: string;
}) {
  const reel = variant === "reel";

  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(DESIGN_TIME);
  const [duration, setDuration] = useState(DESIGN_DURATION);
  const [active, setActive] = useState(0);

  const rail = useRef<HTMLUListElement>(null);
  const story = STORIES[active];
  /* A story brings its own film where it has one; the props are the fallback
     for a page that supplies a single file for the whole section. */
  const src = story.src ?? srcProp;
  const poster = story.poster ?? posterProp;

  const toggle = useCallback(() => {
    const el = video.current;
    if (!el || !src) {
      // No file behind it — the control still reads as pressed, which is what
      // the reference shows.
      setPlaying((p) => !p);
      return;
    }
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  }, [src]);

  useEffect(() => {
    const el = video.current;
    if (!el || !src) return;
    const onTime = () => {
      setTime(el.currentTime);
      if (Number.isFinite(el.duration) && el.duration > 0)
        setDuration(el.duration);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [src]);

  /* Switching client returns the transport to the start. Without this the bar
     would keep the position of whoever was playing before. */
  useEffect(() => {
    setPlaying(false);
    setTime(DESIGN_TIME);
    setDuration(DESIGN_DURATION);
    const el = video.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, [active]);

  const seek = useCallback(
    (to: number) => {
      const el = video.current;
      if (el && src) el.currentTime = to;
      else setTime(to);
    },
    [src],
  );

  const nudge = (dir: number) => {
    const el = rail.current;
    if (el)
      el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  const progress = duration ? (time / duration) * 100 : 0;

  /* ── the picture ── */
  const picture = (
    <div
      className={`relative overflow-hidden bg-[#0D1210] ${
        reel
          ? "aspect-[9/16] rounded-[18px]"
          : "aspect-video rounded-[18px] border-2 border-[#10B981] shadow-[0_0_0_6px_rgba(16,185,129,0.10),0_28px_60px_-28px_rgba(6,40,30,0.45)]"
      }`}
    >
      {src ? (
        <video
          ref={video}
          src={src}
          poster={poster}
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {/* Badge */}
      <span className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-[#0B0F0DE6] px-3 py-1.5 backdrop-blur sm:left-5 sm:top-5">
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
            style={{ background: GREEN }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: GREEN }}
          />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white">
          {reel ? "Client reel" : "Featured client"}
        </span>
      </span>

      {/* The note written on the picture */}
      <span className="absolute right-4 top-4 z-20 text-right sm:right-6 sm:top-6">
        <span
          className="block text-[19px] leading-[1.15] text-white sm:text-[22px]"
          style={{ fontFamily: SCRIPT }}
        >
          {reel ? (
            <>
              Real people.
              <br />
              Real results.
            </>
          ) : (
            <>
              Great team
              <br />
              to work with!
            </>
          )}
        </span>
        <Swash
          className="ml-auto mt-1 block h-[9px] w-[104px]"
          color="#ffffff"
          width={5}
        />
      </span>

      {/* Centre transport */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="group absolute inset-0 z-10 flex items-center justify-center"
      >
        <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-white/85 bg-white/20 backdrop-blur-[2px] transition-transform duration-300 group-hover:scale-105 sm:h-[86px] sm:w-[86px]">
          {playing ? (
            <svg width="18" height="20" viewBox="0 0 16 18" aria-hidden="true">
              <rect width="5" height="18" rx="1.6" fill="#fff" />
              <rect x="11" width="5" height="18" rx="1.6" fill="#fff" />
            </svg>
          ) : (
            <span className="ml-1">
              <PlayGlyph size={22} />
            </span>
          )}
        </span>
      </button>

      {/* Name over the picture — the reel carries it here, the wide layout
          carries it in the rail instead. */}
      {reel ? (
        <span className="absolute inset-x-5 bottom-[62px] z-20">
          <span className="block text-[17px] font-bold leading-tight text-white">
            {story.name}
          </span>
          <span className="mt-0.5 block text-[13px] text-white/70">
            {story.railRole}
          </span>
        </span>
      ) : null}

      {/* Control bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pb-3.5 pt-10 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="shrink-0 text-white/95 transition-opacity hover:opacity-80"
          >
            {playing ? (
              <svg
                width="11"
                height="13"
                viewBox="0 0 16 18"
                aria-hidden="true"
              >
                <rect width="5" height="18" rx="1.6" fill="currentColor" />
                <rect
                  x="11"
                  width="5"
                  height="18"
                  rx="1.6"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <PlayGlyph size={11} fill="currentColor" />
            )}
          </button>

          <div className="relative h-[5px] flex-1 rounded-full bg-white/25">
            <span
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${progress}%`, background: GREEN }}
            />
            <span
              className="absolute top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${progress}%`, background: GREEN }}
            />
            {/* A real range sits over the drawn track, so the bar can be
                scrubbed with a pointer and with the arrow keys alike. */}
            <input
              type="range"
              min={0}
              max={Math.max(duration, 0.1)}
              step={0.01}
              value={time}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Scrub"
              className="absolute inset-y-[-8px] inset-x-0 w-full cursor-ew-resize opacity-0"
            />
          </div>

          <span className="shrink-0 text-[12px] font-medium tabular-nums text-white/90">
            {clock(time)} / {clock(duration)}
          </span>

          {/* Volume belongs to the wide layout only. */}
          {reel ? null : (
            <button
              type="button"
              aria-label="Mute"
              className="shrink-0 text-white/90 transition-opacity hover:opacity-75"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 9.5v5h3.4L12 18.6V5.4L7.4 9.5H4Z"
                  fill="currentColor"
                />
                <path
                  d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          <button
            type="button"
            aria-label="Fullscreen"
            className="shrink-0 text-white/90 transition-opacity hover:opacity-75"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.5 9V3.5H9M21 9V3.5h-5.5M3.5 15v5.5H9M21 15v5.5h-5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  /* ── the words above the picture ── */
  const intro = (
    <div>
      <span
        className="inline-flex items-center gap-2.5 rounded-full border bg-white py-2 pl-2 pr-4 shadow-[0_2px_10px_rgba(6,40,30,0.06)]"
        style={{ borderColor: HAIRLINE }}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ background: GREEN }}
        >
          <span className="ml-[1px]">
            <PlayGlyph size={8} />
          </span>
        </span>
        <span
          className="text-[12px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: INK }}
        >
          Client stories
        </span>
      </span>

      <h2
        className={`mt-6 font-extrabold tracking-[-0.035em] ${
          reel
            ? "text-[clamp(2.1rem,4vw,3.1rem)] leading-[1.04]"
            : "text-[clamp(2.2rem,4.6vw,3.5rem)] leading-[1.02]"
        }`}
        style={{ color: INK }}
      >
        Don&rsquo;t just take{reel ? <br /> : " "}
        <span style={{ color: GREEN }}>our word for it.</span>
      </h2>

      <p
        className={`mt-4 text-[16px] leading-[1.6] sm:text-[17px] ${reel ? "max-w-[26rem]" : "max-w-[34rem]"}`}
        style={{ color: MUTED }}
      >
        See what creators and businesses around the world say about working with
        us.
      </p>

      {/* Only the reel layout underlines the subhead. */}
      {reel ? (
        <Swash className="mt-2 block h-[10px] w-[124px]" width={5} />
      ) : null}
    </div>
  );

  /* ── the rail ── */
  const railColumn = (
    <div className={reel ? "" : "lg:pt-1"}>
      {/* The note that points back at the picture. Wide layout only — the reel
          writes its note on the picture instead. */}
      {reel ? null : (
        <div className="mb-9 hidden items-start gap-3 lg:flex">
          <CurvedArrow className="mt-6 h-[62px] w-[74px] shrink-0" />
          <span
            className="mt-0.5 block text-[21px] leading-[1.25]"
            style={{ fontFamily: SCRIPT, color: INK }}
          >
            From raw footage
            <br />
            to real results.
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <span
          className="h-[54px] w-[54px] shrink-0 rounded-full"
          style={{ background: "#C7F2E1" }}
        />
        <span className="flex min-w-0 flex-col">
          <span
            className="text-[19px] font-bold leading-tight"
            style={{ color: INK }}
          >
            {story.name}
          </span>
          <span className="mt-0.5 text-[15px]" style={{ color: MUTED }}>
            {story.railRole}
          </span>
        </span>
      </div>

      {/* A client with nothing on the record yet keeps their name and their
          face; the quote and the figures simply are not drawn. Better a short
          rail than a quotation mark with nothing inside it. */}
      {story.quote ? (
        <blockquote className="mt-6">
          <p
            className="text-[19px] italic leading-snug sm:text-[21px]"
            style={{ color: INK }}
          >
            &ldquo;{story.quote}&rdquo;
          </p>
          <Swash className="mt-1.5 block h-[10px] w-[168px]" width={5} />
        </blockquote>
      ) : null}

      {story.stats ? (
        <dl className="mt-7 grid grid-cols-3 gap-3">
          {story.stats.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              className="rounded-2xl border bg-white px-3.5 py-3.5 shadow-[0_2px_12px_rgba(6,40,30,0.05)]"
              style={{ borderColor: HAIRLINE }}
            >
              <span
                className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-[10px]"
                style={{ background: "#DFF7EE" }}
              >
                <StatIcon kind={STAT_ICONS[i]} />
              </span>
              <dd
                className="text-[19px] font-extrabold leading-none"
                style={{ color: INK }}
              >
                {s.value}
              </dd>
              <dt
                className="mt-1.5 text-[12.5px] leading-tight"
                style={{ color: MUTED }}
              >
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      ) : null}

      {/* A little more air when nothing sits between the name and the buttons,
          so the short rail reads as deliberate rather than as a gap. */}
      <div
        className={`${story.quote || story.stats ? "mt-7" : "mt-8"} flex flex-wrap items-center gap-3`}
      >
        <a
          href="#start"
          className="inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold text-white shadow-[0_14px_34px_-12px_rgba(16,185,129,0.55)] transition-transform duration-300 hover:-translate-y-0.5"
          style={{ background: "#06281E" }}
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

        {reel ? null : (
          <a
            href="#stories"
            className="inline-flex items-center rounded-full border bg-white px-7 py-4 text-[15px] font-semibold transition-colors hover:border-[#10B981]"
            style={{ borderColor: HAIRLINE, color: INK }}
          >
            See more stories
          </a>
        )}
      </div>
    </div>
  );

  /* ── the picker ── */
  const carousel = (
    <div className="mt-12 flex items-start gap-5 lg:mt-14">
      <ul
        ref={rail}
        className="flex flex-1 gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {STORIES.map((s, i) => {
          const on = i === active;
          return (
            <li key={s.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={on}
                className={`block w-[188px] rounded-[16px] border-2 p-1.5 text-left transition-all duration-300 ${
                  on
                    ? "border-[#10B981] shadow-[0_0_0_4px_rgba(16,185,129,0.12),0_16px_34px_-18px_rgba(6,40,30,0.35)]"
                    : "border-transparent"
                }`}
              >
                <span className="relative block aspect-[16/10] overflow-hidden rounded-[11px] bg-[#0D1210]">
                  <span className="absolute inset-0 bg-gradient-to-br from-[#20302B] to-[#0D1210]" />
                  <span className="absolute left-1/2 top-1/2 flex h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                    <span className="ml-[2px]">
                      <PlayGlyph size={10} fill={INK} />
                    </span>
                  </span>
                </span>
                <span className="mt-2.5 block px-1 pb-1">
                  <span
                    className="block truncate text-[14px] font-bold leading-tight"
                    style={{ color: INK }}
                  >
                    {s.name}
                  </span>
                  <span
                    className="mt-0.5 block truncate text-[13px]"
                    style={{ color: MUTED }}
                  >
                    {s.captionRole}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="hidden shrink-0 items-center gap-3 pt-14 sm:flex">
        {[-1, 1].map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => nudge(dir)}
            aria-label={dir < 0 ? "Previous stories" : "More stories"}
            className="flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-[0_4px_14px_rgba(6,40,30,0.08)] transition-colors hover:border-[#10B981]"
            style={{ borderColor: HAIRLINE }}
          >
            <svg
              width="17"
              height="13"
              viewBox="0 0 18 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d={
                  dir < 0
                    ? "M17 7H2M7.5 1.5 1.5 7l6 5.5"
                    : "M1 7h15M10.5 1.5 16.5 7l-6 5.5"
                }
                stroke={INK}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section
      /* The top padding clears the floating nav rather than matching the
         bottom: the nav is fixed at top-3/top-5 and stands 56px tall, so its
         underside is at 68px on a phone and 76px from `sm` up — and a flat
         py-16 put the eyebrow 64px down, under it. Written as the nav's
         underside plus the clearance so it cannot drift from the nav it is
         there to clear. */
      className="relative isolate overflow-hidden pb-16 pt-[calc(68px+3.75rem)] sm:pb-20 sm:pt-[calc(76px+4rem)] lg:pb-24 lg:pt-[calc(76px+5rem)]"
      style={{ background: "#F7FBF9" }}
    >
      {/* Ground: a mint wash, a glow bleeding in from the right, and a few
          thin arcs in the corner. All of it should register as light rather
          than as a gradient anyone could point at. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 80% at 100% 42%, rgba(16,185,129,0.13) 0%, rgba(16,185,129,0.05) 42%, rgba(255,255,255,0) 72%)",
        }}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 420 420"
        fill="none"
        className="pointer-events-none absolute -right-16 -top-24 -z-10 h-[420px] w-[420px]"
      >
        {[150, 186, 222, 258].map((r) => (
          <circle
            key={r}
            cx="330"
            cy="90"
            r={r}
            stroke={GREEN}
            strokeOpacity="0.16"
            strokeWidth="1.2"
          />
        ))}
      </svg>

      <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8">
        {reel ? (
          /* Text · picture · rail. The picture is the fixed track; both text
             columns share what is left. */
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)_minmax(0,1fr)] lg:gap-12">
            {intro}
            <div className="mx-auto w-full max-w-[380px]">{picture}</div>
            {railColumn}
          </div>
        ) : (
          /* Words and picture stacked on the left, rail down the right. */
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
            <div className="min-w-0">
              {intro}
              <div className="mt-8">{picture}</div>
            </div>
            {railColumn}
          </div>
        )}

        {carousel}
      </div>
    </section>
  );
}
