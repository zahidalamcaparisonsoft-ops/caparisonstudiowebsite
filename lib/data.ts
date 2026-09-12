/**
 * All site content lives here.
 *
 * PLACEHOLDER NOTICE: clients, team, quotes and metrics below are from the
 * original design mock and are NOT real. Replace before launch.
 *
 * To swap in real footage, set `reel` (and optionally `poster`) on a project.
 * Any project with a `reel` renders real video everywhere it appears — in the
 * WebGL hero wall, the work grid, and the case-study page. Projects without one
 * fall back to a procedural shader that reads as footage, so the site looks
 * finished while you gather assets. No other code needs to change.
 */

export type CategoryId = "yt" | "saas" | "doc" | "pod" | "vlog";

export const CATEGORIES: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "All work" },
  { id: "yt", label: "YouTube automation" },
  { id: "saas", label: "SaaS animation" },
  { id: "doc", label: "Documentary" },
  { id: "pod", label: "Podcast editing" },
  // The original design had a `vlog` project but no `vlog` filter, which made
  // that project unreachable. Added.
  { id: "vlog", label: "Vlog" },
];

/**
 * Sharing a filtered wall.
 *
 * A link to one category is a sales asset — it goes in an email to a client
 * who wants to see the podcast work and nothing else — so the address has to
 * survive being read by a person. `?work=yt` does not; `?work=youtube-automation`
 * does, and a slug someone typed in the panel as `VSL` should not decide
 * whether the link works.
 *
 * So the parameter is matched loosely: against the category's slug and against
 * its label, both reduced to the same lowercase, dash-joined form. Renaming a
 * category's label therefore keeps its old links working through the slug, and
 * a slug tidied later keeps them working through the label.
 */
export function categorySlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The category a shared link is asking for.
 *
 * Falls back to the whole wall rather than to an empty one: a link naming a
 * category that has since been renamed, emptied or deleted should still land
 * the reader on the work, not on a blank grid explaining that it is blank.
 */
export function resolveCategoryParam(
  param: string | undefined,
  list: { id: string; label: string }[],
) {
  if (!param) return "all";
  const want = categorySlug(param);
  if (!want || want === "all") return "all";
  const hit = list.find(
    (c) => categorySlug(c.id) === want || categorySlug(c.label) === want,
  );
  return hit ? hit.id : "all";
}

/**
 * The film a shared link is asking for.
 *
 * The companion to `resolveCategoryParam`, and resolved the same way and for
 * the same reason: server-side, so a link to a film opens on that film in the
 * first paint rather than showing the wall and then replacing it once the
 * browser has caught up.
 *
 * Returns the project rather than the slug, because the caller needs its
 * category too — a link to one film should open the wall filtered to its
 * kind, so the strip under the player is the rest of that work and not
 * whatever happened to be in the address bar beside it.
 *
 * An unknown slug resolves to nothing and the wall opens normally. A film can
 * be unpublished after its link went out, and a page that opens on the work
 * is a better answer to that than one that opens on an error.
 */
export function resolveProjectParam<T extends { slug: string }>(
  param: string | undefined,
  list: T[],
): T | null {
  if (!param) return null;
  const want = categorySlug(param);
  if (!want) return null;
  return (
    list.find((p) => p.slug === param || categorySlug(p.slug) === want) ?? null
  );
}

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  yt: "YouTube",
  saas: "SaaS",
  doc: "Documentary",
  pod: "Podcast",
  vlog: "Vlog",
};

export type Project = {
  slug: string;
  title: string;
  client: string;
  duration: string;
  format: string;
  cat: CategoryId;
  /** Hue (0-1) driving the procedural placeholder. Ignored once `reel` is set. */
  hue: number;
  /** Real footage. Put an mp4 in /public/reels and reference it here. */
  reel?: string;
  poster?: string;
  /** Featured projects appear on the hero video wall. */
  featured?: boolean;
  study: {
    summary: string;
    challenge: string;
    approach: string;
    /** Headline outcome numbers — the part clients actually read. */
    results: { label: string; before: string; after: string; delta: string }[];
    /** Audience-retention curve, 0-1 sampled at even intervals. */
    retention: { before: number[]; after: number[] };
  };
};

export const PROJECTS: Project[] = [
  {
    slug: "deep-field-ep-14",
    title: "Deep Field — Ep. 14",
    client: "Deep Field",
    duration: "48:12",
    format: "4K · Multicam",
    cat: "pod",
    hue: 0.44,
    featured: true,
    study: {
      summary:
        "A four-camera interview show that was losing half its audience before the first ad break.",
      challenge:
        "Episodes ran 70 minutes with a nine-minute preamble. The team shot well but cut chronologically, so the strongest moment of every episode landed after most viewers had already left.",
      approach:
        "We restructured to a cold-open format: the sharpest 40 seconds of the conversation runs first, then titles. Multicam switching moved to reaction-driven rather than speaker-driven, and we built a locked template so every episode ships the same way.",
      results: [
        {
          label: "Average view duration",
          before: "3:10",
          after: "4:22",
          delta: "+38%",
        },
        { label: "Uploads per month", before: "2", after: "8", delta: "4×" },
        {
          label: "Clips shipped per episode",
          before: "0",
          after: "6",
          delta: "new",
        },
      ],
      retention: {
        before: [1, 0.72, 0.55, 0.44, 0.37, 0.31, 0.27, 0.24, 0.21, 0.19, 0.17],
        after: [1, 0.88, 0.78, 0.7, 0.64, 0.58, 0.53, 0.49, 0.45, 0.42, 0.39],
      },
    },
  },
  {
    slug: "ledger-product-tour",
    title: "Ledger — product tour",
    client: "Ledger",
    duration: "1:52",
    format: "Motion · 2D",
    cat: "saas",
    hue: 0.52,
    featured: true,
    study: {
      summary:
        "A product tour that sales now sends before the demo call instead of after it.",
      challenge:
        "The existing tour was a narrated screen recording. It explained features in the order the interface presents them, not the order a buyer cares about, and ran four minutes.",
      approach:
        "We rebuilt it around one job-to-be-done, replaced raw capture with motion graphics for anything involving data, and cut it to under two minutes with a hard stop on the pricing question.",
      results: [
        {
          label: "Completion rate",
          before: "31%",
          after: "74%",
          delta: "+139%",
        },
        { label: "Runtime", before: "4:05", after: "1:52", delta: "−54%" },
        { label: "Demo-to-close", before: "18%", after: "26%", delta: "+44%" },
      ],
      retention: {
        before: [1, 0.66, 0.48, 0.39, 0.34, 0.31, 0.31, 0.3, 0.3, 0.3, 0.29],
        after: [1, 0.94, 0.9, 0.86, 0.84, 0.82, 0.8, 0.78, 0.77, 0.76, 0.74],
      },
    },
  },
  {
    slug: "nine-days-north",
    title: "Nine Days North",
    client: "Meridian Films",
    duration: "22:40",
    format: "Documentary",
    cat: "doc",
    hue: 0.36,
    featured: true,
    study: {
      summary:
        "Forty hours of expedition archive assembled into a festival-length short.",
      challenge:
        "Footage arrived across three camera formats and two years, with no logging and audio recorded separately on half the shoot days.",
      approach:
        "We synced and logged the full archive first, built a paper edit against the director's outline, then assembled to a locked structure. Colour and finishing in-house.",
      results: [
        { label: "Archive logged", before: "0h", after: "41h", delta: "full" },
        {
          label: "Assembly to lock",
          before: "—",
          after: "6 weeks",
          delta: "on time",
        },
        { label: "Festival selections", before: "0", after: "4", delta: "new" },
      ],
      retention: {
        before: [1, 0.7, 0.56, 0.47, 0.4, 0.35, 0.31, 0.28, 0.26, 0.24, 0.22],
        after: [1, 0.9, 0.83, 0.77, 0.72, 0.68, 0.64, 0.6, 0.57, 0.54, 0.51],
      },
    },
  },
  {
    slug: "vault-daily-uploads",
    title: "Vault — daily uploads",
    client: "Vault Media",
    duration: "12:06",
    format: "Faceless · Scripted",
    cat: "yt",
    hue: 0.47,
    featured: true,
    study: {
      summary:
        "A faceless channel moved from weekly to daily without adding staff.",
      challenge:
        "One editor was the bottleneck. Every video was built from scratch, so output capped at four a month and quality drifted between them.",
      approach:
        "We built a locked template — title cards, lower thirds, transitions, sound bed — and split the pipeline across three editors working to the same spec, with a single reviewer holding the line on pacing.",
      results: [
        { label: "Uploads per month", before: "4", after: "30", delta: "7.5×" },
        {
          label: "Cost per video",
          before: "$410",
          after: "$180",
          delta: "−56%",
        },
        {
          label: "Average view duration",
          before: "4:02",
          after: "5:31",
          delta: "+37%",
        },
      ],
      retention: {
        before: [1, 0.68, 0.5, 0.4, 0.34, 0.3, 0.27, 0.24, 0.22, 0.2, 0.18],
        after: [1, 0.86, 0.75, 0.67, 0.61, 0.56, 0.52, 0.48, 0.45, 0.42, 0.4],
      },
    },
  },
  {
    slug: "atlas-onboarding-film",
    title: "Atlas onboarding film",
    client: "Atlas",
    duration: "2:18",
    format: "SaaS · Motion",
    cat: "saas",
    hue: 0.55,
    study: {
      summary: "The first thing every new Atlas account sees.",
      challenge:
        "Support was answering the same six setup questions on every new account, and the written docs were not being read.",
      approach:
        "We scripted against the actual support-ticket log rather than the feature list, then animated the six answers as one continuous film with chapter markers.",
      results: [
        {
          label: "Setup tickets",
          before: "6.2/acct",
          after: "2.1/acct",
          delta: "−66%",
        },
        {
          label: "Time to first value",
          before: "9 days",
          after: "3 days",
          delta: "−67%",
        },
        { label: "Completion rate", before: "—", after: "81%", delta: "new" },
      ],
      retention: {
        before: [1, 0.72, 0.58, 0.5, 0.45, 0.42, 0.4, 0.38, 0.37, 0.36, 0.35],
        after: [1, 0.95, 0.92, 0.89, 0.87, 0.86, 0.85, 0.84, 0.83, 0.82, 0.81],
      },
    },
  },
  {
    slug: "quiet-hours-ep-62",
    title: "The Quiet Hours — Ep. 62",
    client: "Quiet Hours",
    duration: "1:04:20",
    format: "Podcast",
    cat: "pod",
    hue: 0.4,
    study: {
      summary:
        "A long-form conversation show with a clips pack shipped the same day.",
      challenge:
        "The show performed well but nothing was being cut for social, so each episode reached only the existing audience.",
      approach:
        "We added a clips pass to the same delivery: six vertical cutdowns per episode chosen for standalone comprehension, captioned and framed for 9:16.",
      results: [
        { label: "Clips per episode", before: "0", after: "6", delta: "new" },
        { label: "Social reach", before: "12k", after: "94k", delta: "+683%" },
        {
          label: "Delivery time",
          before: "5 days",
          after: "Same day",
          delta: "faster",
        },
      ],
      retention: {
        before: [1, 0.75, 0.62, 0.53, 0.47, 0.43, 0.39, 0.36, 0.34, 0.32, 0.3],
        after: [1, 0.87, 0.79, 0.73, 0.68, 0.64, 0.6, 0.57, 0.54, 0.52, 0.49],
      },
    },
  },
  {
    slug: "the-salt-line",
    title: "The Salt Line",
    client: "Meridian Films",
    duration: "38:04",
    format: "Documentary",
    cat: "doc",
    hue: 0.33,
    study: {
      summary:
        "A coastal documentary cut from two years of intermittent shooting.",
      challenge:
        "The story changed halfway through production. Half the archive no longer served the film, but nobody could tell which half.",
      approach:
        "We re-logged everything against the new outline, cut three structural options, and screened them before committing to the assembly.",
      results: [
        {
          label: "Structural drafts",
          before: "1",
          after: "3",
          delta: "tested",
        },
        { label: "Runtime", before: "62:00", after: "38:04", delta: "−39%" },
        {
          label: "Delivered",
          before: "—",
          after: "On schedule",
          delta: "on time",
        },
      ],
      retention: {
        before: [1, 0.69, 0.54, 0.45, 0.39, 0.34, 0.3, 0.28, 0.25, 0.23, 0.22],
        after: [1, 0.89, 0.81, 0.75, 0.7, 0.66, 0.62, 0.59, 0.56, 0.53, 0.5],
      },
    },
  },
  {
    slug: "signal-60-shorts",
    title: "Signal — 60 shorts",
    client: "Signal Daily",
    duration: "0:48",
    format: "Automation · 9:16",
    cat: "yt",
    hue: 0.5,
    featured: true,
    study: {
      summary: "Sixty vertical shorts in a month, on one visual system.",
      challenge:
        "Shorts were being made ad hoc by whoever had time, so the channel had no recognisable look and performance was inconsistent.",
      approach:
        "We built a caption and framing system, then produced in batches of twenty against a fixed hook structure — first frame carries the claim, no cold intro.",
      results: [
        { label: "Shorts per month", before: "9", after: "60", delta: "6.6×" },
        { label: "Median views", before: "2.1k", after: "18k", delta: "+757%" },
        { label: "Watch-through", before: "41%", after: "68%", delta: "+66%" },
      ],
      retention: {
        before: [1, 0.78, 0.64, 0.55, 0.49, 0.45, 0.43, 0.42, 0.41, 0.41, 0.41],
        after: [1, 0.93, 0.87, 0.82, 0.78, 0.75, 0.73, 0.71, 0.7, 0.69, 0.68],
      },
    },
  },
  {
    slug: "rowan-vale-patagonia",
    title: "Rowan Vale — Patagonia",
    client: "Rowan Vale",
    duration: "14:06",
    format: "Vlog",
    cat: "vlog",
    hue: 0.29,
    study: {
      summary:
        "A three-week trip cut into a travel series that holds to the end.",
      challenge:
        "Beautiful footage, no structure. The first cut was a chronological travelogue and viewers left around the four-minute mark.",
      approach:
        "We rebuilt each episode around a single question posed in the first fifteen seconds and answered at the end, and cut the establishing shots by two thirds.",
      results: [
        {
          label: "Average view duration",
          before: "3:48",
          after: "8:12",
          delta: "+116%",
        },
        {
          label: "Subscriber conversion",
          before: "0.8%",
          after: "2.4%",
          delta: "3×",
        },
        {
          label: "Episodes delivered",
          before: "—",
          after: "6",
          delta: "on time",
        },
      ],
      retention: {
        before: [1, 0.71, 0.53, 0.42, 0.35, 0.3, 0.27, 0.24, 0.22, 0.2, 0.19],
        after: [1, 0.91, 0.84, 0.78, 0.73, 0.69, 0.65, 0.62, 0.59, 0.56, 0.54],
      },
    },
  },
];

export const FEATURED = PROJECTS.filter((p) => p.featured);

export const CLIENTS = [
  "Deep Field",
  "Ledger",
  "Meridian Films",
  "Atlas",
  "Quiet Hours",
  "Rowan Vale",
];

export const MILESTONES = [
  {
    step: "01",
    title: "Brief",
    copy: "Four questions and your files. We reply the same day with a first-cut date.",
    when: "Day 0",
  },
  {
    step: "02",
    title: "Assembly",
    copy: "A named editor builds the full cut against your reference and pacing notes.",
    when: "Days 1–4",
  },
  {
    step: "03",
    title: "Review",
    copy: "Comment on a timecode in the portal. Nothing gets lost in a thread.",
    when: "Day 5",
  },
  {
    step: "04",
    title: "Revisions",
    copy: "Two rounds as standard, each turned around in 34 hours.",
    when: "Days 6–7",
  },
  {
    step: "05",
    title: "Delivery",
    copy: "4K masters, captions, thumbnails and cutdowns for every platform.",
    when: "Day 8",
  },
];

export type TeamMember = {
  initials: string;
  name: string;
  role: string;
  /** Real portrait. Drop a file in /public and reference it here. */
  photo?: string;
};

export const TEAM: TeamMember[] = [
  { initials: "KB", name: "Kai Berger", role: "Lead editor" },
  { initials: "MR", name: "Mira Rask", role: "Motion & SaaS" },
  {
    initials: "AO",
    name: "Ari Okonkwo",
    role: "Shorts pipeline",
  },
  {
    initials: "SL",
    name: "Sofia Lindqvist",
    role: "Colour & finishing",
  },
  {
    initials: "TE",
    name: "Tomas Ek",
    role: "Documentary assembly",
  },
  {
    initials: "NH",
    name: "Nadia Haddad",
    role: "Senior editor, YouTube",
  },
  {
    initials: "LM",
    name: "Luca Moretti",
    role: "Sound design & mix",
  },
  {
    initials: "PN",
    name: "Priya Nair",
    role: "Motion graphics",
  },
  { initials: "JV", name: "Jonas Vogt", role: "Producer" },
  {
    initials: "EC",
    name: "Elena Costa",
    role: "Editor, vlog & travel",
  },
  {
    initials: "MD",
    name: "Marcus Reid",
    role: "Shorts specialist",
  },
  { initials: "YT", name: "Yuki Tanaka", role: "Colourist" },
  {
    initials: "SA",
    name: "Sam Adeyemi",
    role: "Podcast multicam",
  },
  {
    initials: "FO",
    name: "Freya Olsen",
    role: "Assistant editor",
  },
  {
    initials: "DA",
    name: "Diego Alvarez",
    role: "Archive & media",
  },
];

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  quote: string;
  /** Video testimonial. Falls back to the placeholder reel until supplied. */
  video?: string;
  poster?: string;
  /** Their face, beside the quote. Falls back to the initials chip. */
  avatar?: string;
  /** The client's own three figures — plain value/label, in their words. */
  stats?: { value: string; label: string }[];
  /** Kept so the bundled samples still line up with a project. Not shown. */
  projectSlug: string;
};

/** The band's own wording, and the three studio-wide figures above it. */
/**
 * The clients section: its wording, and the studio's four figures.
 *
 * Its own band rather than more fields on `testimonial_band`, because it is
 * its own section now — the stories say what one client thought, this says
 * how many there have been.
 */
/** One of the three numbered cards under the free-trial headline. */
export type TrialStep = { title: string; body: string };

/**
 * The free-trial section's wording.
 *
 * Everything a visitor reads there, so none of it is stranded in a component
 * — the same reason every other band on this page has a table behind it.
 */
export type TrialBand = {
  eyebrow: string;
  heading: string;
  /** The words inside the heading set in green, matched wherever they sit. */
  headingAccent: string;
  subhead: string;
  /** The three inline points. Their icons are fixed by position. */
  points: string[];
  steps: TrialStep[];
  /** The two handwritten notes. Either can be blank. */
  noteTop: string;
  noteBottom: string;
  formTitle: string;
  formSubhead: string;
  buttonLabel: string;
  formNote: string;
};

export const TRIAL_BAND: TrialBand = {
  eyebrow: "Free trial",
  heading: "Book a free trial.",
  headingAccent: "free trial.",
  subhead:
    "Apply for a free 1-minute trial edit and see how we approach your content before you commit.",
  points: ["1-minute sample edit", "No commitment", "Fast turnaround"],
  steps: [
    { title: "Submit footage", body: "Send us your raw clips (or a link)." },
    { title: "We cut a sample", body: "Our team edits a 1-minute sample." },
    {
      title: "Review the result",
      body: "See our quality and style, no strings attached.",
    },
  ],
  noteTop: "Let\u2019s create something great.",
  noteBottom: "Same team. Same quality. Just a smaller project.",
  formTitle: "Apply for your free trial",
  formSubhead:
    "Tell us a bit about your project and we\u2019ll be in touch shortly.",
  buttonLabel: "Apply for free trial",
  formNote: "Limited trial slots each month.",
};

export type ClientBand = {
  eyebrow: string;
  heading: string;
  /**
   * The words inside the heading set in green. Held apart rather than marked
   * up inside `heading` so the heading stays one plain sentence to write, and
   * matched wherever it appears rather than only at the end — this one sits in
   * the middle. A heading that no longer contains it is drawn plainly, which
   * is the right answer to rewriting one and forgetting the other.
   */
  headingAccent: string;
  subhead: string;
  stats: { value: string; label: string }[];
};

export const CLIENT_BAND: ClientBand = {
  eyebrow: "Our clients",
  heading: "Trusted by creators and brands worldwide.",
  headingAccent: "creators and brands",
  subhead:
    "From solo creators to global brands \u2014 we help them turn ideas into videos that perform.",
  stats: [
    { value: "100+", label: "Happy clients" },
    { value: "50+", label: "Countries" },
    { value: "500M+", label: "Views generated" },
    { value: "8+ Years", label: "Growing together" },
  ],
};

/** One of the three points in the band under the pricing cards. */
export type PricingNote = { title: string; body: string };

/**
 * The pricing section's wording.
 *
 * The tiers themselves live in `pricing_tiers` — this is everything around
 * them: the heading, and the band underneath that answers the three questions
 * a published rate card always leaves open. Those three are the reason the
 * rates can be quoted as starting figures at all, so they are content rather
 * than something stranded in the component.
 */
export type PricingBand = {
  eyebrow: string;
  heading: string;
  /** The words inside the heading set in green, matched wherever they sit. */
  headingAccent: string;
  subhead: string;
  /** The caption over every tier's price. */
  fromLabel: string;
  /** The three points under the cards. Their icons are fixed by position. */
  notes: PricingNote[];
  ctaLabel: string;
  ctaHref: string;
  /** The small print under the button. */
  ctaNote: string;
};

export const PRICING_BAND: PricingBand = {
  eyebrow: "Pricing",
  heading: "High-Quality Video Editing, Built for Your Goals",
  headingAccent: "Built for Your Goals",
  subhead:
    "Transparent starting rates with flexible, custom quotes \u2014 because every project is unique. Get professional edits that match your vision, budget, and growth plans.",
  fromLabel: "Starting from",
  notes: [
    {
      title: "Custom Pricing",
      body: "Every project is different. Final pricing depends on video length, editing complexity, turnaround time, and specific requirements.",
    },
    {
      title: "Volume Discounts",
      body: "Need 10+ videos per month? Ask about our special rates for long-term partners.",
    },
    {
      title: "Let\u2019s Talk",
      body: "Have a unique project or not sure which service fits you? We\u2019re happy to discuss and create a custom quote.",
    },
  ],
  ctaLabel: "Get a Custom Quote",
  ctaHref: "#onboarding",
  ctaNote: "Fast response \u00b7 No obligation",
};

export type TestimonialBand = {
  eyebrow: string;
  heading: string;
  /**
   * The tail of the heading that is set in green. Held apart rather than
   * marked up inside `heading` so the heading stays one plain sentence to
   * write; the section colours it only where the heading actually ends with
   * it, so rewriting one without the other reads plainly instead of wrongly.
   */
  headingAccent: string;
  subhead: string;
  /** Set beside the client's name, with an arrow back to the film. */
  scriptLine: string;
  /** Written on the picture. Which one depends on the film's shape. */
  noteWide: string;
  noteReel: string;
  logosLabel: string;
  logosMore: string;
};

export const TESTIMONIAL_BAND: TestimonialBand = {
  eyebrow: "Client stories",
  heading: "Don't just take our word for it.",
  headingAccent: "our word for it.",
  subhead:
    "See what creators and businesses around the world say about working with us.",
  scriptLine: "From raw footage to real results.",
  noteWide: "Great team to work with!",
  noteReel: "Real people. Real results.",
  logosLabel: "Trusted by creators and brands worldwide",
  logosMore: "and many more\u2026",
};

export type ClientLogo = {
  id: string;
  name: string;
  logo?: string;
  href?: string;
};

/* PLACEHOLDER: names only. Add a mark in the panel and it replaces the name. */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "nadia",
    name: "Nadia Osei",
    role: "Head of Content",
    company: "Deep Field",
    initials: "NO",
    quote:
      "We went from two uploads a month to eight, and our average view duration went up. That combination is not supposed to happen.",
    stats: [
      { value: "2+ Years", label: "Working Together" },
      { value: "4×", label: "Upload Volume" },
      { value: "+38%", label: "View Duration" },
    ],
    projectSlug: "deep-field-ep-14",
  },
  {
    id: "tomas",
    name: "Tomas Vidal",
    role: "Marketing lead",
    company: "Ledger",
    initials: "TV",
    quote:
      "The product tour finally explains the product. Sales sends it before the demo now instead of after.",
    stats: [
      { value: "18 Months", label: "Working Together" },
      { value: "+139%", label: "Tour Completion" },
      { value: "+44%", label: "Demo-to-Close" },
    ],
    projectSlug: "ledger-product-tour",
  },
  {
    id: "hana",
    name: "Hana Mori",
    role: "Director",
    company: "Meridian Films",
    initials: "HM",
    quote:
      "They cut forty hours of archive into something that holds a cinema. Twice.",
    stats: [
      { value: "3+ Years", label: "Working Together" },
      { value: "40 hrs", label: "Archive Cut Down" },
      { value: "2", label: "Festival Selections" },
    ],
    projectSlug: "nine-days-north",
  },
  {
    id: "priya",
    name: "Priya Shah",
    role: "Founder",
    company: "Vault Media",
    initials: "PS",
    quote:
      "One editor used to be our ceiling. We publish daily now and it costs us less per video than it did at four a month.",
    stats: [
      { value: "4+ Years", label: "Working Together" },
      { value: "Daily", label: "Publishing Cadence" },
      { value: "−31%", label: "Cost per Video" },
    ],
    projectSlug: "vault-daily-uploads",
  },
  {
    id: "ben",
    name: "Ben Carter",
    role: "Growth",
    company: "Signal Daily",
    initials: "BC",
    quote:
      "Sixty shorts in a month, all recognisably ours. Median views went up almost eightfold.",
    stats: [
      { value: "1 Year", label: "Working Together" },
      { value: "60", label: "Shorts Shipped" },
      { value: "+210%", label: "Follower Growth" },
    ],
    projectSlug: "signal-60-shorts",
  },
];

/** Drives the fixed scroll-timeline rail. Order must match section order. */
export const TIMELINE_CLIPS = [
  { id: "top", label: "Hero" },
  { id: "testimonials", label: "Clients" },
  { id: "work", label: "Work" },
  { id: "journey", label: "Process" },
  { id: "free-trial", label: "Free trial" },
  { id: "story", label: "Our journey" },
  { id: "onboarding", label: "Brief" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];
