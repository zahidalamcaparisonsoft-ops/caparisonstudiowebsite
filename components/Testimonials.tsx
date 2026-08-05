"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLoopRail } from "@/lib/hooks";
import { PROJECTS, TESTIMONIALS } from "@/lib/data";

export type LoadedTestimonial = {
  id?: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  quote: string;
  video?: string;
  poster?: string;
  results?: { label: string; before: string; after: string; delta: string }[];
  projectHref?: string;
  projectSlug?: string;
};
import { FALLBACK_CLIP_SRC } from "@/lib/clips";

/**
 * Client proof, immediately after the hero.
 *
 * The picker sits under the player rather than under the whole two-column
 * block. It controls the video, so it belongs with it — and out there it
 * inherited the height of whichever column was taller, which left a hundred
 * pixels of dead space under the picture.
 *
 * For a video studio a video testimonial is the strongest asset available: it
 * demonstrates the craft while it delivers the words. So the video leads, and
 * the client's own figures sit beside it — the claim and the evidence in one
 * view, rather than a wall of quotes any studio could have written.
 *
 * Figures are read from that client's project in `lib/data.ts`, so a testimonial
 * and its case study can never drift apart.
 *
 * Nothing autoplays. A testimonial that starts talking at you unprompted is the
 * fastest way to get a tab closed.
 */

export default function Testimonials({ items }: { items?: LoadedTestimonial[] }) {
  const list: LoadedTestimonial[] = items?.length
    ? items
    : TESTIMONIALS.map((x) => ({
        ...x,
        results: PROJECTS.find((p) => p.slug === x.projectSlug)?.study.results ?? [],
        projectHref: `/work/${x.projectSlug}`,
      }));
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  /* One rail, shared with the hero's client bar. The list is rendered twice
     below: five clients happened to fit the column exactly, and a rail with
     one copy had nowhere to advance to and simply never moved. */
  const { ref: rail, onPointerDown, moved, hold } = useLoopRail<HTMLUListElement>();

  const t = list[Math.min(active, list.length - 1)];
  const results = t.results ?? [];

  // Switching client always returns to the poster — never mid-play audio from
  // someone the visitor did not choose.
  useEffect(() => {
    setPlaying(false);
    const el = video.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, [active]);

  const play = useCallback(() => {
    const el = video.current;
    if (!el) return;
    el.currentTime = 0;
    el.muted = false;
    el.controls = true;
    void el.play().catch(() => {
      el.muted = true;
      void el.play().catch(() => {});
    });
    setPlaying(true);
  }, []);

  return (
    <section id="testimonials" className="section-tint relative py-20 md:py-28">
      <div className="shell">
        <div data-reveal="1" className="max-w-2xl">
          <h2 className="h-mid font-display font-extrabold text-ink">
            Don&apos;t take our word for it.
          </h2>
          <p className="mt-4 text-body">
            Five teams, on camera, with the numbers that came with it.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          {/* ── The video ── */}
          {/* min-w-0: a grid item defaults to min-width:auto, so without it the
              column stretches to fit the whole rail instead of the rail
              scrolling inside the column. */}
          <div data-reveal="1" className="min-w-0">
            <div className="on-dark relative aspect-video overflow-hidden rounded-2xl border border-ink/10 bg-black shadow-[0_30px_70px_-40px_rgba(5,30,24,.55)]">
              <video
                ref={video}
                key={t.id ?? t.name}
                src={t.video ?? FALLBACK_CLIP_SRC}
                poster={t.poster}
                playsInline
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {!playing ? (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40"
                  />
                  <button
                    type="button"
                    onClick={play}
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

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-mint/40 bg-black/70 font-mono text-[11px] font-bold text-mint backdrop-blur">
                        {t.initials}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-bold text-white">{t.name}</span>
                        <span className="text-xs text-white/60">
                          {t.role}, {t.company}
                        </span>
                      </span>
                    </span>
                    <span className="hidden rounded-md border border-white/20 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur sm:block">
                      Video testimonial
                    </span>
                  </div>
                </>
              ) : null}
            </div>

          {/* ── Pick a client ── */}
          <ul
            ref={rail}
            onPointerDown={onPointerDown}
            aria-label="Choose a client"
            className="rail-fade mt-4 flex cursor-grab gap-3 overflow-x-auto pb-2 [scroll-behavior:auto] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          >
            {[...list, ...list].map((item, n) => {
              const i = n % list.length;
              // The second pass is a visual loop only — one set is enough for
              // assistive tech and for the tab order.
              const echo = n >= list.length;
              const on = i === active;
              return (
                <li
                  key={`${item.id ?? item.name}-${n}`}
                  className="shrink-0"
                  aria-hidden={echo || undefined}
                >
                  <button
                    type="button"
                    onClick={() => {
                      // A drag ends in a click on whatever was under the finger.
                      if (moved.current) {
                        moved.current = false;
                        return;
                      }
                      setActive(i);
                      hold(2);
                    }}
                    tabIndex={echo ? -1 : undefined}
                    aria-current={on && !echo}
                    className={`flex items-center gap-3 rounded-full border px-4 py-2.5 text-left transition-colors ${
                      on
                        ? "border-brand/50 bg-mint/25"
                        : "border-ink/12 bg-white hover:border-ink/30"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                        on ? "bg-mint text-ink" : "border border-ink/15 text-body"
                      }`}
                    >
                      {item.initials}
                    </span>
                    <span className="flex flex-col">
                      <span
                        className={`whitespace-nowrap text-xs font-bold ${on ? "text-brand" : "text-ink"}`}
                      >
                        {item.company}
                      </span>
                      <span className="whitespace-nowrap text-[11px] text-body">
                        {item.name}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          </div>

          {/* ── The claim, and the evidence ── */}
          <div data-reveal="1" className="flex flex-col lg:justify-between">
            <blockquote className="font-display text-[clamp(1.25rem,2.4vw,1.75rem)] font-extrabold leading-snug tracking-[-0.02em] text-ink">
              <span className="text-brand">&ldquo;</span>
              {t.quote}
              <span className="text-brand">&rdquo;</span>
            </blockquote>

            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/25 bg-mint/25 font-mono text-[11px] font-bold text-brand">
                {t.initials}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-bold text-ink">{t.name}</span>
                <span className="text-xs text-muted">
                  {t.role}, {t.company}
                </span>
              </span>
            </div>

            {/* The success material — their figures, not our adjectives. */}
            <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {results.map((r) => (
                <div
                  key={r.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                >
                  <dt className="text-sm text-body">{r.label}</dt>
                  <dd className="flex items-baseline gap-2.5 font-mono text-xs">
                    <span className="text-muted line-through">{r.before}</span>
                    <span className="text-ink">{r.after}</span>
                    <span className="rounded bg-mint px-1.5 py-0.5 text-[11px] font-bold text-ink">
                      {r.delta}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            {t.projectHref ? (
              <Link
                href={t.projectHref}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
              >
                Read the {t.company} case study
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </div>

      </div>
    </section>
  );
}
