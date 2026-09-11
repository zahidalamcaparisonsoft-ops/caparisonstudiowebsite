"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { browserClient } from "@/lib/supabase/client";

/**
 * The dashboard tiles.
 *
 * Counts come from a single `admin_overview()` RPC. The page previously issued
 * twelve separate count queries, each a ~200ms round trip to the database
 * region, and blocked the first paint on all of them.
 */

const CARDS: { href: string; label: string; key: string; blurb: string }[] = [
  { href: "/admin/hero", label: "Hero", key: "hero", blurb: "Headline, button and demo video" },
  { href: "/admin/videos", label: "Videos", key: "videos", blurb: "Projects, Vimeo IDs, thumbnails, figures" },
  { href: "/admin/clips", label: "Deliverables", key: "video_clips", blurb: "Clips listed under each project" },
  { href: "/admin/testimonials", label: "Testimonials", key: "testimonials", blurb: "Client videos and their results" },
  { href: "/admin/categories", label: "Categories", key: "categories", blurb: "Niches used to filter the work" },
  { href: "/admin/tags", label: "Tags", key: "tags", blurb: "Reusable video tags" },
  { href: "/admin/team", label: "Team", key: "team_members", blurb: "Photos, names, designations" },
  { href: "/admin/process", label: "Process", key: "process_steps", blurb: "The five-step journey" },
  { href: "/admin/project-types", label: "Project types", key: "project_types", blurb: "Brief cards and per-video cost" },
  { href: "/admin/pricing", label: "Pricing", key: "pricing_tiers", blurb: "Published tiers" },
  { href: "/admin/faq", label: "FAQ", key: "faqs", blurb: "Questions and answers" },
  { href: "/admin/trusted", label: "Trusted by", key: "trusted_by", blurb: "Client names in the hero bar" },
  { href: "/admin/trial-applications", label: "Trial applications", key: "trial_applications", blurb: "Free-trial enquiries and their status" },
  { href: "/admin/brief-submissions", label: "Brief submissions", key: "brief_submissions", blurb: "Briefs sent through the four-question section" },
];

export default function OverviewCards() {
  const supabase = useMemo(() => browserClient(), []);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  /* Asked for separately rather than added to `admin_overview()`: that is a
     database function, so another count in it is another migration, and these
     want the unanswered rows rather than all of them. A `head` count reads no
     rows. */
  const [unread, setUnread] = useState({ trial: 0, brief: 0 });

  useEffect(() => {
    let alive = true;
    void supabase.rpc("admin_overview").then(({ data }) => {
      if (alive && data) setCounts(data as Record<string, number>);
    });
    const waiting = (table: string) =>
      supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("status", "new")
        .then(({ count }) => count ?? 0);
    void Promise.all([
      waiting("trial_applications"),
      waiting("brief_submissions"),
    ]).then(([trial, brief]) => {
      if (alive) setUnread({ trial, brief });
    });
    return () => {
      alive = false;
    };
  }, [supabase]);

  return (
    <>
      {/* Above the tiles, and only where there is something waiting: someone
          has written in and nobody has written back, which is the one thing on
          this dashboard that goes stale. */}
      {(
        [
          {
            href: "/admin/trial-applications",
            count: unread.trial,
            one: "free-trial application",
            many: "free-trial applications",
          },
          {
            href: "/admin/brief-submissions",
            count: unread.brief,
            one: "brief",
            many: "briefs",
          },
        ] as const
      )
        .filter((w) => w.count > 0)
        .map((w) => (
          <Link
            key={w.href}
            href={w.href}
            prefetch
            className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-mint/40 bg-mint/[0.08] p-4 transition-colors first:mt-8 hover:bg-mint/[0.14]"
          >
            <span>
              <span className="font-display text-base font-bold text-white">
                {w.count} {w.count === 1 ? w.one : w.many} waiting
              </span>
              <span className="mt-1 block text-xs text-white/55">
                Nobody has replied to {w.count === 1 ? "it" : "them"} yet
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-mint px-3 py-1.5 font-mono text-xs font-bold text-ink">
              {w.count}
            </span>
          </Link>
        ))}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {CARDS.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          prefetch
          className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-mint/40 hover:bg-white/[0.05]"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-base font-bold text-white">{c.label}</span>
            <span className="font-mono text-xs text-mint">
              {counts ? (counts[c.key] ?? 0) : "·"}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/45">{c.blurb}</p>
        </Link>
      ))}
      </div>
    </>
  );
}
