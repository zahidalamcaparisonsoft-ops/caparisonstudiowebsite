"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { NAV_GROUPS } from "./nav";

/**
 * The overview as a map of the site rather than a bag of tables.
 *
 * The homepage group is drawn as a numbered stack in scroll order, so someone
 * who knows what they want to change can find it by position. Counts come from
 * one `admin_overview()` RPC after paint.
 */
export default function PageMap() {
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

  const badge = (key?: string) =>
    !key ? null : counts ? String(counts[key] ?? 0) : "·";

  const [page, ...rest] = NAV_GROUPS;

  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_.85fr] xl:items-start">
      {/* ── The homepage, top to bottom ── */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-sm font-bold text-white">
            {page.title}
          </h2>
          <span className="font-mono text-[11px] text-white/30">{page.caption}</span>
        </div>

        <ol className="relative mt-4">
          {/* The spine makes the stack read as one page rather than a list. */}
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-[15px] top-6 w-px bg-gradient-to-b from-mint/40 via-white/10 to-transparent"
          />
          {page.items.map((item, i) => (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                prefetch
                className="group flex items-start gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.04]"
              >
                <span className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-[#07100D] font-mono text-[11px] text-white/50 transition-colors group-hover:border-mint/50 group-hover:text-mint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-base font-bold text-white group-hover:text-mint">
                      {item.label}
                    </span>
                    {item.countKey ? (
                      <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white/45">
                        {badge(item.countKey)}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-white/45">{item.blurb}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-mint"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Everything the page draws from ── */}
      <div className="flex flex-col gap-6">
        {rest.map((group) => (
          <section key={group.id}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-sm font-bold text-white">
                {group.title}
              </h2>
              <span className="font-mono text-[11px] text-white/30">
                {group.caption}
              </span>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch
                    className="group flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-mint/40 hover:bg-white/[0.05]"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-white group-hover:text-mint">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-white/45">
                        {item.blurb}
                      </span>
                    </span>
                    {item.countKey ? (
                      <span className="shrink-0 font-mono text-xs text-mint">
                        {badge(item.countKey)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
