import { TEAM } from "@/lib/data";

/**
 * Editorial studio section.
 *
 * Was a two-column grid of three `.lit` panels. Now: an oversized stat band,
 * an asymmetric text measure, and a pull quote that breaks out of the column
 * — magazine structure rather than card structure.
 */

const STATS = [
  { value: "2021", label: "Founded in Berlin" },
  { value: "14", label: "Editors, colourists, animators" },
  { value: "1,240", label: "Videos delivered" },
  { value: "98%", label: "On-time delivery" },
];

export default function Story() {
  return (
    <section id="story" className="relative overflow-hidden py-24 md:py-32">
      <span
        aria-hidden="true"
        className="orb right-[-12%] top-[18%] h-[520px] w-[520px] bg-mint/8"
      />

      {/* Oversized stat band, edge to edge — nothing else on the page reads
          numbers at this scale. */}
      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8">
        <dl
          data-reveal="1"
          className="grid grid-cols-2 gap-y-9 border-y border-white/10 py-10 md:grid-cols-4"
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dd className="font-display text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-none tracking-[-0.04em] text-white">
                {stat.value}
              </dd>
              <dt className="mt-3 max-w-[14ch] text-xs leading-snug text-white/40 sm:text-sm">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative mx-auto mt-20 max-w-[1240px] px-5 sm:px-8">
        {/* Asymmetric: heading in the left third, body in the middle, air right. */}
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div data-reveal="1">
            <h2 className="h-mid font-display font-extrabold text-white">
              We started with one broken timeline.
            </h2>
          </div>

          <div data-reveal="1" className="max-w-xl lg:pt-14">
            <p className="text-lg leading-relaxed text-white/65">
              Caparison began in 2021, when a documentary edit came in three weeks
              late and nobody could say why. We rebuilt the process from the
              timeline out: locked templates, named editors, and a review loop a
              client could actually see into.
            </p>
            <p className="mt-5 leading-relaxed text-white/55">
              Five years on we cut for automation channels, podcasts, product teams
              and film-makers — and still the same rule: the edit serves the watch
              time, not the editor&apos;s ego.
            </p>
          </div>
        </div>

        {/* Pull quote, breaking out of the text measure entirely. */}
        <figure data-reveal="1" className="mt-20 border-l-2 border-mint pl-6 sm:pl-10">
          <blockquote className="h-quiet max-w-3xl font-display font-extrabold leading-tight text-white sm:text-3xl">
            &ldquo;An edit is a promise about someone&apos;s time. We keep it frame
            by frame.&rdquo;
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint font-mono text-xs font-bold text-black">
              JC
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold text-white">Jonas Caparison</span>
              <span className="text-xs text-white/45">Founder &amp; lead editor</span>
            </span>
          </figcaption>
        </figure>

        {/* Team as a bare list under a rule — no card. */}
        <div data-reveal="1" className="mt-20">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
            The team
          </span>
          <ul className="mt-6 divide-y divide-white/8 border-y border-white/8">
            {TEAM.map((member) => (
              <li
                key={member.name}
                className="flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.02]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-mint/25 font-mono text-[11px] font-bold text-mint">
                  {member.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-white">{member.name}</span>
                  <span className="block truncate text-sm text-white/45">
                    {member.role}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-white/25">
                  {member.reelCount} cuts
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
