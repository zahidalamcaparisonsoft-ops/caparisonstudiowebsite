import Link from "next/link";
import { PROJECTS } from "@/lib/data";

/**
 * Full-bleed reel strip.
 *
 * Breaks the 1240px container between two contained sections, so the page
 * has at least one moment of edge-to-edge motion. Doubles as a second, more
 * casual entry point into the work.
 */

const STRIP = [...PROJECTS, ...PROJECTS];

export default function ShowreelBand() {
  return (
    <section
      aria-label="Recent work"
      className="relative overflow-hidden border-y border-white/8 py-10"
    >
      <div className="flex w-max marquee-track gap-4 pr-4">
        {STRIP.map((project, i) => {
          const hue = Math.round(project.hue * 360);
          return (
            <Link
              key={`${project.slug}-${i}`}
              href={`/work/${project.slug}`}
              aria-hidden={i >= PROJECTS.length}
              tabIndex={i >= PROJECTS.length ? -1 : undefined}
              className="group relative block h-28 w-48 shrink-0 overflow-hidden rounded-lg border border-white/10 sm:h-32 sm:w-56"
            >
              <span
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                style={{
                  background: `radial-gradient(125% 110% at 25% 5%, hsl(${hue} 60% 20%) 0%, hsl(${hue} 52% 8%) 48%, #030605 100%)`,
                }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2.5">
                <span className="block truncate text-xs font-bold text-white">
                  {project.title}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-mint">
                  {project.duration}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Feather both ends so the strip runs out of the page rather than
          stopping at it. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent sm:w-40"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent sm:w-40"
      />
    </section>
  );
}
