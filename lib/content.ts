import { readClient } from "@/lib/supabase/server";
import {
  CATEGORY_LABEL,
  CLIENTS,
  MILESTONES,
  PROJECTS,
  TEAM,
  TESTIMONIALS,
  type CategoryId,
  type Project,
} from "@/lib/data";
import { CLIPS, type Clip } from "@/lib/clips";
import { ADDONS, CADENCES, PROJECT_TYPES } from "@/lib/quote";

/**
 * The site's content, read from Supabase.
 *
 * Every fetcher falls back to the bundled sample data if the query fails or
 * returns nothing. A database hiccup should degrade to the previous content,
 * not to an empty page — and it keeps local development working without
 * credentials.
 */

export const revalidate = 0; // admin edits should show up immediately

type Row = Record<string, unknown>;

async function rows(table: string, order = "sort_order"): Promise<Row[]> {
  try {
    const { data, error } = await readClient().from(table).select("*").order(order);
    if (error || !data?.length) return [];
    return data as Row[];
  } catch {
    return [];
  }
}

async function single(table: string): Promise<Row | null> {
  try {
    const { data, error } = await readClient().from(table).select("*").eq("id", 1).maybeSingle();
    if (error || !data) return null;
    return data as Row;
  } catch {
    return null;
  }
}

const str = (v: unknown, fallback = "") => (typeof v === "string" && v ? v : fallback);
const num = (v: unknown, fallback = 0) => (typeof v === "number" ? v : Number(v) || fallback);

/* ───────────────────────────────────────────────────────────────── singletons */

export type HeroContent = {
  eyebrow: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
  vimeoId: string;
  videoUrl: string;
  statValue: string;
  statLabel: string;
  promiseTitle: string;
  promiseBody: string;
};

export async function getHero(): Promise<HeroContent> {
  const r = await single("hero");
  return {
    eyebrow: str(r?.eyebrow, "A video editing studio for teams that publish every week"),
    headline: str(r?.headline, "Cut for retention, not applause"),
    ctaLabel: str(r?.cta_label, "Start a project"),
    ctaHref: str(r?.cta_href, "#onboarding"),
    vimeoId: str(r?.vimeo_id, "1167173477"),
    videoUrl: str(r?.video_url),
    statValue: str(r?.stat_value, "+38%"),
    statLabel: str(r?.stat_label, "Median retention lift across 1,240 videos"),
    promiseTitle: str(r?.promise_title, "Five-day first cut"),
    promiseBody: str(
      r?.promise_body,
      "Send the files and we confirm the delivery date the same day.",
    ),
  };
}

export type SiteSettings = {
  studioName: string;
  tagline: string;
  email: string;
  location: string;
  logoUrl: string;
  wordmarkUrl: string;
  socials: { label: string; href: string }[];
};

export async function getSettings(): Promise<SiteSettings> {
  const r = await single("site_settings");
  const socials = Array.isArray(r?.socials)
    ? (r.socials as { label: string; href: string }[])
    : [
        { label: "YouTube", href: "https://youtube.com/@caparisonstudio" },
        { label: "Instagram", href: "https://instagram.com/caparisonstudio" },
        { label: "LinkedIn", href: "https://linkedin.com/company/caparisonstudio" },
      ];
  return {
    studioName: str(r?.studio_name, "Caparison Studio"),
    tagline: str(r?.tagline, "A video editing studio for teams that publish every week."),
    email: str(r?.email, "hello@caparison.studio"),
    location: str(r?.location, "Cut in Berlin · Delivered worldwide"),
    logoUrl: str(r?.logo_url, "/logo-mark.png"),
    wordmarkUrl: str(r?.wordmark_url, "/logo-wordmark.png"),
    socials,
  };
}

export async function getOnboardingCopy() {
  const r = await single("onboarding");
  return {
    heading: str(r?.heading, "Four questions. Two minutes."),
    subhead: str(
      r?.subhead,
      "You'll see the price before you send it, and hear back today.",
    ),
    note: str(
      r?.note,
      "Indicative only. We confirm the final number after seeing the footage.",
    ),
  };
}

/* ────────────────────────────────────────────────────────────── collections */

export async function getTrustedBy(): Promise<string[]> {
  const r = await rows("trusted_by");
  return r.length ? r.map((x) => str(x.name)) : CLIENTS;
}

export async function getCategories() {
  const r = await rows("categories");
  if (!r.length) {
    return {
      list: [{ id: "all", label: "All work" }, ...
        // the bundled set, minus the synthetic "all"
        (await import("@/lib/data")).CATEGORIES.filter((c) => c.id !== "all")],
      labelById: CATEGORY_LABEL as Record<string, string>,
    };
  }
  return {
    list: [
      { id: "all", label: "All work" },
      ...r.map((c) => ({ id: str(c.slug), label: str(c.label) })),
    ],
    labelById: Object.fromEntries(
      r.map((c) => [str(c.slug), str(c.short_label) || str(c.label)]),
    ) as Record<string, string>,
  };
}

export async function getProcessSteps() {
  const r = await rows("process_steps");
  if (!r.length) return MILESTONES;
  return r.map((s) => ({
    step: str(s.step),
    title: str(s.title),
    copy: str(s.copy),
    when: str(s.timing),
  }));
}

export async function getTeam() {
  const r = await rows("team_members");
  if (!r.length) return TEAM;
  return r.map((m) => ({
    initials: str(m.initials),
    name: str(m.name),
    role: str(m.designation),
    reelCount: num(m.reel_count),
    photo: str(m.photo_url) || undefined,
  }));
}

export async function getPricingTiers() {
  const r = await rows("pricing_tiers");
  if (!r.length) return null; // component keeps its built-in tiers
  return r.map((t) => ({
    name: str(t.name),
    price: str(t.price),
    unit: str(t.unit),
    copy: str(t.description),
    features: Array.isArray(t.features) ? (t.features as string[]) : [],
    featured: Boolean(t.featured),
    cta: str(t.cta_label, "Start a project"),
  }));
}

export async function getFaqs() {
  const r = await rows("faqs");
  if (!r.length) return null;
  return r.map((f) => ({ q: str(f.question), a: str(f.answer) }));
}

export async function getProjectTypes() {
  const r = await rows("project_types");
  if (!r.length) return PROJECT_TYPES;
  return r.map((t) => ({
    id: str(t.slug),
    label: str(t.name),
    copy: str(t.description),
    rate: num(t.per_video_cost),
    firstCut: num(t.first_cut_days, 5),
  }));
}

export async function getCadences() {
  const r = await rows("cadences");
  if (!r.length) return CADENCES;
  return r.map((c) => ({
    id: str(c.slug),
    label: str(c.label),
    perMonth: num(c.per_month, 1),
    multiplier: num(c.multiplier, 1),
  }));
}

export async function getAddons() {
  const r = await rows("addons");
  if (!r.length) return ADDONS;
  return r.map((a) => ({
    id: str(a.slug),
    label: str(a.label),
    copy: str(a.description),
    price: num(a.price),
  }));
}

/* ─────────────────────────────────────────────────────────── videos & clips */

export type LoadedProject = Project & { thumbnail?: string; vimeoId?: string };

export async function getProjects(): Promise<LoadedProject[]> {
  const [vids, cats] = await Promise.all([rows("videos", "sort_order"), rows("categories")]);
  if (!vids.length) return PROJECTS;

  const slugById = new Map(cats.map((c) => [String(c.id), str(c.slug)]));

  return vids
    .filter((v) => v.published !== false)
    .map((v) => ({
      slug: str(v.slug),
      title: str(v.title),
      client: str(v.client),
      duration: str(v.duration),
      format: str(v.format),
      cat: (slugById.get(String(v.category_id)) || "yt") as CategoryId,
      hue: num(v.hue, 0.45),
      featured: Boolean(v.featured),
      poster: str(v.thumbnail_url) || undefined,
      thumbnail: str(v.thumbnail_url) || undefined,
      vimeoId: str(v.vimeo_id) || undefined,
      study: {
        summary: str(v.summary),
        challenge: str(v.challenge),
        approach: str(v.approach),
        results: Array.isArray(v.results)
          ? (v.results as Project["study"]["results"])
          : [],
        // Retention curves are illustrative and not editable from the panel.
        retention: PROJECTS.find((p) => p.slug === str(v.slug))?.study.retention ?? {
          before: [1, 0.7, 0.55, 0.45, 0.38, 0.33, 0.29, 0.26, 0.24, 0.22, 0.2],
          after: [1, 0.88, 0.79, 0.72, 0.66, 0.61, 0.57, 0.53, 0.5, 0.47, 0.44],
        },
      },
    }));
}

export async function getClipsBySlug(): Promise<Record<string, Clip[]>> {
  const [vids, clips] = await Promise.all([rows("videos"), rows("video_clips")]);
  if (!vids.length || !clips.length) return CLIPS;

  const slugById = new Map(vids.map((v) => [String(v.id), str(v.slug)]));
  const out: Record<string, Clip[]> = {};
  for (const c of clips) {
    const slug = slugById.get(String(c.video_id));
    if (!slug) continue;
    (out[slug] ??= []).push({
      id: String(c.id),
      title: str(c.title),
      duration: str(c.duration),
      src: str(c.video_url) || undefined,
      poster: str(c.thumbnail_url) || undefined,
    });
  }
  return Object.keys(out).length ? out : CLIPS;
}

/* ──────────────────────────────────────────────────────────── testimonials */

export async function getTestimonials() {
  const [t, vids] = await Promise.all([rows("testimonials"), rows("videos")]);
  if (!t.length) {
    return TESTIMONIALS.map((x) => ({
      ...x,
      video: undefined as string | undefined,
      poster: undefined as string | undefined,
      results: PROJECTS.find((p) => p.slug === x.projectSlug)?.study.results ?? [],
      projectHref: `/work/${x.projectSlug}`,
    }));
  }
  const byId = new Map(vids.map((v) => [String(v.id), v]));
  return t.map((x) => {
    const v = x.video_ref ? byId.get(String(x.video_ref)) : undefined;
    return {
      id: String(x.id),
      name: str(x.name),
      role: str(x.role),
      company: str(x.company),
      initials: str(x.initials),
      quote: str(x.quote),
      video: str(x.video_url) || undefined,
      poster: str(x.poster_url) || undefined,
      vimeoId: str(x.vimeo_id) || undefined,
      results: v && Array.isArray(v.results) ? (v.results as Project["study"]["results"]) : [],
      projectHref: v ? `/work/${str(v.slug)}` : undefined,
      projectSlug: v ? str(v.slug) : "",
    };
  });
}
