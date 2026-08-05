import { MILESTONES } from "@/lib/data";

type Step = { step: string; title: string; copy: string; when: string };

/**
 * Full-bleed process rail on the mint flood — the same treatment as the closing
 * CTA band.
 *
 * The wash runs #B6F2DC → #D6F9EC → #A8EED4, so text has to hold against the
 * brightest AND the darkest stop. Ink (#050807) is 15.1–16.5:1 and the deep
 * green (#083D30) is 9.7–10.6:1 across all three. White is 1.1–1.3:1 on this
 * field and is never used here.
 *
 * A process is a line, so this is a line: edge-to-edge track, no card chrome,
 * type sitting directly on the page.
 */

const INK = "#050807";
const DEEP = "#083D30";

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

export default function Journey({ steps }: { steps?: Step[] }) {
  const items = steps?.length ? steps : MILESTONES;
  return (
    <section
      id="journey"
      className="section-flood relative overflow-hidden py-24 md:py-32"
    >
      {/* Film-sprocket texture and corner bloom, as on the CTA band. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 26px)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-white/45 blur-3xl"
      />

      {/* Heading is deliberately offset right, against the left-aligned
          sections above and below it. */}
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <div data-reveal="1" className="md:ml-[38%] md:max-w-lg">
          <h2 className="h-mid font-display font-extrabold" style={{ color: INK }}>
            Five moves, every time.
          </h2>
          <p className="mt-5 leading-relaxed" style={{ color: DEEP }}>
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
          className="absolute left-0 right-0 top-7 hidden h-px md:block"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(5,48,36,.28) 18%, rgba(5,48,36,.28) 82%, transparent)",
          }}
        />

        <ol className="mx-auto grid max-w-[1600px] gap-y-10 px-5 sm:px-8 md:grid-cols-5 md:gap-x-8">
          {items.map((m, i) => (
            <li key={m.step} data-reveal="1" className="relative flex gap-5 md:block">
              <div className="flex shrink-0 flex-col items-center md:block">
                {/* Brand-green disc with a pale glyph. Ink discs were right
                    against the old saturated field; on the wash they read as
                    five holes punched in the band. 4.7:1 against the field,
                    5.2:1 glyph-on-disc. */}
                <span
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-mint-pale shadow-[0_12px_30px_-10px_rgba(5,48,36,.45)]"
                  style={{ background: "var(--color-brand)" }}
                >
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
                {i < items.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="mt-2 w-px flex-1 md:hidden"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(5,8,7,.45), transparent)",
                    }}
                  />
                ) : null}
              </div>

              <div className="pb-8 md:pb-0 md:pt-7">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-mono text-xs font-bold tracking-widest"
                    style={{ color: INK }}
                  >
                    {m.step}
                  </span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: DEEP }}
                  >
                    {m.when}
                  </span>
                </div>
                <h3
                  className="mt-2 font-display text-xl font-bold"
                  style={{ color: INK }}
                >
                  {m.title}
                </h3>
                <p
                  className="mt-2 max-w-xs text-sm leading-relaxed"
                  style={{ color: DEEP }}
                >
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
