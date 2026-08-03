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
        { label: "Average view duration", before: "3:10", after: "4:22", delta: "+38%" },
        { label: "Uploads per month", before: "2", after: "8", delta: "4×" },
        { label: "Clips shipped per episode", before: "0", after: "6", delta: "new" },
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
        { label: "Completion rate", before: "31%", after: "74%", delta: "+139%" },
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
        { label: "Assembly to lock", before: "—", after: "6 weeks", delta: "on time" },
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
      summary: "A faceless channel moved from weekly to daily without adding staff.",
      challenge:
        "One editor was the bottleneck. Every video was built from scratch, so output capped at four a month and quality drifted between them.",
      approach:
        "We built a locked template — title cards, lower thirds, transitions, sound bed — and split the pipeline across three editors working to the same spec, with a single reviewer holding the line on pacing.",
      results: [
        { label: "Uploads per month", before: "4", after: "30", delta: "7.5×" },
        { label: "Cost per video", before: "$410", after: "$180", delta: "−56%" },
        { label: "Average view duration", before: "4:02", after: "5:31", delta: "+37%" },
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
        { label: "Setup tickets", before: "6.2/acct", after: "2.1/acct", delta: "−66%" },
        { label: "Time to first value", before: "9 days", after: "3 days", delta: "−67%" },
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
      summary: "A long-form conversation show with a clips pack shipped the same day.",
      challenge:
        "The show performed well but nothing was being cut for social, so each episode reached only the existing audience.",
      approach:
        "We added a clips pass to the same delivery: six vertical cutdowns per episode chosen for standalone comprehension, captioned and framed for 9:16.",
      results: [
        { label: "Clips per episode", before: "0", after: "6", delta: "new" },
        { label: "Social reach", before: "12k", after: "94k", delta: "+683%" },
        { label: "Delivery time", before: "5 days", after: "Same day", delta: "faster" },
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
      summary: "A coastal documentary cut from two years of intermittent shooting.",
      challenge:
        "The story changed halfway through production. Half the archive no longer served the film, but nobody could tell which half.",
      approach:
        "We re-logged everything against the new outline, cut three structural options, and screened them before committing to the assembly.",
      results: [
        { label: "Structural drafts", before: "1", after: "3", delta: "tested" },
        { label: "Runtime", before: "62:00", after: "38:04", delta: "−39%" },
        { label: "Delivered", before: "—", after: "On schedule", delta: "on time" },
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
      summary: "A three-week trip cut into a travel series that holds to the end.",
      challenge:
        "Beautiful footage, no structure. The first cut was a chronological travelogue and viewers left around the four-minute mark.",
      approach:
        "We rebuilt each episode around a single question posed in the first fifteen seconds and answered at the end, and cut the establishing shots by two thirds.",
      results: [
        { label: "Average view duration", before: "3:48", after: "8:12", delta: "+116%" },
        { label: "Subscriber conversion", before: "0.8%", after: "2.4%", delta: "3×" },
        { label: "Episodes delivered", before: "—", after: "6", delta: "on time" },
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

export const TEAM = [
  {
    initials: "KB",
    name: "Kai Berger",
    role: "Lead editor — podcast & long-form",
    reelCount: 214,
  },
  { initials: "MR", name: "Mira Rask", role: "Motion & SaaS animation", reelCount: 96 },
  {
    initials: "AO",
    name: "Ari Okonkwo",
    role: "Shorts and automation pipeline",
    reelCount: 512,
  },
  { initials: "SL", name: "Sofia Lindqvist", role: "Colour & finishing", reelCount: 178 },
];

export const TESTIMONIALS = [
  {
    quote:
      "We went from two uploads a month to eight, and our average view duration went up.",
    initials: "NO",
    name: "Nadia Osei",
    role: "Head of Content, Deep Field",
  },
  {
    quote:
      "The product tour finally explains the product. Sales sends it before the demo now.",
    initials: "TV",
    name: "Tomas Vidal",
    role: "Marketing lead, Ledger",
  },
  {
    quote: "They cut 40 hours of archive into something that holds a cinema. Twice.",
    initials: "HM",
    name: "Hana Mori",
    role: "Director, Meridian Films",
  },
];

/** Drives the fixed scroll-timeline rail. Order must match section order. */
export const TIMELINE_CLIPS = [
  { id: "top", label: "Hero" },
  { id: "work", label: "Work" },
  { id: "proof", label: "Proof" },
  { id: "journey", label: "Process" },
  { id: "story", label: "Studio" },
  { id: "onboarding", label: "Brief" },
  { id: "pricing", label: "Pricing" },
  { id: "testimonials", label: "Clients" },
];
