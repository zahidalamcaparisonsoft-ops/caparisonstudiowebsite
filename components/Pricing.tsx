"use client";

import Link from "next/link";
import AccentHeading from "./AccentHeading";
import { PRICING_BAND, type PricingBand } from "@/lib/data";
import { useLitSurface } from "@/lib/hooks";

/**
 * The published rate card.
 *
 * Four services rather than three tiers of one service. The old card sold
 * commitment — Single, Weekly, Studio — which asks a visitor to decide how
 * often they will publish before they have decided whether we can cut what
 * they make. These are priced per finished piece, so the question each card
 * answers is "what do you need?", and volume is settled later in the brief.
 *
 * Three of the four are priced per video or per reel and motion graphics is
 * priced per minute, so the unit is printed as loudly as the figure. A rate
 * card that shows "$150" and leaves the unit to the small print is the one
 * thing worse than no rate card.
 *
 * Every figure is a starting rate, which is why the band underneath is not
 * decoration: it says what moves the number, what volume earns, and where to
 * go when none of the four fits. Those three answers are the reason the rates
 * can be published at all.
 *
 * Inverted (light) band on the tinted paper, so the cards can be plain white
 * and still separate from what is behind them. The brand mint is unusable for
 * text on any of these surfaces (1.43:1), so `--color-brand` (#0A7256,
 * 5.53:1) carries every accent that has to be read.
 */

const TIERS = [
  {
    name: "Faceless Videos",
    price: "$120",
    unit: "/ video",
    copy: "YouTube • Documentary • Automation",
    features: [
      "Professional editing",
      "Stock footage & B-roll",
      "Music & sound effects",
      "Basic motion graphics",
      "Color correction & audio mix",
      "Max duration 10 minutes",
    ],
    cta: "Get Exact Quote",
    featured: false,
  },
  {
    name: "Talking Head Videos",
    price: "$150",
    unit: "/ video",
    copy: "Educational • Coaching • Brand Content",
    features: [
      "Professional editing",
      "Jump cuts & pacing",
      "Captions & subtitles",
      "B-roll integration",
      "Motion graphics",
      "Music and sound effects",
      "Color correction & audio enhancement",
      "Max duration 10 minutes",
    ],
    cta: "Get Exact Quote",
    featured: true,
  },
  {
    name: "Advanced Motion Graphics",
    price: "$150",
    unit: "/ minute",
    copy: "Explainer • Brand Films • Custom Animation",
    features: [
      "Custom motion design",
      "Typography & visual effects",
      "Smooth transitions",
      "Brand-aligned visuals",
      "High-quality output (up to 4K)",
      "Music and sound effects",
    ],
    cta: "Get Exact Quote",
    featured: false,
  },
  {
    name: "Social Media Reels",
    price: "$50",
    unit: "/ reel",
    copy: "Instagram • TikTok • YouTube Shorts",
    features: [
      "Engaging, fast-paced edits",
      "Captions & trendy text styles",
      "Music & sound effects",
      "Platform-optimized (9:16, 1:1, etc.)",
      "Quick turnaround",
    ],
    cta: "Get Exact Quote",
    featured: false,
  },
];

/* ------------------------------------------------------------------- icons */

/** One per point in the band, fixed by position. */
function NoteIcon({ which }: { which: number }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const base = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };
  if (which === 0) {
    // What moves the number.
    return (
      <svg {...base}>
        <path d="M13.2 2.8 5 13.4h5.4L10 21.2 18.6 10.4H13l.2-7.6z" {...p} />
      </svg>
    );
  }
  if (which === 1) {
    // What volume earns.
    return (
      <svg {...base}>
        <circle cx="9.6" cy="8" r="3.2" {...p} />
        <path d="M3.6 19v-1.5A3.5 3.5 0 0 1 7.1 14h5a3.5 3.5 0 0 1 3.5 3.5V19" {...p} />
        <path d="M20.4 19v-1.4a3.5 3.5 0 0 0-2.6-3.35M16 5.2a3.2 3.2 0 0 1 0 6.05" {...p} />
      </svg>
    );
  }
  // Where to go when none of the four fits.
  return (
    <svg {...base}>
      <path d="M20.5 12.6a7.4 7.4 0 0 1-7.9 7.4 8.6 8.6 0 0 1-2.5-.45L4.4 21l1.35-4.5A7.4 7.4 0 0 1 12.3 4.6a7.4 7.4 0 0 1 8.2 8z" {...p} />
    </svg>
  );
}

function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="mt-1 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M5 13l4 4L19 7"
        stroke="var(--color-brand)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------- cards */

function Tier({ tier, fromLabel }: { tier: Tier; fromLabel: string }) {
  const ref = useLitSurface<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal="1"
      className={`lit flex flex-col rounded-3xl p-6 ${
        tier.featured ? "bg-white shadow-[0_30px_80px_-40px_rgba(5,30,24,.5)]" : ""
      }`}
      style={tier.featured ? { borderColor: "rgba(10,114,86,.35)" } : undefined}
    >
      {/* Rendered on every tier (hidden when not featured) so the badge does not
          shift the price line out of alignment across the four cards. */}
      <span
        aria-hidden={!tier.featured}
        className={`mb-4 w-fit rounded-full px-3 py-1 font-mono text-[10px] tracking-wide text-white ${
          tier.featured ? "" : "invisible"
        }`}
        style={{ background: "var(--color-brand)" }}
      >
        Most chosen
      </span>

      <h3 className="font-display text-lg font-bold leading-tight text-ink">
        {tier.name}
      </h3>
      {/* Fixed height keeps a one- and a two-line tag list on the same grid. */}
      <p className="mt-1.5 min-h-[2.5rem] text-[13px] leading-snug text-muted">
        {tier.copy}
      </p>

      <span className="mt-5 block text-xs text-body">{fromLabel}</span>
      {/* The unit sits on the price line and is sized to be read, not skimmed:
          "$150" alone means two different things across these four cards. */}
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 border-b border-ink/10 pb-5">
        <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-[-0.03em] text-brand">
          {tier.price}
        </span>
        <span className="font-display text-base font-bold text-ink/70">
          {tier.unit}
        </span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm leading-snug text-body"
          >
            <Check />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="#onboarding"
        className={`mt-8 flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-sm font-bold transition-all ${
          tier.featured
            ? "text-white hover:brightness-110"
            : "border border-ink/15 text-ink hover:border-brand/50 hover:bg-brand/5"
        }`}
        style={tier.featured ? { background: "var(--color-brand)" } : undefined}
      >
        {tier.cta} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export type Tier = (typeof TIERS)[number];

export default function Pricing({
  tiers,
  band,
}: {
  tiers?: Tier[];
  band?: PricingBand;
}) {
  const items = tiers?.length ? tiers : TIERS;
  const b = band ?? PRICING_BAND;

  return (
    <section id="pricing" className="section-tint scene relative py-24 md:py-32">
      <div className="shell">
        <div data-reveal="1" className="mx-auto max-w-3xl text-center">
          {b.eyebrow ? (
            <span className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink shadow-[0_2px_10px_rgba(6,40,30,0.05)]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {b.eyebrow}
            </span>
          ) : null}

          <h2 className="mt-6 text-balance font-display font-extrabold text-ink h-mid">
            <AccentHeading text={b.heading} accent={b.headingAccent} />
          </h2>

          {b.subhead ? (
            <p className="mt-5 text-base leading-relaxed text-body">
              {b.subhead}
            </p>
          ) : null}
        </div>

        {/* Two up before four, never three: a 3-across row leaves the fourth
            card stranded on a line of its own. */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((tier) => (
            <Tier key={tier.name} tier={tier} fromLabel={b.fromLabel} />
          ))}
        </div>

        {/* ── what the starting rates leave open ── */}
        {b.notes.length || b.ctaLabel ? (
          <div
            data-reveal="1"
            className="mt-6 grid gap-8 rounded-3xl border border-ink/10 bg-white p-7 shadow-[0_24px_60px_-40px_rgba(5,30,24,.35)] md:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12"
          >
            <dl className="grid gap-7 sm:grid-cols-3">
              {b.notes.map((note, i) => (
                <div key={note.title} className="flex flex-col">
                  <dt className="flex items-center gap-2.5 font-display text-[15px] font-bold text-ink">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mint-pale text-brand">
                      <NoteIcon which={i} />
                    </span>
                    {note.title}
                  </dt>
                  <dd className="mt-2.5 text-[13px] leading-relaxed text-muted">
                    {note.body}
                  </dd>
                </div>
              ))}
            </dl>

            {b.ctaLabel ? (
              <div className="flex flex-col items-start gap-2.5 border-t border-ink/10 pt-7 lg:items-center lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                <Link
                  href={b.ctaHref || "#onboarding"}
                  className="flex items-center gap-2 rounded-full bg-mint px-7 py-4 text-sm font-bold text-ink transition-all hover:bg-mint-bright"
                >
                  {b.ctaLabel} <span aria-hidden="true">→</span>
                </Link>
                {b.ctaNote ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    {b.ctaNote}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
