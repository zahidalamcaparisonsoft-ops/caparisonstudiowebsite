import Link from "next/link";
import { sessionClient } from "@/lib/supabase/server";

const CARDS: { href: string; label: string; table: string; blurb: string }[] = [
  { href: "/admin/hero", label: "Hero", table: "hero", blurb: "Headline, button and demo video" },
  { href: "/admin/videos", label: "Videos", table: "videos", blurb: "Projects, Vimeo IDs, thumbnails, figures" },
  { href: "/admin/clips", label: "Deliverables", table: "video_clips", blurb: "Clips listed under each project" },
  { href: "/admin/testimonials", label: "Testimonials", table: "testimonials", blurb: "Client videos and their results" },
  { href: "/admin/categories", label: "Categories", table: "categories", blurb: "Niches used to filter the work" },
  { href: "/admin/tags", label: "Tags", table: "tags", blurb: "Reusable video tags" },
  { href: "/admin/team", label: "Team", table: "team_members", blurb: "Photos, names, designations" },
  { href: "/admin/process", label: "Process", table: "process_steps", blurb: "The five-step journey" },
  { href: "/admin/project-types", label: "Project types", table: "project_types", blurb: "Brief cards and per-video cost" },
  { href: "/admin/pricing", label: "Pricing", table: "pricing_tiers", blurb: "Published tiers" },
  { href: "/admin/faq", label: "FAQ", table: "faqs", blurb: "Questions and answers" },
  { href: "/admin/trusted", label: "Trusted by", table: "trusted_by", blurb: "Client names in the hero bar" },
];

export default async function AdminHome() {
  const supabase = await sessionClient();

  const counts = await Promise.all(
    CARDS.map(async (c) => {
      const { count } = await supabase
        .from(c.table)
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    }),
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-white">Overview</h1>
      <p className="mt-1 text-sm text-white/45">
        Everything on the public site is edited from here. Changes are live as
        soon as they are saved.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((c, i) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-mint/40 hover:bg-white/[0.05]"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-base font-bold text-white">{c.label}</span>
              <span className="font-mono text-xs text-mint">{counts[i]}</span>
            </div>
            <p className="mt-1 text-xs text-white/45">{c.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
