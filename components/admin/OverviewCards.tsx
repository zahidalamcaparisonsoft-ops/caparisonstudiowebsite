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
];

export default function OverviewCards() {
  const supabase = useMemo(() => browserClient(), []);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let alive = true;
    void supabase.rpc("admin_overview").then(({ data }) => {
      if (alive && data) setCounts(data as Record<string, number>);
    });
    return () => {
      alive = false;
    };
  }, [supabase]);

  return (
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
  );
}
