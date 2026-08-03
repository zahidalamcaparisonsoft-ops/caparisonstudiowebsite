/**
 * FAQ, with FAQPage structured data.
 *
 * Two jobs: it handles the objections that otherwise arrive as emails, and it
 * is the cheapest rich-result win available — these questions are close to
 * what people actually type into search.
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

export default function FAQ() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="relative px-5 py-24 sm:px-8 md:py-32">
      {/* Two-column split: heading stays put while the list scrolls past it. */}
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[.8fr_1.2fr]">
        <div data-reveal="1" className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="h-mid font-display font-extrabold text-white">
            The things people ask before signing.
          </h2>
          <p className="mt-5 leading-relaxed text-white/55">
            If yours isn&apos;t here,{" "}
            <a
              href="mailto:hello@caparison.studio"
              className="font-semibold text-mint underline underline-offset-4 hover:text-mint-bright"
            >
              email us
            </a>{" "}
            — we answer the same day.
          </p>
        </div>

        <div data-reveal="1" className="divide-y divide-white/10 border-y border-white/10">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                <span className="text-base font-bold text-white transition-colors group-hover:text-mint sm:text-lg">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className="relative mt-2 h-3 w-3 shrink-0"
                >
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-mint" />
                  <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-mint transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
                </span>
              </summary>
              <p className="mt-3 max-w-2xl pr-9 leading-relaxed text-white/55">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
