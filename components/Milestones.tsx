"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The studio's journey, year by year.
 *
 * A vertical spine rather than another horizontal rail — the process section
 * already owns that shape, and a list that grows downward is what a history
 * looks like. Each entry arrives as the spine reaches it, so the line draws
 * itself past the years rather than the whole block appearing at once.
 *
 * Placeholder content. The figures are kept in step with the band above
 * (fourteen people, 1,240 videos, 98% on time) so the two do not contradict
 * each other; swap the wording for the real history before launch.
 */

const MILESTONES = [
  {
    year: "2014",
    title: "Two people and one edit suite",
    copy: "Founded in Berlin cutting music documentaries, working out of a room with one monitor between us.",
  },
  {
    year: "2016",
    title: "The first retainer",
    copy: "A weekly show that had to ship every Thursday. The cadence it forced on us became the way the studio runs.",
  },
  {
    year: "2018",
    title: "Colour and sound in-house",
    copy: "Stopped subcontracting the finish. One team from rushes to master, which took a week out of every delivery.",
  },
  {
    year: "2020",
    title: "Review moved off email",
    copy: "Built the timecode review portal after losing one too many notes in a thread. Revisions have been comments on a frame ever since.",
  },
  {
    year: "2022",
    title: "Five hundredth video",
    copy: "Delivered for automation channels, podcasts and product teams — and started publishing the retention data behind the cuts.",
  },
  {
    year: "2024",
    title: "Fourteen editors, four time zones",
    copy: "Named editors assigned per channel, so the person cutting your video is the person who cut the last one.",
  },
  {
    year: "2026",
    title: "1,240 videos, 98% on time",
    copy: "Ten years in, the rule has not moved: the edit serves the watch time, not the editor's ego.",
  },
];

export default function Milestones() {
  const ref = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // 0 as the list's top reaches the lower third of the screen, 1 once its
      // bottom has climbed to the upper third — so the spine tracks the read
      // rather than finishing off-screen.
      const from = window.innerHeight * 0.85;
      const to = window.innerHeight * 0.35;
      const travelled = from - r.top;
      const span = r.height + (from - to);
      setProgress(Math.min(1, Math.max(0, travelled / span)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const shownAt = (i: number) => {
    const span = 1 / (MILESTONES.length + 1);
    return Math.min(1, Math.max(0, (progress - i * span) / (span * 1.5)));
  };

  return (
    <div className="mt-14">
      <div className="max-w-2xl">
        <h3 className="font-display text-[clamp(1.6rem,3.6vw,2.4rem)] font-extrabold leading-tight tracking-[-0.03em] text-ink">
          Ten years of other people&apos;s footage.
        </h3>
        <p className="mt-4 leading-relaxed text-body">
          Every year here changed how the next one was cut.
        </p>
      </div>

      <ol ref={ref} className="relative mt-12">
        {/* The spine, drawn just ahead of the entry it is about to reach. */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-[5.5rem] top-2 hidden w-px origin-top bg-ink/12 sm:block"
          style={{ transform: `scaleY(${Math.min(1, progress * 1.2).toFixed(3)})` }}
        />

        {MILESTONES.map((m, i) => {
          const at = shownAt(i);
          return (
            <li
              key={m.year}
              className="relative grid gap-x-8 gap-y-2 pb-10 last:pb-0 sm:grid-cols-[5.5rem_1fr]"
              style={{
                opacity: at,
                transform: `translate3d(0, ${((1 - at) * 20).toFixed(1)}px, 0)`,
              }}
            >
              <div className="flex items-start gap-3 sm:block">
                <span className="font-display text-lg font-extrabold tabular-nums text-brand sm:text-xl">
                  {m.year}
                </span>
              </div>

              {/* Node on the spine. */}
              <span
                aria-hidden="true"
                className="absolute left-[5.5rem] top-2 hidden h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-brand ring-4 ring-paper-2 sm:block"
              />

              <div className="sm:pl-6">
                <h4 className="font-display text-base font-bold text-ink sm:text-lg">
                  {m.title}
                </h4>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-body">
                  {m.copy}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
