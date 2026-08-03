import { MILESTONES } from "@/lib/data";

/**
 * Full-bleed process rail.
 *
 * Was five `.lit` glass cards in a centred grid — the same shape as four other
 * sections. A process is a line, so this is a line: edge-to-edge track, no
 * card chrome, type sitting directly on the page.
 */

const ICONS: Record<string, React.ReactNode> = {
  "01": <path d="M2 12L20 3l-5 18-4-7-9-2z" strokeWidth="1.6" strokeLinejoin="round" />,
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

export default function Journey() {
  return (
    <section id="journey" className="relative py-24 md:py-32">
      {/* Heading is deliberately offset right, against the left-aligned
          sections above and below it. */}
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div data-reveal="1" className="md:ml-[38%] md:max-w-lg">
          <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-mint">
            <span className="h-px w-7 bg-mint" />
            Client journey
          </span>
          <h2 className="h-mid mt-5 font-display font-extrabold text-white">
            Five moves, every time.
          </h2>
          <p className="mt-5 leading-relaxed text-white/60">
            Every engagement runs the same track, so you always know what happens
            next — and when.
          </p>
        </div>
      </div>

      {/* Full-bleed rail */}
      <div className="relative mt-16 md:mt-20">
        {/* The line itself, running the full width of the page. */}
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-mint/45 to-transparent md:block"
        />

        <ol className="mx-auto grid max-w-[1600px] gap-y-10 px-5 sm:px-8 md:grid-cols-5 md:gap-x-8">
          {MILESTONES.map((m, i) => (
            <li key={m.step} data-reveal="1" className="relative flex gap-5 md:block">
              <div className="flex shrink-0 flex-col items-center md:block">
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-mint/40 bg-black text-mint shadow-[0_0_30px_-8px_rgba(27,237,172,.7)]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {ICONS[m.step]}
                  </svg>
                </span>
                {/* Vertical connector, mobile only */}
                {i < MILESTONES.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="mt-2 w-px flex-1 bg-gradient-to-b from-mint/45 to-transparent md:hidden"
                  />
                ) : null}
              </div>

              <div className="pb-8 md:pb-0 md:pt-7">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs tracking-widest text-mint">
                    {m.step}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                    {m.when}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl font-bold text-white">
                  {m.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/55">
                  {m.copy}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
