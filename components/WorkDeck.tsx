"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  PROJECTS,
  categorySlug,
  type CategoryId,
} from "@/lib/data";
import { clipsFor, type Clip } from "@/lib/clips";
import type { LoadedProject } from "@/lib/content";
import ProjectStage from "./ProjectStage";

/**
 * The work section as a wall that plays.
 *
 * Every film is laid out at its own shape, in masonry columns of a fixed
 * width: a vertical cut is a tall tile, a widescreen one is a short wide one.
 * Nothing is cropped and nothing is greyed out, so the format mix is legible
 * from the shape of the wall alone before a word is read.
 *
 * Hovering a tile plays the actual film in it, muted and looping. That is the
 * whole argument of the section: an editing studio should be showing moving
 * pictures, not stills of them. Only the hovered tile mounts a player, so the
 * page carries one embed at a time no matter how many films are on the wall.
 *
 * Clicking a tile opens it on the stage, with the rest of the filter as a
 * strip underneath.
 */

/** Gutter between columns, and between the tiles stacked inside one. */
const GAP = 10;
/** How many tiles the wall opens with before it offers the rest. */
const LIMIT = 12;
/* Guards against a stray oEmbed reading — an absurd ratio would otherwise run
   a column off the page or squash a tile to a line. Neither bound clips a real
   9:16 (0.5625) or 16:9 (1.78) film. */
const MIN_ASPECT = 0.5;
const MAX_ASPECT = 2.4;
/* Widest a single column is allowed to get. A filter with one or two films in
   it has fewer columns than the wall, and without this the leftover width goes
   into the surviving tiles — a one-film filter would open at 1160px wide,
   several times the size the same film is everywhere else. */
const MAX_COLUMN = 560;
/** Pause before a hover mounts a player, so sweeping across the wall is free. */
const HOVER_MS = 260;
/** Assumed wall width for the first paint, corrected on the first frame. */
const ASSUMED_WIDTH = 1160;

/* Background mode: no controls, no branding, muted and looping. `autopause=0`
   stops Vimeo halting one tile because another embed on the page started. */
const VIMEO_PREVIEW = [
  "background=1",
  "autoplay=1",
  "loop=1",
  "muted=1",
  "autopause=0",
  "dnt=1",
].join("&");

/* ---------------------------------------------------------------- poster art */

function PosterArt({ project }: { project: LoadedProject }) {
  const hue = Math.round(project.hue * 360);

  if (project.poster) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={project.poster}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <>
      <span
        className="absolute inset-0"
        style={{
          background: `radial-gradient(125% 110% at 26% 6%, hsl(${hue} 62% 24%) 0%, hsl(${hue} 55% 10%) 46%, #030605 100%)`,
        }}
      />
      <span
        className="absolute inset-0 opacity-70"
        style={{
          background: `linear-gradient(112deg, hsla(${hue}, 80%, 62%, .20) 0%, transparent 46%)`,
        }}
      />

      {/* Without art, a gradient is a blank slab. The client's name set large
          gives the tile something to read at a glance. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-2 top-[18%] block break-words text-center font-display text-[1.7rem] font-extrabold uppercase leading-[0.88] tracking-[-0.04em] text-white/25"
      >
        {project.client}
      </span>

      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]"
      />
    </>
  );
}

/* ------------------------------------------------------------------- layout */

type Tile = { project: LoadedProject; aspect: number };
type Column = { items: Tile[]; height: number };

/**
 * Masonry: fixed column width, whatever height the film asks for.
 *
 * Justified rows were the other way round — a shared row height, which every
 * tile paid for in width. With 16:9 and 9:16 in the same wall that fell almost
 * entirely on the vertical cuts: they came out 156px wide on a desktop and
 * 78px on a phone, too narrow to read a title in. Fixing the width instead
 * lets a Reel be a Reel and a widescreen cut be widescreen.
 *
 * Tiles fill left to right while the columns are empty, so the top of the wall
 * keeps the order the panel set, and go to the shortest column after that, so
 * the bottom does not end in a cliff.
 */
function pack(tiles: Tile[], columns: number, columnWidth: number): Column[] {
  const cols: Column[] = Array.from({ length: columns }, () => ({
    items: [],
    height: 0,
  }));

  for (const tile of tiles) {
    let shortest = cols[0];
    for (const col of cols) if (col.height < shortest.height) shortest = col;
    shortest.items.push(tile);
    shortest.height += columnWidth / tile.aspect + GAP;
  }

  return cols;
}

/**
 * The most columns a given width can carry.
 *
 * An upper bound only — a filter with fewer films than this gets one column
 * per film, so the wall never ends in an empty column.
 *
 * Three at the top rather than four: at four the 16:9 cuts — which are most of
 * the work — drop to 282px wide, narrower than they were under justified rows.
 * At three they land on 380px, exactly where they were, so the majority of the
 * wall loses nothing to the change.
 *
 * One on a phone, not two. Two columns on a 375px screen leaves a widescreen
 * tile 91px tall, and the two-line title and the client line do not fit in it.
 */
function columnCount(width: number) {
  if (width < 560) return 1;
  if (width < 1000) return 2;
  return 3;
}

/* --------------------------------------------------------------------- wall */

export default function WorkDeck({
  projects,
  categories,
  clips,
  categoryLabels,
  initialCategory = "all",
}: {
  projects?: LoadedProject[];
  categories?: { id: string; label: string }[];
  clips?: Record<string, Clip[]>;
  categoryLabels?: Record<string, string>;
  /** What `?work=` asked for, already resolved against the live category list. */
  initialCategory?: string;
}) {
  /* The bundled samples satisfy `LoadedProject` too — its additions are the
     optional ones a database row carries and a sample does not. */
  const all: LoadedProject[] = projects?.length ? projects : PROJECTS;
  const labels = categoryLabels ?? (CATEGORY_LABEL as Record<string, string>);

  /* Only the categories that actually have something filed under them. A chip
     leading to an empty wall is worse than no chip, and counting the films
     rather than naming the empty ones means the chip comes back by itself the
     moment the first project lands in that category. */
  const cats = useMemo(() => {
    const list: { id: string; label: string }[] = categories?.length
      ? categories
      : CATEGORIES;
    const stocked = new Set<string>(all.map((p) => p.cat));
    return list.filter((c) => c.id === "all" || stocked.has(c.id));
  }, [categories, all]);

  /* Seeded from the URL, not set by an effect after mount: the server has
     already resolved it, so the first paint is the wall the link asked for
     rather than the whole wall re-sorting itself once JS arrives. */
  const [filter, setFilter] = useState<CategoryId | "all">(
    initialCategory as CategoryId | "all",
  );
  const shown = useMemo(
    () => (filter === "all" ? all : all.filter((p) => p.cat === filter)),
    [filter, all],
  );

  /* The chip that is currently selected can stop existing — the last film
     under it is unpublished while the panel is open — which would leave the
     wall empty with nothing lit to explain why. */
  useEffect(() => {
    if (filter !== "all" && !cats.some((c) => c.id === filter))
      setFilter("all");
  }, [cats, filter]);

  /* Picking a chip writes the choice into the address bar, so any view on the
     wall is a link that can be copied out of it — which is the whole point of
     reading the parameter in the first place.

     `history.replaceState`, not the router: this is the same page with a
     different chip lit, so it should not push an entry that turns Back into a
     walk through every filter the visitor tried, and it must not re-run the
     server render, which would refetch the page's content to change nothing.

     The label, not the id, because the id is what the database happens to
     call it — `yt` is not a link anyone would paste into an email. */
  const choose = useCallback(
    (id: CategoryId | "all") => {
      setFilter(id);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      const label = cats.find((c) => c.id === id)?.label;
      if (id === "all" || !label) url.searchParams.delete("work");
      else url.searchParams.set("work", categorySlug(label));
      window.history.replaceState(null, "", url);
    },
    [cats],
  );

  /* A link that names a category should land on the wall whether or not
     whoever pasted it kept the #work on the end — most people will not. Runs
     once, and only for a link that asked for a category and carried no anchor
     of its own to honour. */
  const landed = useRef(false);
  useEffect(() => {
    if (landed.current) return;
    landed.current = true;
    if (initialCategory === "all" || window.location.hash) return;
    document
      .getElementById("work")
      ?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [initialCategory]);

  /* Once a visitor has asked for the whole wall, handing them a short one
     again on the next filter is a step backwards — so this stays on. */
  const [expanded, setExpanded] = useState(false);

  const [openSlug, setOpenSlug] = useState<string | null>(null);
  /* Opening a project from the wall shows its still and waits to be pressed;
     arriving from the stage's own strip keeps playing, because the click that
     got you there is the gesture that lets the next film start with sound. */
  const [startLive, setStartLive] = useState(false);
  const [entered, setEntered] = useState(false);

  const open = openSlug
    ? (shown.find((p) => p.slug === openSlug) ?? null)
    : null;
  const openClips = open ? (clips?.[open.slug] ?? clipsFor(open.slug)) : [];

  /* The filter's own name, so the stage's strip can say what it is showing.
     `cats` carries the "all" entry too, so this covers the unfiltered wall. */
  const filterLabel = cats.find((c) => c.id === filter)?.label ?? "All work";

  /* ── measuring ──
     The wall is laid out against a real column width rather than a media
     query, because the packer needs the number, not a breakpoint. Kept
     mounted while a project is open — `hidden` takes it out of flow — so the
     observer survives and the wall is already correct when it comes back. */
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      // Hiding the wall reports zero. Keeping the last real width means it
      // does not have to re-solve itself on the way back.
      const w = entry.contentRect.width;
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const visible = expanded ? shown : shown.slice(0, LIMIT);
  const rest = shown.length - visible.length;

  /* Never more columns than there are films to put in them: an empty third
     column at the end of a two-film filter reads as a page that failed to
     load rather than as a wall with two things on it. The width each one
     then gets is capped, and whatever is left over is split either side, so
     a short filter comes out centred at a sane size instead of stretched. */
  const wallWidth = width || ASSUMED_WIDTH;
  const columns = Math.max(1, Math.min(columnCount(wallWidth), visible.length));
  const columnWidth = Math.min(
    MAX_COLUMN,
    // Floored so the columns and their gutters can never total more than the
    // wall and wrap the last one onto a line of its own.
    Math.floor((wallWidth - GAP * (columns - 1)) / columns),
  );

  /* Packed over the visible tiles rather than the whole filter: the columns
     have to re-balance around whatever is actually on the wall, or the fold
     would leave one column standing well short of the others. */
  const cols = useMemo(() => {
    const tiles: Tile[] = visible.map((project) => ({
      project,
      aspect: Math.min(
        MAX_ASPECT,
        Math.max(
          MIN_ASPECT,
          project.aspect && project.aspect > 0 ? project.aspect : 16 / 9,
        ),
      ),
    }));
    return pack(tiles, columns, columnWidth);
  }, [visible, columns, columnWidth]);

  /* ── hover preview ──
     One player, on the tile under the pointer. Not offered to touch, where
     there is no hover to end it and the film would be a surprise download,
     nor to anyone who has asked for less motion. */
  const [live, setLive] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canPreview = useRef(false);

  useEffect(() => {
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      canPreview.current = hover.matches && !still.matches;
      if (!canPreview.current) setLive(null);
    };
    sync();
    hover.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      hover.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  // The new tile's player has to load before it is faded up over the poster.
  useEffect(() => setReady(false), [live]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const enter = useCallback((slug: string, hasFilm: boolean) => {
    if (!canPreview.current || !hasFilm) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLive(slug), HOVER_MS);
  }, []);

  const leave = useCallback((slug: string) => {
    if (timer.current) clearTimeout(timer.current);
    setLive((s) => (s === slug ? null : s));
  }, []);

  /* Nothing should still be playing behind the stage, or after the filter has
     taken that tile off the wall. */
  useEffect(() => {
    if (openSlug) setLive(null);
  }, [openSlug]);

  useEffect(() => {
    setLive(null);
    setOpenSlug(null);
  }, [filter]);

  /* Switching from inside the stage, without closing it. */
  const pickSibling = useCallback((slug: string) => {
    setStartLive(true);
    setOpenSlug(slug);
  }, []);

  // Play the flip-in on the frame after the stage mounts.
  useEffect(() => {
    if (!openSlug) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [openSlug]);

  useEffect(() => {
    if (!openSlug) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenSlug(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSlug]);

  /* The size of the body of work, which is the section's actual claim and was
     previously readable only as a slide counter. */
  const tally = useMemo(() => {
    const clients = new Set(shown.map((p) => p.client).filter(Boolean));
    const formats = new Set(shown.map((p) => p.cat));
    return {
      films: shown.length,
      clients: clients.size,
      formats: formats.size,
    };
  }, [shown]);

  const figure = (n: number, one: string, many: string) => (
    <span className="font-semibold text-ink">
      {n} {n === 1 ? one : many}
    </span>
  );

  return (
    <section id="work" className="relative py-24 md:py-32">
      <div className="shell">
        <div data-reveal="1" className="text-center">
          <h2 className="h-mid font-display font-extrabold text-ink">
            Recent cuts.
          </h2>
          <p className="mt-3 text-sm text-body">
            {figure(tally.films, "film", "films")} for{" "}
            {figure(tally.clients, "client", "clients")} across{" "}
            {figure(tally.formats, "format", "formats")}.{" "}
            <span className="text-muted">Hover any tile to watch it play.</span>
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {cats.map((cat) => {
            const on = filter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => choose(cat.id as CategoryId | "all")}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  on
                    ? "border-brand/50 bg-mint/25 text-brand"
                    : "border-ink/12 bg-white text-body hover:border-brand/40 hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── The wall ── */}
        <div ref={wrap} hidden={Boolean(openSlug)} className="mt-10">
          <div className="flex items-start justify-center" style={{ gap: GAP }}>
            {cols.map((col, ci) => (
              <div
                key={ci}
                className="flex shrink-0 flex-col"
                style={{ gap: GAP, width: columnWidth }}
              >
                {col.items.map(({ project, aspect }) => {
                  const playing = live === project.slug;
                  const delta = project.study.results[0]?.delta;

                  /* Vimeo's background player is always 16:9, so on anything
                     else it has to be blown up past the tile and centred, or a
                     vertical film would sit letterboxed inside its own tile. */
                  const wide = aspect >= 16 / 9;
                  const filmWidth = wide
                    ? "100%"
                    : `${(16 / 9 / aspect) * 100}%`;
                  const filmHeight = wide
                    ? `${((aspect * 9) / 16) * 100}%`
                    : "100%";

                  return (
                    <button
                      key={project.slug}
                      type="button"
                      onClick={() => {
                        setStartLive(false);
                        setOpenSlug(project.slug);
                      }}
                      onPointerEnter={() =>
                        enter(project.slug, Boolean(project.vimeoId))
                      }
                      onPointerLeave={() => leave(project.slug)}
                      onFocus={() =>
                        enter(project.slug, Boolean(project.vimeoId))
                      }
                      onBlur={() => leave(project.slug)}
                      aria-label={`Open ${project.title}`}
                      className={`on-dark group relative shrink-0 overflow-hidden rounded-xl bg-black text-left transition-[transform,box-shadow] duration-500 [transition-timing-function:cubic-bezier(.22,1,.28,1)] ${
                        playing
                          ? "z-20 scale-[1.035] shadow-[0_28px_60px_-24px_rgba(5,30,24,.65)]"
                          : "z-0 shadow-[0_10px_30px_-18px_rgba(5,30,24,.5)]"
                      }`}
                      /* The tile takes the column's width from the flex track
                         and its height from the film, so a rounding error in the
                         measured width cannot leave a column misaligned. */
                      style={{ aspectRatio: String(aspect) }}
                    >
                      <PosterArt project={project} />

                      {playing && project.vimeoId ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 overflow-hidden transition-opacity duration-500"
                          style={{ opacity: ready ? 1 : 0 }}
                        >
                          <iframe
                            src={`https://player.vimeo.com/video/${project.vimeoId}?${VIMEO_PREVIEW}`}
                            title=""
                            tabIndex={-1}
                            aria-hidden="true"
                            allow="autoplay; picture-in-picture"
                            onLoad={() => setReady(true)}
                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
                            style={{ width: filmWidth, height: filmHeight }}
                          />
                        </span>
                      ) : null}

                      {/* One scrim, sized to the caption rather than the whole
                        tile, so the picture stays the brightest thing on it. */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/45 to-transparent"
                      />
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 rounded-xl border transition-colors duration-300 ${
                          playing ? "border-mint/70" : "border-white/10"
                        }`}
                      />

                      {delta ? (
                        <span className="absolute left-2 top-2 rounded-md bg-mint px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                          {delta}
                        </span>
                      ) : null}
                      <span className="absolute right-2 top-2 rounded-md border border-white/20 bg-black/65 px-1.5 py-0.5 font-mono text-[9px] tracking-normal text-white/85 backdrop-blur">
                        {labels[project.cat] ?? project.cat}
                      </span>

                      <span className="absolute inset-x-2.5 bottom-2.5">
                        {/* Wraps rather than truncates: a narrow vertical tile
                          has no room for a title on one line, and half a title
                          tells you nothing. */}
                        <span className="line-clamp-2 text-[13px] font-bold leading-tight text-white">
                          {project.title}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-white/60">
                          <span className="truncate">{project.client}</span>
                          {project.duration ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="shrink-0">
                                {project.duration}
                              </span>
                            </>
                          ) : null}
                        </span>
                      </span>

                      {/* The affordance. It gets out of the way once the tile is
                        already playing — the motion is the better invitation. */}
                      <span
                        aria-hidden="true"
                        className={`absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/40 backdrop-blur transition-all duration-300 ${
                          playing
                            ? "scale-90 opacity-0"
                            : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                        }`}
                      >
                        <svg
                          width="12"
                          height="14"
                          viewBox="0 0 16 18"
                          fill="none"
                        >
                          <path d="M15 9L1 17.66V.34L15 9z" fill="#1BEDAC" />
                        </svg>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {rest > 0 ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand/50 hover:text-brand"
              >
                {expanded ? "Show fewer" : `Show all ${shown.length} films`}
              </button>
            </div>
          ) : null}

          {!shown.length ? (
            <p className="py-16 text-center text-sm text-muted">
              Nothing under this filter yet.
            </p>
          ) : null}
        </div>

        {/* ── Stage: the tile opened ── */}
        {open ? (
          <div
            className="on-dark scene relative z-40 mt-10 origin-top overflow-hidden rounded-3xl"
            style={{
              transform: entered
                ? "rotateY(0deg) scale(1)"
                : "rotateY(-78deg) scale(.82)",
              opacity: entered ? 1 : 0,
              transition:
                "transform 700ms cubic-bezier(.16,1,.3,1), opacity 500ms ease",
            }}
          >
            <ProjectStage
              clips={openClips}
              vimeoId={open.vimeoId}
              poster={open.poster}
              title={open.title}
              hue={open.hue}
              siblings={shown}
              currentSlug={open.slug}
              categoryLabel={filterLabel}
              onPick={pickSibling}
              startLive={startLive}
              aspect={open.aspect}
              onClose={() => setOpenSlug(null)}
              header={
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* `format` often repeats the category verbatim, which reads
                        as a duplicate chip — show it only when it adds something. */}
                    {[
                      labels[open.cat] ?? open.cat,
                      ...(open.format.toLowerCase() ===
                      (labels[open.cat] ?? open.cat).toLowerCase()
                        ? []
                        : [open.format]),
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-md border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] tracking-normal text-white/85 backdrop-blur"
                      >
                        {chip}
                      </span>
                    ))}
                    {open.study.results[0] ? (
                      <span className="rounded bg-mint px-2 py-1 font-mono text-[10px] font-bold text-ink">
                        {open.study.results[0].delta}{" "}
                        {open.study.results[0].label.toLowerCase()}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2.5 font-display text-[clamp(1.3rem,3vw,2.1rem)] font-extrabold leading-none tracking-[-0.03em] text-white">
                    {open.title}
                  </h3>
                  <Link
                    href={`/work/${open.slug}`}
                    className="pointer-events-auto mt-2 inline-block text-xs font-semibold text-mint underline underline-offset-4 hover:text-mint-bright"
                  >
                    Read the case study
                  </Link>
                </>
              }
            />
          </div>
        ) : null}

        <p className="mt-6 text-center font-mono text-[11px] text-muted">
          {openSlug
            ? "Pick another video below · esc to go back"
            : "Click any tile to open it"}
        </p>
      </div>
    </section>
  );
}
