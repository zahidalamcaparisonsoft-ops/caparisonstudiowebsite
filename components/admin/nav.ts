/**
 * The admin's map of the site.
 *
 * Three kinds of thing, kept apart, because they are three different jobs:
 *
 *   Inbox     people who have written in. The only part of this panel that
 *             goes stale if nobody looks at it.
 *   Homepage  the site itself, section by section in scroll order.
 *   Settings  things used everywhere.
 *
 * The homepage is nested one level rather than flat. It used to be fifteen
 * siblings — section wording, content lists and incoming leads all in one
 * column — beside a "Library" group holding nouns like "Cadences" and
 * "Add-ons" that mean nothing until you already know which section they feed.
 * Grouping by section answers the question someone actually arrives with:
 * which part of my site am I changing? "Cadences" is a guess; "Brief →
 * Cadences" is not.
 */

export type NavItem = {
  href: string;
  label: string;
  /** What this actually changes, in the visitor's terms. */
  blurb: string;
  /** Key returned by the admin_overview() RPC, for the count badge. */
  countKey?: string;
  /** Anchor on the public site, so "view on site" can jump straight there. */
  anchor?: string;
};

/** One section of the public page, and everything that feeds it. */
export type NavSection = {
  id: string;
  label: string;
  /** What a visitor sees there. */
  blurb: string;
  /** Anchor on the public site. */
  anchor: string;
  items: NavItem[];
};

export type NavGroup = {
  id: string;
  title: string;
  caption: string;
  items: NavItem[];
};

/* ------------------------------------------------------------------- inbox */

/**
 * What people have sent in.
 *
 * First, and on its own, because it is the only part of the panel with
 * anything time-sensitive in it. Buried in the homepage list — which is where
 * both of these started — a lead can sit unanswered for a week without anyone
 * having a reason to scroll past it.
 */
export const INBOX: NavItem[] = [
  {
    href: "/admin/trial-applications",
    label: "Free trial applications",
    blurb: "People who asked for a trial edit",
    countKey: "trial_applications",
    anchor: "free-trial",
  },
  {
    href: "/admin/brief-submissions",
    label: "Brief submissions",
    blurb: "Briefs sent through the four-question section, and their estimates",
    countKey: "brief_submissions",
    anchor: "onboarding",
  },
];

/* ---------------------------------------------------------------- homepage */

export const SECTIONS: NavSection[] = [
  {
    id: "hero",
    label: "Hero",
    blurb: "The first screen",
    anchor: "top",
    items: [
      {
        href: "/admin/hero",
        label: "Headline and video",
        blurb: "The wording, the button and the demo film",
        countKey: "hero",
        anchor: "top",
      },
      {
        href: "/admin/trusted",
        label: "Client names",
        blurb: "The rolling bar under the hero video",
        countKey: "trusted_by",
        anchor: "top",
      },
    ],
  },
  {
    id: "stories",
    label: "Client stories",
    blurb: "The testimonial films and what they said",
    anchor: "testimonials",
    items: [
      {
        href: "/admin/client-stories",
        label: "Wording",
        blurb: "Headline, sub-headline and the handwritten notes",
        anchor: "testimonials",
      },
      {
        href: "/admin/testimonials",
        label: "Testimonial films",
        blurb: "Each client's video, quote and figures",
        countKey: "testimonials",
        anchor: "testimonials",
      },
    ],
  },
  {
    id: "clients",
    label: "Clients",
    blurb: "The logo rail and the studio's figures",
    anchor: "clients",
    items: [
      {
        href: "/admin/clients-band",
        label: "Wording and figures",
        blurb: "Headline above the rail, and the four numbers under it",
        anchor: "clients",
      },
      {
        href: "/admin/client-logos",
        label: "Logos",
        blurb: "The marks on the rail. Upload a logo for each client",
        countKey: "client_logos",
        anchor: "clients",
      },
    ],
  },
  {
    id: "work",
    label: "Work",
    blurb: "The wall of films",
    anchor: "work",
    items: [
      {
        href: "/admin/videos",
        label: "Projects",
        blurb: "Every film on the wall — Vimeo id, thumbnail, figures",
        countKey: "videos",
        anchor: "work",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        blurb: "The filter chips above the wall",
        countKey: "categories",
        anchor: "work",
      },
      {
        href: "/admin/clips",
        label: "Deliverables",
        blurb: "The clips listed under each project",
        countKey: "video_clips",
        anchor: "work",
      },
      {
        href: "/admin/tags",
        label: "Tags",
        blurb: "Reusable labels for projects",
        countKey: "tags",
        anchor: "work",
      },
    ],
  },
  {
    id: "process",
    label: "Process",
    blurb: "The five-step journey",
    anchor: "journey",
    items: [
      {
        href: "/admin/process",
        label: "Steps",
        blurb: "Each step's number, title and text",
        countKey: "process_steps",
        anchor: "journey",
      },
    ],
  },
  {
    id: "trial",
    label: "Free trial",
    blurb: "The offer and its form",
    anchor: "free-trial",
    items: [
      {
        href: "/admin/free-trial",
        label: "Wording",
        blurb: "Headline, the three steps, both notes and the button",
        anchor: "free-trial",
      },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    blurb: "Who the team are",
    anchor: "story",
    items: [
      {
        href: "/admin/team",
        label: "Team",
        blurb: "Photos, names and roles on the curved wall",
        countKey: "team_members",
        anchor: "story",
      },
    ],
  },
  {
    id: "brief",
    label: "Brief",
    blurb: "The four-question form and what it prices",
    anchor: "onboarding",
    items: [
      {
        href: "/admin/onboarding",
        label: "Wording",
        blurb: "Heading, sub-heading and the note under the estimate",
        anchor: "onboarding",
      },
      {
        href: "/admin/project-types",
        label: "Project types",
        blurb: "The cards in question one, and what each costs per video",
        countKey: "project_types",
        anchor: "onboarding",
      },
      {
        href: "/admin/cadences",
        label: "Volumes",
        blurb: "How many videos a month, and the discount each earns",
        countKey: "cadences",
        anchor: "onboarding",
      },
      {
        href: "/admin/addons",
        label: "Extras",
        blurb: "The add-ons in question three, and what each adds",
        countKey: "addons",
        anchor: "onboarding",
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    blurb: "The published tiers",
    anchor: "pricing",
    items: [
      {
        href: "/admin/pricing",
        label: "Tiers",
        blurb: "Each plan, its price and what it includes",
        countKey: "pricing_tiers",
        anchor: "pricing",
      },
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    blurb: "Questions and answers",
    anchor: "faq",
    items: [
      {
        href: "/admin/faq",
        label: "Questions",
        blurb: "What people ask before signing",
        countKey: "faqs",
        anchor: "faq",
      },
    ],
  },
];

/* ---------------------------------------------------------------- settings */

export const SETTINGS: NavItem[] = [
  {
    href: "/admin/settings",
    label: "Site details",
    blurb: "Studio name, email address, socials and logo",
  },
];

/* ------------------------------------------------------------- derivations */

/** Which editors sit behind each section, for the live canvas. */
export const LIVE_TARGETS: Record<string, string[]> = Object.fromEntries(
  SECTIONS.map((s) => [s.anchor, s.items.map((i) => i.href)]),
);

/** The sidebar's shape: one flat group per area. */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "inbox",
    title: "Inbox",
    caption: "People who wrote in",
    items: INBOX,
  },
  ...SECTIONS.map((s) => ({
    id: s.id,
    title: s.label,
    caption: s.blurb,
    items: s.items,
  })),
  {
    id: "settings",
    title: "Settings",
    caption: "Used everywhere",
    items: SETTINGS,
  },
];

export const ALL_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
