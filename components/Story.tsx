"use client";

import { TEAM } from "@/lib/data";
import { useLitSurface } from "@/lib/hooks";

const STATS = [
  { value: "2021", label: "Founded in Berlin" },
  { value: "14", label: "Editors, colourists, animators" },
  { value: "98%", label: "On-time delivery" },
];

export default function Story() {
  const founderRef = useLitSurface<HTMLDivElement>();
  const teamRef = useLitSurface<HTMLDivElement>();
  const missionRef = useLitSurface<HTMLDivElement>();

  return (
    <section
      id="story"
      className="scene relative overflow-hidden px-5 py-24 sm:px-8 md:py-32"
    >
      <span
        aria-hidden="true"
        className="orb right-[-10%] top-[5%] h-[520px] w-[520px] bg-mint/8"
      />

      <div className="relative mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
        <div data-reveal="1">
          <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-mint">
            <span className="h-px w-7 bg-mint" />
            Our story
          </span>
          <h2 className="mt-5 font-display text-[clamp(2rem,6vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
            We started in a spare room with one broken timeline.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/60">
            Caparison began in 2021, when a documentary edit came in three weeks late
            and nobody could say why. We rebuilt the process from the timeline out:
            locked templates, named editors, and a review loop a client could actually
            see into.
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/60">
            Five years on we cut for automation channels, podcasts, product teams and
            film-makers — 1,240 videos, and still the same rule: the edit serves the
            watch time, not the editor&apos;s ego.
          </p>

          <div
            aria-hidden="true"
            className="my-9 h-px bg-gradient-to-r from-transparent via-mint/60 to-transparent"
          />

          <dl className="grid grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-[clamp(1.4rem,4vw,2rem)] font-extrabold leading-none text-white">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-[11px] leading-snug text-white/45 sm:text-xs">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        <div data-reveal="1" className="flex flex-col gap-5">
          <div ref={founderRef} className="lit rounded-3xl border-mint/30 bg-mint/[0.06] p-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint">
              Founder
            </span>
            <p className="mt-4 font-display text-lg font-bold leading-snug text-white">
              &ldquo;An edit is a promise about someone&apos;s time. We keep it frame by
              frame.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint font-mono text-xs font-bold text-black">
                JC
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-bold text-white">Jonas Caparison</span>
                <span className="text-xs text-white/45">Founder &amp; lead editor</span>
              </span>
            </div>
          </div>

          <div ref={teamRef} className="lit rounded-3xl p-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
              The team
            </span>
            <ul className="mt-5 flex flex-col gap-4">
              {TEAM.map((member) => (
                <li key={member.name} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-mint/30 bg-mint/10 font-mono text-[11px] font-bold text-mint">
                    {member.initials}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-bold text-white">{member.name}</span>
                    <span className="truncate text-xs text-white/45">{member.role}</span>
                  </span>
                  {/* A "named editor" promise means more with a number behind it. */}
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-white/30">
                    {member.reelCount} cuts
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div ref={missionRef} className="lit rounded-3xl p-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
              Mission
            </span>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Make weekly publishing survivable for small teams — without the edit
              getting worse.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
