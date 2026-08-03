"use client";

import Link from "next/link";
import { useLitSurface } from "@/lib/hooks";

/**
 * Inverted (light) pricing band.
 *
 * The one full tonal break in the page. It also happens to be the section
 * where inverting means something: "no call required to see a number" reads
 * as transparency, and putting it on white makes that argument visually.
 *
 * The brand mint is unusable for text here (1.43:1 on this surface), so
 * `--accent-ink` (#0A7256, 5.53:1) carries it. See `.section-light`.
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
        className={`mb-4 w-fit rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white ${
          tier.featured ? "" : "invisible"
        }`}
        style={{ background: "var(--accent-ink)" }}
      >
        Most chosen
      </span>

      <h3 className="font-display text-lg font-bold text-[#050807]">{tier.name}</h3>
      {/* Fixed height keeps one- and two-line descriptions on the same grid. */}
      <p className="mt-1.5 min-h-[2.5rem] text-sm text-[#4A5551]">{tier.copy}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-4xl font-extrabold leading-none text-[#050807]">
          {tier.price}
        </span>
        <span className="text-xs text-[#4A5551]">{tier.unit}</span>
      </div>

      <ul className="mt-7 flex flex-1 flex-col gap-3">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-[#2B3532]"
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
                stroke="var(--accent-ink)"
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
            : "border border-[#050807]/15 text-[#050807] hover:border-[#0A7256]/50 hover:bg-[#0A7256]/5"
        }`}
        style={tier.featured ? { background: "var(--accent-ink)" } : undefined}
      >
        {tier.cta}
      </Link>
    </div>
  );
}

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="section-light scene relative px-5 py-24 sm:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1240px]">
        <div data-reveal="1" className="mx-auto max-w-2xl text-center">
          <span
            className="font-mono text-xs uppercase tracking-[0.22em]"
            style={{ color: "var(--accent-ink)" }}
          >
            Pricing
          </span>
          <h2 className="h-mid mt-4 font-display font-extrabold text-[#050807]">
            No call required to see a number.
          </h2>
          <p className="mt-5 text-base text-[#4A5551]">
            Every plan includes a first cut, two revision rounds, 4K masters and
            captions. The tier sets the crew, not the care.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <Tier key={tier.name} tier={tier} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-[#4A5551]">
          Not sure which fits?{" "}
          <Link
            href="#onboarding"
            className="font-semibold underline underline-offset-4"
            style={{ color: "var(--accent-ink)" }}
          >
            Answer four questions
          </Link>{" "}
          and see your exact number.
        </p>
      </div>
    </section>
  );
}
