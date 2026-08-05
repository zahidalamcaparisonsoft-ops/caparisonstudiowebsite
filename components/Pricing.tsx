"use client";

import Link from "next/link";
import { useLitSurface } from "@/lib/hooks";

/**
 * Inverted (light) pricing band.
 *
 * Sits on the tinted paper so the three cards can be plain white and still
 * separate from the band behind them.
 *
 * The brand mint is unusable for text on any of these surfaces (1.43:1), so
 * `--color-brand` (#0A7256, 5.53:1) carries every accent that has to be read.
 */

const TIERS = [
  {
    name: "Single",
    price: "$180",
    unit: "per video",
    copy: "One-off cuts, no commitment.",
    features: [
      "One video per brief",
      "5-day first cut",
      "2 revision rounds",
      "4K master + captions",
    ],
    cta: "Start a project",
    featured: false,
  },
  {
    name: "Weekly",
    price: "$1,440",
    unit: "per month",
    copy: "The usual starting point for a publishing team.",
    features: [
      "4 videos per month",
      "Named editor",
      "3-day first cut",
      "Shorts pack included",
      "Client review portal",
      "10% volume discount",
    ],
    cta: "Get an estimate",
    featured: true,
  },
  {
    name: "Studio",
    price: "Custom",
    unit: "from $4k / month",
    copy: "Daily output, motion, and a producer who knows your channel.",
    features: [
      "8–30 videos per month",
      "Named producer + editor pod",
      "Motion graphics included",
      "34-hour revisions",
      "Priority scheduling",
      "Up to 30% volume discount",
    ],
    cta: "Book a call",
    featured: false,
  },
];

function Tier({ tier }: { tier: (typeof TIERS)[number] }) {
  const ref = useLitSurface<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal="1"
      className={`lit flex flex-col rounded-3xl p-7 ${
        tier.featured ? "bg-white shadow-[0_30px_80px_-40px_rgba(5,30,24,.5)]" : ""
      }`}
      style={tier.featured ? { borderColor: "rgba(10,114,86,.35)" } : undefined}
    >
      {/* Rendered on every tier (hidden when not featured) so the badge does not
          shift the price line out of alignment across the three cards. */}
      <span
        aria-hidden={!tier.featured}
        className={`mb-4 w-fit rounded-full px-3 py-1 font-mono text-[10px] tracking-wide text-white ${
          tier.featured ? "" : "invisible"
        }`}
        style={{ background: "var(--color-brand)" }}
      >
        Most chosen
      </span>

      <h3 className="font-display text-lg font-bold text-ink">{tier.name}</h3>
      {/* Fixed height keeps one- and two-line descriptions on the same grid. */}
      <p className="mt-1.5 min-h-[2.5rem] text-sm text-body">{tier.copy}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-4xl font-extrabold leading-none text-ink">
          {tier.price}
        </span>
        <span className="text-xs text-body">{tier.unit}</span>
      </div>

      <ul className="mt-7 flex flex-1 flex-col gap-3">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-body"
          >
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
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="#onboarding"
        className={`mt-8 rounded-full px-6 py-3.5 text-center text-sm font-bold transition-all ${
          tier.featured
            ? "text-white hover:brightness-110"
            : "border border-ink/15 text-ink hover:border-brand/50 hover:bg-brand/5"
        }`}
        style={tier.featured ? { background: "var(--color-brand)" } : undefined}
      >
        {tier.cta}
      </Link>
    </div>
  );
}

export type Tier = (typeof TIERS)[number];

export default function Pricing({ tiers }: { tiers?: Tier[] }) {
  const items = tiers?.length ? tiers : TIERS;
  return (
    <section
      id="pricing"
      className="section-tint scene relative py-24 md:py-32"
    >
      <div className="shell">
        <div data-reveal="1" className="mx-auto max-w-2xl text-center">
          <h2 className="h-mid font-display font-extrabold text-ink">
            No call required to see a number.
          </h2>
          <p className="mt-5 text-base text-body">
            Every plan includes a first cut, two revision rounds, 4K masters and
            captions. The tier sets the crew, not the care.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {items.map((tier) => (
            <Tier key={tier.name} tier={tier} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-body">
          Not sure which fits?{" "}
          <Link
            href="#onboarding"
            className="font-semibold underline underline-offset-4"
            style={{ color: "var(--color-brand)" }}
          >
            Answer four questions
          </Link>{" "}
          and see your exact number.
        </p>
      </div>
    </section>
  );
}
