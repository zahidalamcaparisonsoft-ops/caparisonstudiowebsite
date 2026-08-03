"use client";

import { MILESTONES } from "@/lib/data";
import { useLitSurface } from "@/lib/hooks";

const ICONS: Record<string, React.ReactNode> = {
  "01": (
    <path d="M2 12L20 3l-5 18-4-7-9-2z" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  "02": (
    <>
      <rect x="2" y="7" width="19" height="14" rx="2" strokeWidth="1.6" />
      <path d="M2 11h19M7 7L4 3M13 7l-3-4M19 7l-3-4" strokeWidth="1.6" />
    </>
  ),
  "03": (
    <path
      d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  "04": (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 3v5h-5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "05": (
    <>
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <path d="M8 12l3 3 5-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

function Step({ milestone, index }: { milestone: (typeof MILESTONES)[number]; index: number }) {
  const ref = useLitSurface<HTMLDivElement>();

  return (
    <div data-reveal="1" className="relative flex gap-5 md:flex-col md:gap-0">
      {/* Node */}
      <div className="relative z-10 flex shrink-0 flex-col items-center md:mb-7 md:items-start">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-mint/40 bg-black text-mint shadow-[0_0_28px_-6px_rgba(27,237,172,.6)]">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            {ICONS[milestone.step]}
          </svg>
        </span>
        {/* Vertical connector on mobile */}
        {index < MILESTONES.length - 1 ? (
          <span
            aria-hidden="true"
            className="mt-2 w-px flex-1 bg-gradient-to-b from-mint/50 to-mint/5 md:hidden"
          />
        ) : null}
      </div>

      <div ref={ref} className="lit mb-8 flex-1 rounded-2xl p-5 md:mb-0">
        <span className="font-mono text-xs tracking-widest text-mint">
          {milestone.step}
        </span>
        <h3 className="mt-2 font-display text-lg font-bold text-white">
          {milestone.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{milestone.copy}</p>
        <span className="mt-4 block font-mono text-[11px] tracking-widest text-white/35">
          {milestone.when}
        </span>
      </div>
    </div>
  );
}

export default function Journey() {
  return (
    <section id="journey" className="scene relative px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <div data-reveal="1" className="max-w-2xl">
          <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-mint">
            <span className="h-px w-7 bg-mint" />
            Client journey
          </span>
          <h2 className="mt-5 font-display text-[clamp(2rem,6vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
            From raw files to published, in five moves.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60">
            Every engagement runs the same track. You always know what happens next.
          </p>
        </div>

        <div className="relative mt-14">
          {/* Horizontal connector on desktop */}
          <span
            aria-hidden="true"
            className="absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-mint/10 via-mint/50 to-mint/10 md:block"
          />
          <div className="grid gap-0 md:grid-cols-5 md:gap-5">
            {MILESTONES.map((milestone, i) => (
              <Step key={milestone.step} milestone={milestone} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
