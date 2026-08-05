"use client";

import { useId, useState } from "react";

/**
 * FAQ, with FAQPage structured data.
 *
 * Two jobs: it handles the objections that otherwise arrive as emails, and it
 * is the cheapest rich-result win available — these questions are close to what
 * people actually type into search.
 *
 * Each question is its own card rather than a row in a hairline list, and only
 * one is open at a time: a stack of simultaneously-open answers is how an FAQ
 * turns back into the wall of text it exists to replace. Opening animates the
 * grid row from 0fr to 1fr, which is the one way to transition to a height
 * nobody has measured yet.
 */

export const FAQS = [
  {
    q: "How fast is the first cut?",
    a: "Five working days for long-form, three for YouTube automation, and ten for documentary assembly. The date is confirmed the same day you send the brief, and it appears on screen before you submit it.",
  },
  {
    q: "What do you need from me to start?",
    a: "The footage and any reference for pacing or style. A link to a Drive, Dropbox or Frame.io folder is enough — there is no upload limit and no need to compress anything first.",
  },
  {
    q: "How many revisions are included?",
    a: "Two rounds as standard on every plan, each turned around in 34 hours. Revisions are comments on a timecode in the review portal, not notes in an email thread.",
  },
  {
    q: "Do I work with the same editor each time?",
    a: "On Weekly and Studio plans, yes — a named editor who learns your channel. Single projects are assigned to whoever fits the format best.",
  },
  {
    q: "Who owns the footage and the final cut?",
    a: "You do, entirely. We keep project files for twelve months so future edits can reuse them, and you can request the full project archive at any point.",
  },
  {
    q: "What if I publish more than my plan covers?",
    a: "Extra videos are billed at your plan's per-video rate, so you never pay a penalty for a busy month. If it happens twice we will suggest moving you up a tier instead.",
  },
  {
    q: "Can you match the style we already have?",
    a: "Yes. Send two or three videos you want to sit alongside and we build a locked template from them, so every subsequent cut is consistent without being re-briefed.",
  },
];

function Item({
  index,
  q,
  a,
  open,
  onToggle,
}: {
  index: number;
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  const id = useId();

  return (
    <li
      className={`group overflow-hidden rounded-2xl border transition-[border-color,background-color,box-shadow] duration-300 ${
        open
          ? "border-brand/30 bg-white shadow-[0_24px_60px_-40px_rgba(5,30,24,.5)]"
          : "border-ink/10 bg-white/60 hover:border-ink/25 hover:bg-white"
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center gap-4 px-5 py-5 text-left sm:gap-6 sm:px-7"
        >
          <span
            aria-hidden="true"
            className={`font-mono text-xs tabular-nums transition-colors ${
              open ? "text-brand" : "text-muted group-hover:text-body"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="flex-1 font-display text-base font-bold leading-snug tracking-[-0.01em] text-ink sm:text-lg">
            {q}
          </span>

          {/* Plus that becomes a minus — the bar that rotates is also faded out,
              so the two never sit on top of each other mid-turn. */}
          <span
            aria-hidden="true"
            className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
              open
                ? "border-brand bg-brand text-white"
                : "border-ink/15 text-body group-hover:border-brand/50 group-hover:text-brand"
            }`}
          >
            <span className="absolute h-px w-3 bg-current" />
            <span
              className={`absolute h-3 w-px bg-current transition-transform duration-300 ${
                open ? "rotate-90" : ""
              }`}
            />
          </span>
        </button>
      </h3>

      {/* 0fr → 1fr is what makes this animate to a height nobody measured. */}
      <div
        id={id}
        role="region"
        className={`grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(.16,1,.3,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl px-5 pb-6 pl-[3.25rem] leading-relaxed text-body sm:px-7 sm:pb-7 sm:pl-[4.5rem]">
            {a}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function FAQ({ items }: { items?: { q: string; a: string }[] }) {
  const list = items?.length ? items : FAQS;
  const [open, setOpen] = useState<number | null>(0);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <span
        aria-hidden="true"
        className="orb left-1/2 top-1/4 h-[460px] w-[460px] -translate-x-1/2 bg-mint/20"
      />

      <div className="shell relative">
        <div data-reveal="1" className="mx-auto max-w-2xl text-center">
          <h2 className="h-mid font-display font-extrabold text-ink">
            The things people ask before signing.
          </h2>
          <p className="mt-5 leading-relaxed text-body">
            Seven answers, no call required.
          </p>
        </div>

        <ul data-reveal="1" className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
          {list.map((item, i) => (
            <Item
              key={item.q}
              index={i}
              q={item.q}
              a={item.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </ul>

        {/* The question the list did not answer still has somewhere to go. */}
        <div
          data-reveal="1"
          className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-brand/20 bg-mint/15 px-6 py-5 text-center sm:flex-row sm:text-left"
        >
          <p className="text-sm text-body">
            <span className="font-bold text-ink">Still not covered?</span> Email us
            and you will have an answer the same day.
          </p>
          <a
            href="mailto:hello@caparison.studio"
            className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Ask us directly
          </a>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
