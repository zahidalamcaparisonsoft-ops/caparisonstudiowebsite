"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientBand, ClientLogo } from "@/lib/data";

/**
 * Who the studio has worked for.
 *
 * A section of its own rather than a strip at the foot of the client stories.
 * It is answering a different question — the stories say what one client
 * thought, this says how many there have been — and a claim about the whole
 * client list reads as a footnote when it is set as one.
 *
 * The marks sit on one white rail, divided by hairlines, with an arrow at each
 * end. A rail rather than a grid because the list only grows: a grid reflows
 * into a new shape with every client added and leaves a ragged last row, while
 * a rail takes any number without the section changing height.
 *
 * Logos arrive in whatever colours their owners chose, so they are muted at
 * rest and take their own colour under the pointer. A row of them at full
 * strength competes with itself and with the page; muted, the row reads as one
 * thing, and the colour is still there for anyone who looks.
 *
 * Renders nothing when there is nothing to show. A section headed "trusted by"
 * with an empty rail under it is worse than no section.
 */

/** How far one press of an arrow moves the rail, as a share of its width. */
const STEP = 0.7;

function StatIcon({ which }: { which: number }) {
  const base = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (which === 0) {
    return (
      <svg {...base}>
        <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
        <circle cx="10" cy="8" r="3.2" />
        <path d="M20 19v-1.4a3.5 3.5 0 0 0-2.6-3.35M15.6 5.2a3.2 3.2 0 0 1 0 6.05" />
      </svg>
    );
  }
  if (which === 1) {
    return (
      <svg {...base}>
        <circle cx="12" cy="12" r="8.6" />
        <path d="M3.6 12h16.8M12 3.4c2.1 2.3 3.2 5.3 3.2 8.6s-1.1 6.3-3.2 8.6c-2.1-2.3-3.2-5.3-3.2-8.6S9.9 5.7 12 3.4z" />
      </svg>
    );
  }
  if (which === 2) {
    return (
      <svg {...base}>
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
    <svg {...base}>
      <path d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.75-5.2-2.73-5.2 2.73 1-5.75-4.2-4.1 5.8-.85L12 3.6z" />
    </svg>
  );
}

/** The heading, with the studio's chosen words set in green. */
function Heading({ text, accent }: { text: string; accent: string }) {
  const at = accent ? text.indexOf(accent) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="text-brand">{accent}</span>
      {text.slice(at + accent.length)}
    </>
  );
}

export default function ClientLogos({
  marks,
  band,
}: {
  marks?: ClientLogo[];
  band: ClientBand;
}) {
  const list = marks ?? [];
  const rail = useRef<HTMLUListElement>(null);
  const grab = useRef<{ x: number; from: number } | null>(null);
  const dragged = useRef(false);
  const [ends, setEnds] = useState({ left: false, right: false });

  const readEnds = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEnds({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 });
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    readEnds();
    el.addEventListener("scroll", readEnds, { passive: true });
    const ro = new ResizeObserver(readEnds);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", readEnds);
      ro.disconnect();
    };
  }, [readEnds, list.length]);

  /* Dragged as well as scrolled, the way the film strip is. Mouse only: a
     touch screen scrolls this natively, with momentum, and running both moves
     the rail twice per swipe. */
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const g = grab.current;
      const el = rail.current;
      if (!g || !el) return;
      const dx = e.clientX - g.x;
      if (Math.abs(dx) > 6) dragged.current = true;
      el.scrollLeft = g.from - dx;
    };
    const up = () => {
      grab.current = null;
      requestAnimationFrame(() => {
        dragged.current = false;
      });
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

  const nudge = useCallback((dir: number) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * STEP, behavior: "smooth" });
  }, []);

  if (!list.length) return null;

  return (
    <section
      id="clients"
      className="relative isolate overflow-hidden py-20 md:py-24"
    >
      {/* A mint wash and two sets of thin arcs, one in each far corner. All of
          it should register as light rather than as a picture. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(160deg, #F4FBF8 0%, #FFFFFF 42%, #F2FAF6 100%)",
        }}
      />
      {[
        "-left-40 -top-52 h-[560px] w-[560px]",
        "-bottom-64 -right-40 h-[620px] w-[620px]",
      ].map((pos) => (
        <svg
          key={pos}
          aria-hidden="true"
          viewBox="0 0 400 400"
          fill="none"
          className={`pointer-events-none absolute -z-10 ${pos}`}
        >
          {[120, 160, 200, 240].map((r) => (
            <circle
              key={r}
              cx="200"
              cy="200"
              r={r}
              stroke="currentColor"
              className="text-brand/15"
              strokeWidth="1"
            />
          ))}
        </svg>
      ))}

      <div className="shell text-center">
        {band.eyebrow ? (
          <span
            data-reveal="1"
            className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink shadow-[0_2px_10px_rgba(6,40,30,0.05)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {band.eyebrow}
          </span>
        ) : null}

        <h2
          data-reveal="1"
          className="mx-auto mt-6 max-w-6xl text-balance font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-ink"
        >
          <Heading text={band.heading} accent={band.headingAccent} />
        </h2>

        {band.subhead ? (
          <p
            data-reveal="1"
            className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-body sm:text-base"
          >
            {band.subhead}
          </p>
        ) : null}
      </div>

      {/* ── the rail ──
          Outside the shell, so the arrows have room to sit off the card on a
          wide screen rather than overlapping the marks. */}
      <div
        data-reveal="1"
        className="relative mx-auto mt-10 flex max-w-[1360px] items-center gap-3 px-4 sm:gap-5 sm:px-6 md:mt-12"
      >
        {[-1, 1].map((dir) => {
          const live = dir < 0 ? ends.left : ends.right;
          return (
            <button
              key={dir}
              type="button"
              onClick={() => nudge(dir)}
              aria-label={dir < 0 ? "Previous clients" : "More clients"}
              className={`hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/10 bg-white text-ink shadow-[0_6px_20px_rgba(6,40,30,0.08)] transition-all duration-300 hover:border-brand/40 hover:text-brand sm:grid ${
                dir < 0 ? "order-first" : "order-last"
              } ${live ? "opacity-100" : "pointer-events-none opacity-35"}`}
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
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          );
        })}

        <div className="min-w-0 flex-1 overflow-hidden rounded-[2rem] bg-white px-2 py-3 shadow-[0_10px_40px_-18px_rgba(6,40,30,0.18)] sm:px-4 sm:py-4">
          <ul
            ref={rail}
            onPointerDown={(e) => {
              const el = rail.current;
              if (!el || e.pointerType !== "mouse") return;
              grab.current = { x: e.clientX, from: el.scrollLeft };
            }}
            /* Capture, so a drag that ends over a mark is swallowed before
               the link under it opens. */
            onClickCapture={(e) => {
              if (!dragged.current) return;
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragStart={(e) => e.preventDefault()}
            className="flex cursor-grab select-none items-stretch overflow-x-auto [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          >
            {list.map((m, i) => {
              const body = m.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.logo}
                  alt={m.name}
                  loading="lazy"
                  draggable={false}
                  /* Capped both ways: `object-contain` in a fixed box is what
                     keeps a letterbox wordmark and a square badge at the same
                     optical size. Sizing by width alone is what makes one
                     client look like the important one. */
                  className="max-h-9 w-auto max-w-full object-contain opacity-90 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-10"
                />
              ) : (
                /* No mark uploaded yet. The name set in the display face still
                   reads as a logo rather than as a gap, so the rail never goes
                   patchy while the files are coming in. */
                <span className="whitespace-nowrap text-center font-display text-sm font-extrabold leading-tight tracking-[-0.02em] text-ink/55 transition-colors duration-300 group-hover:text-ink sm:text-base">
                  {m.name}
                </span>
              );

              const cell =
                "group flex h-16 w-full items-center justify-center px-5 sm:h-[4.5rem] sm:px-8";

              return (
                <li
                  key={m.id}
                  /* The hairline is a left border on everything but the first,
                     so the rail never ends on a divider however many marks
                     are in it or wherever it is scrolled to. */
                  className={`flex shrink-0 items-center ${
                    i > 0 ? "border-l border-ink/[0.08]" : ""
                  }`}
                >
                  {m.href ? (
                    <a
                      href={m.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cell}
                    >
                      {body}
                    </a>
                  ) : (
                    <span className={cell}>{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ── the studio's figures ── */}
      {band.stats.length ? (
        <div className="shell">
          <dl
            data-reveal="1"
            className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-y-6 md:mt-12"
          >
            {band.stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-center gap-3 px-5 sm:px-7 ${
                  i > 0 ? "md:border-l md:border-ink/10" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint-pale text-brand">
                  <StatIcon which={i} />
                </span>
                <span className="flex flex-col text-left">
                  <dd className="font-display text-[17px] font-extrabold leading-none tracking-[-0.02em] text-ink sm:text-lg">
                    {s.value}
                  </dd>
                  <dt className="mt-1 text-[13px] leading-tight text-muted">
                    {s.label}
                  </dt>
                </span>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
