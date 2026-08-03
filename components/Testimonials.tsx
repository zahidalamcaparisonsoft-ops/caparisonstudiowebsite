import { TESTIMONIALS } from "@/lib/data";

/**
 * Editorial testimonials — no cards.
 *
 * Was three identical `.lit` panels, which is the same shape as Pricing,
 * Story and the work grid. Here the lead quote is set large as running type
 * on the page, with the other two as quiet entries beneath a rule. Type is
 * the only device.
 */
export default function Testimonials() {
  const [lead, ...rest] = TESTIMONIALS;

  return (
    <section id="testimonials" className="relative px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-white/30">
          Testimonials
        </span>

        {/* Lead quote, set as the largest type in the section. */}
        <figure data-reveal="1" className="mt-10 max-w-4xl">
          <blockquote className="h-loud font-display font-extrabold text-white">
            <span className="text-mint">&ldquo;</span>
            {lead.quote}
            <span className="text-mint">&rdquo;</span>
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-mint/30 bg-mint/10 font-mono text-xs font-bold text-mint">
              {lead.initials}
            </span>
            <span className="flex flex-col">
              <span className="font-bold text-white">{lead.name}</span>
              <span className="text-sm text-white/45">{lead.role}</span>
            </span>
          </figcaption>
        </figure>

        {/* The remaining two, quieter, below a hairline. */}
        <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 md:grid-cols-2 md:gap-16">
          {rest.map((item) => (
            <figure key={item.name} data-reveal="1">
              <blockquote className="text-lg leading-snug text-white/80 sm:text-xl">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[10px] font-bold text-white/60">
                  {item.initials}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-bold text-white">{item.name}</span>
                  <span className="truncate text-xs text-white/40">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
