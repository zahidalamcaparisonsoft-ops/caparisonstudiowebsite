"use client";

import { TEAM } from "@/lib/data";

/**
 * The team as a curved wall of portraits.
 *
 * Cards sit on a concave arc — the outer ones turn inward toward the viewer, so
 * the row wraps around rather than lying flat. One shared perspective on the
 * container, so every card resolves to the same vanishing point.
 *
 * Portraits are placeholders: a duotone field with the person's initials. Give a
 * member a `photo` in `lib/data.ts` and it is used instead, with no other
 * change.
 */

const STEP_DEG = 15;

export default function TeamWall() {
  const mid = (TEAM.length - 1) / 2;

  return (
    <div
      className="mt-8 flex justify-center gap-3 overflow-hidden px-1 sm:gap-5"
      style={{ perspective: "1100px", perspectiveOrigin: "50% 45%" }}
    >
      {TEAM.map((member, i) => {
        const offset = i - mid;
        const hue = 150 + i * 26;
        return (
          <figure
            key={member.name}
            className="m-0 w-[40%] max-w-[230px] shrink-0 sm:w-auto sm:flex-1"
            style={{
              transform: `rotateY(${(-offset * STEP_DEG).toFixed(1)}deg) translateZ(${(-Math.abs(offset) * 34).toFixed(0)}px)`,
              transformStyle: "preserve-3d",
            }}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_40px_80px_-40px_rgba(0,0,0,.95)]">
              {member.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(120% 100% at 30% 12%, hsl(${hue} 42% 26%) 0%, hsl(${hue} 38% 12%) 52%, #050a08 100%)`,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center font-display text-[clamp(2.2rem,7vw,3.6rem)] font-extrabold tracking-[-0.04em] text-white/20"
                  >
                    {member.initials}
                  </span>
                </>
              )}

              {/* Name plate, on the picture — matches the card, not the page. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <span className="block truncate font-display text-sm font-bold leading-tight text-white sm:text-base">
                  {member.name}
                </span>
                {/* Wraps rather than truncating — "Shorts and automation
                    pipeline" does not fit a card width on one line. */}
                <span className="mt-1 block font-mono text-[10px] uppercase leading-snug tracking-[0.12em] text-mint">
                  {member.role.split("—")[0].trim()}
                </span>
                <span className="mt-1.5 block font-mono text-[10px] text-white/35">
                  {member.reelCount} cuts
                </span>
              </figcaption>
            </div>
          </figure>
        );
      })}
    </div>
  );
}
