import StatBand from "./StatBand";
import TeamWall from "./TeamWall";
import type { TeamMember } from "@/lib/data";

/**
 * Editorial studio section.
 *
 * Was a two-column grid of three `.lit` panels. Now: an oversized stat band,
 * an asymmetric text measure, and a pull quote that breaks out of the column
 * — magazine structure rather than card structure.
 */

export default function Story({ team }: { team?: TeamMember[] }) {
  return (
    <section id="story" className="section-tint relative overflow-hidden py-24 md:py-32">
      <span
        aria-hidden="true"
        className="orb right-[-12%] top-[18%] h-[520px] w-[520px] bg-mint/20"
      />

      {/* Oversized stat band, edge to edge — nothing else on the page reads
          numbers at this scale. */}
      <div className="shell relative">
        <StatBand />
      </div>

      <div className="shell relative mt-20">
        {/* Asymmetric: heading in the left third, body in the middle, air right. */}
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div data-reveal="1">
            <h2 className="h-mid font-display font-extrabold text-ink">
              We started with one broken timeline.
            </h2>
          </div>

          <div data-reveal="1" className="max-w-xl lg:pt-14">
            <p className="text-lg leading-relaxed text-body">
              Caparison began in 2021, when a documentary edit came in three weeks
              late and nobody could say why. We rebuilt the process from the
              timeline out: locked templates, named editors, and a review loop a
              client could actually see into.
            </p>
            <p className="mt-5 leading-relaxed text-body">
              Five years on we cut for automation channels, podcasts, product teams
              and film-makers — and still the same rule: the edit serves the watch
              time, not the editor&apos;s ego.
            </p>
          </div>
        </div>

        {/* Pull quote, breaking out of the text measure entirely. */}
        <figure data-reveal="1" className="mt-20 border-l-2 border-brand pl-6 sm:pl-10">
          <blockquote className="h-quiet max-w-3xl font-display font-extrabold leading-tight text-ink sm:text-3xl">
            &ldquo;An edit is a promise about someone&apos;s time. We keep it frame
            by frame.&rdquo;
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint font-mono text-xs font-bold text-ink">
              JC
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold text-ink">Jonas Caparison</span>
              <span className="text-xs text-muted">Founder &amp; lead editor</span>
            </span>
          </figcaption>
        </figure>

        <h3 className="mt-20 text-center font-display text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-3xl">
          The team
        </h3>
      </div>

      {/* The wall sits OUTSIDE the 1240px container so it runs to the screen
          edges — inside it, the container's edge read as a hard black border
          cutting the cards off mid-scroll. */}
      <div data-reveal="1">
        <TeamWall members={team} />
      </div>
    </section>
  );
}
