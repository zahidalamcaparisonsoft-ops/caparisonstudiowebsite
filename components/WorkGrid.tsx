"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  PROJECTS,
  type CategoryId,
  type Project,
} from "@/lib/data";
import { useLitSurface } from "@/lib/hooks";

/** Placeholder frame, tinted per project so no two cards look alike. */
function Thumb({ project }: { project: Project }) {
  const hue = Math.round(project.hue * 360);
  return (
    <span className="absolute inset-0 overflow-hidden">
      {project.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.poster}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <>
          <span
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]"
            style={{
              background: `radial-gradient(125% 110% at 22% 8%, hsl(${hue} 62% 22%) 0%, hsl(${hue} 55% 9%) 46%, #030605 100%)`,
            }}
          />
          <span
            className="absolute inset-0 opacity-70"
            style={{
              background: `linear-gradient(112deg, hsla(${hue}, 80%, 62%, .18) 0%, transparent 46%)`,
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]"
          />
        </>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
    </span>
  );
}

function Card({ project }: { project: Project }) {
  const ref = useLitSurface<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      href={`/work/${project.slug}`}
      className="lit group block overflow-hidden rounded-2xl"
    >
      <span className="relative block aspect-video w-full overflow-hidden">
        <Thumb project={project} />

        <span className="absolute left-3 top-3 z-10 rounded-md border border-mint/35 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-mint backdrop-blur">
          {CATEGORY_LABEL[project.cat]}
        </span>

        <span className="absolute bottom-3 right-3 z-10 rounded-md border border-white/15 bg-black/70 px-2 py-1 font-mono text-[10px] text-white/80 backdrop-blur">
          {project.duration}
        </span>

        <span className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-mint/50 bg-black/45 backdrop-blur transition-all duration-500 group-hover:scale-110 group-hover:border-mint group-hover:bg-mint/20">
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true">
            <path d="M15 9L1 17.66V.34L15 9z" fill="#1BEDAC" />
          </svg>
        </span>
      </span>

      <span className="relative z-10 block px-4 py-4">
        <span className="block font-display text-base font-bold text-white">
          {project.title}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-white/45">
          {project.client}
          <span className="h-1 w-1 rounded-full bg-white/25" />
          {project.format}
        </span>
        {/* The number is the reason to click. */}
        <span className="mt-3 flex items-center gap-2 text-xs font-semibold text-mint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {project.study.results[0].delta} {project.study.results[0].label.toLowerCase()}
          <span aria-hidden="true">→</span>
        </span>
      </span>
    </Link>
  );
}

export default function WorkGrid() {
  const [filter, setFilter] = useState<CategoryId | "all">("all");

  const shown = useMemo(
    () => (filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter)),
    [filter],
  );

  return (
    <section id="work" className="scene relative px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <div
          data-reveal="1"
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <span className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-mint">
              <span className="h-px w-7 bg-mint" />
              Selected work
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,6vw,3.4rem)] font-extrabold leading-none tracking-[-0.03em] text-white">
              Recent cuts.
            </h2>
          </div>
          <span className="font-mono text-xs text-white/40">
            {shown.length} of {PROJECTS.length} projects
          </span>
        </div>

        {/* Filters — one row above the grid. */}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = filter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id as CategoryId | "all")}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "border-mint/60 bg-mint/15 text-mint"
                    : "border-white/12 bg-white/[0.03] text-white/60 hover:border-mint/30 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((project) => (
            <div key={project.slug} data-reveal="1">
              <Card project={project} />
            </div>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="mt-12 text-center text-white/50">
            Nothing in this category yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
