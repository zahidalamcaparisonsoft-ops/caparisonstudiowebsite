import Milestones from "./Milestones";
import StatBand from "./StatBand";
import TeamWall from "./TeamWall";
import type { TeamMember } from "@/lib/data";

/**
 * Editorial studio section.
 *
 * Was a two-column grid of three `.lit` panels. Now: an oversized stat band,
 * an asymmetric text measure, and the year-by-year history — magazine
 * structure rather than card structure.
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
        {/* The heading column carries "We started with one" on one line; any
           narrower and "one" is left stranded on a line of its own. */}
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div data-reveal="1">
            <h2 className="h-mid font-display font-extrabold text-ink">
              We started with one
              <br />
              {/* data-text feeds the two clipped copies that do the slip. */}
              <span className="splice" data-text="broken">
                broken
              </span>{" "}
              timeline.
            </h2>
          </div>

          <div data-reveal="1" className="max-w-xl lg:pt-14">
            <p className="text-lg leading-relaxed text-body">
              Caparison began in 2014, when a documentary edit came in three weeks
              late and nobody could say why. We rebuilt the process from the
              timeline out: locked templates, named editors, and a review loop a
              client could actually see into.
            </p>
            <p className="mt-5 leading-relaxed text-body">
              Ten years on we cut for automation channels, podcasts, product teams
              and film-makers — and still the same rule: the edit serves the watch
              time, not the editor&apos;s ego.
            </p>
          </div>
        </div>

        <Milestones />

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
