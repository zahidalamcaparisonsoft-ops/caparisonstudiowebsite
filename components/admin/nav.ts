/**
 * The admin's map of the site.
 *
 * Grouped by *where the change shows up* rather than by database table, and the
 * page-section group is listed in the order those sections actually appear when
 * you scroll the homepage. Someone who wants to change the thing under the
 * headline can find it by counting down the page rather than guessing which
 * noun we used.
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

export type NavGroup = {
  id: string;
  title: string;
  caption: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "page",
    title: "Homepage",
    caption: "In the order visitors scroll past them",
    items: [
      {
        href: "/admin/hero",
        label: "Hero",
        blurb: "The first screen — headline, button and demo video",
        countKey: "hero",
        anchor: "top",
      },
      {
        href: "/admin/trusted",
        label: "Trusted by",
        blurb: "Client names in the bar under the hero video",
        countKey: "trusted_by",
        anchor: "top",
      },
      {
        href: "/admin/testimonials",
        label: "Testimonials",
        blurb: "Client videos and the results shown beside them",
        countKey: "testimonials",
        anchor: "testimonials",
      },
      {
        href: "/admin/videos",
        label: "Work",
        blurb: "The projects in the card deck and their case studies",
        countKey: "videos",
        anchor: "work",
      },
      {
        href: "/admin/process",
        label: "Process",
        blurb: "The five steps on the green band",
        countKey: "process_steps",
        anchor: "journey",
      },
      {
        href: "/admin/team",
        label: "Team",
        blurb: "Faces on the curved wall",
        countKey: "team_members",
        anchor: "story",
      },
      {
        href: "/admin/onboarding",
        label: "Brief",
        blurb: "Wording of the four-question form",
        anchor: "onboarding",
      },
      {
        href: "/admin/pricing",
        label: "Pricing",
        blurb: "The three tiers on the light band",
        countKey: "pricing_tiers",
        anchor: "pricing",
      },
      {
        href: "/admin/faq",
        label: "FAQ",
        blurb: "Questions and answers near the bottom",
        countKey: "faqs",
        anchor: "faq",
      },
    ],
  },
  {
    id: "library",
    title: "Library",
    caption: "Feeds the sections above",
    items: [
      {
        href: "/admin/clips",
        label: "Deliverables",
        blurb: "Clips listed under a project when it opens",
        countKey: "video_clips",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        blurb: "The filter buttons above the work deck",
        countKey: "categories",
      },
      {
        href: "/admin/tags",
        label: "Tags",
        blurb: "Reusable labels you can attach to videos",
        countKey: "tags",
      },
      {
        href: "/admin/project-types",
        label: "Project types",
        blurb: "Brief cards, and the per-video price each one sets",
        countKey: "project_types",
      },
      {
        href: "/admin/cadences",
        label: "Cadences",
        blurb: "How often a client publishes, and the volume discount",
      },
      {
        href: "/admin/addons",
        label: "Add-ons",
        blurb: "Optional extras in the brief",
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    caption: "Used everywhere",
    items: [
      {
        href: "/admin/settings",
        label: "Site details",
        blurb: "Studio name, logo, email and social links",
      },
    ],
  },
];

export const ALL_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
