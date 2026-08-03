"use client";

import Image from "next/image";
import Link from "next/link";
import { TESTIMONIALS } from "@/lib/data";
import { useLitSurface } from "@/lib/hooks";

function Quote({ item }: { item: (typeof TESTIMONIALS)[number] }) {
  const ref = useLitSurface<HTMLElement>();

  return (
    <figure ref={ref} data-reveal="1" className="lit flex flex-col justify-between gap-6 rounded-3xl p-7">
      <div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-mint/30 bg-mint/10 text-mint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M9 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1a2 2 0 0 1-2 2H4v2h1a4 4 0 0 0 4-4V7zm11 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1a2 2 0 0 1-2 2h-1v2h1a4 4 0 0 0 4-4V7z" />
          </svg>
        </span>
        <blockquote className="mt-5 font-display text-base font-bold leading-snug text-white">
          &ldquo;{item.quote}&rdquo;
        </blockquote>
      </div>
      <figcaption className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-mint/30 bg-mint/10 font-mono text-[11px] font-bold text-mint">
          {item.initials}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-bold text-white">{item.name}</span>
          <span className="truncate text-xs text-white/45">{item.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scene relative overflow-hidden px-5 py-24 sm:px-8 md:py-32"
    >
      <span
        aria-hidden="true"
        className="orb right-[-8%] top-[10%] h-[460px] w-[460px] bg-mint/8"
      />

      <div className="relative mx-auto max-w-[1240px]">
        <div data-reveal="1" className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-mint">
            Testimonials
          </span>
          <h2 className="mt-4 font-display text-[clamp(2rem,6vw,3.4rem)] font-extrabold leading-none tracking-[-0.03em] text-white">
            What the teams say.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <Quote key={item.name} item={item} />
          ))}
        </div>

        {/* Closing CTA */}
        <div
          data-reveal="1"
          className="relative mt-20 overflow-hidden rounded-[2.5rem] border border-mint/25 px-6 py-14 text-center sm:px-10 sm:py-16"
          style={{
            background:
              "radial-gradient(120% 140% at 50% 0%, rgba(27,237,172,.16), rgba(5,8,7,.6) 58%, rgba(0,0,0,.92) 100%)",
          }}
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={330}
            height={345}
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 font-display text-[clamp(1.7rem,5vw,2.8rem)] font-extrabold leading-tight tracking-[-0.02em] text-white">
            Send us your next upload.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-white/60">
            Four questions, two minutes, and a price on screen before you send it.
          </p>
          <Link
            href="#onboarding"
            className="mt-9 inline-block rounded-full bg-mint px-8 py-4 text-base font-bold text-black shadow-[0_0_36px_-6px_rgba(27,237,172,.7)] transition-all hover:-translate-y-0.5 hover:bg-mint-bright"
          >
            Start onboarding →
          </Link>
        </div>
      </div>
    </section>
  );
}
