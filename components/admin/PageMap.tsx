"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { INBOX, SECTIONS, SETTINGS } from "./nav";

/**
 * The dashboard.
 *
 * Ordered by what needs doing rather than by what exists. Anything waiting to
 * be answered comes first, because it is the only thing here that gets worse
 * while nobody looks; then the site as a map you can point at; then the
 * settings nobody changes twice.
 *
 * The homepage is drawn in scroll order with each section's editors listed
 * under it, so the question is "which part of my site?" and not "which of
 * these nouns did they use?". Counts arrive after paint — the page is usable
 * before the database answers.
 */
export default function PageMap() {
  const supabase = useMemo(() => browserClient(), []);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [waiting, setWaiting] = useState<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    void supabase.rpc("admin_overview").then(({ data }) => {
      if (alive && data) setCounts(data as Record<string, number>);
    });

    /* The unanswered ones, asked for separately. `admin_overview()` is a
       database function, so another count in it is another migration, and it
       would return every row rather than only the ones still waiting. A
       `head` count reads no rows. */
    void Promise.all(
      INBOX.map(async (i) => {
        const { count } = await supabase
          .from(i.countKey!)
          .select("id", { count: "exact", head: true })
          .eq("status", "new");
        return [i.href, count ?? 0] as const;
      }),
    ).then((pairs) => {
      if (alive) setWaiting(Object.fromEntries(pairs));
    });

    return () => {
      alive = false;
    };
  }, [supabase]);

  /* A key the RPC does not return is shown as nothing, not as zero. Five of
     these tables were added after `admin_overview()` was written, and a
     confident "0" beside a list that has eleven rows in it is worse than no
     number at all. 0009 adds them; until it is run, those badges are simply
     absent. */
  const badge = (key?: string) => {
    if (!key) return null;
    if (!counts) return "·";
    return key in counts ? String(counts[key] ?? 0) : null;
  };

  const totalWaiting = Object.values(waiting).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-8 flex flex-col gap-10">
      {/* ── anything waiting ── */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-sm font-bold text-white">Inbox</h2>
          <span className="font-mono text-[11px] text-white/30">
            {totalWaiting
              ? `${totalWaiting} waiting on a reply`
              : "Nothing waiting"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {INBOX.map((item) => {
            const n = waiting[item.href] ?? 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`rounded-xl border p-4 transition-colors ${
                  n
                    ? "border-mint/40 bg-mint/[0.08] hover:bg-mint/[0.14]"
                    : "border-white/10 bg-white/[0.02] hover:border-mint/40 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-base font-bold text-white">
                    {item.label}
                  </span>
                  {n ? (
                    <span className="shrink-0 rounded-full bg-mint px-2.5 py-1 font-mono text-[11px] font-bold text-ink">
                      {n} new
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-white/30">
                      {badge(item.countKey)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-white/45">
                  {n
                    ? `Nobody has replied to ${n === 1 ? "one of these" : "these"} yet`
                    : item.blurb}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── the site, top to bottom ── */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-sm font-bold text-white">
            Your homepage
          </h2>
          <span className="font-mono text-[11px] text-white/30">
            In the order visitors scroll past them
          </span>
        </div>

        <ol className="relative mt-4 flex flex-col gap-1">
          {/* The spine makes the stack read as one page rather than a list. */}
          <span
            aria-hidden="true"
            className="absolute bottom-8 left-[15px] top-8 w-px bg-gradient-to-b from-mint/40 via-white/10 to-transparent"
          />
          {SECTIONS.map((section, i) => (
            <li key={section.id} className="relative rounded-xl p-2">
              <div className="flex items-start gap-4">
                <span className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-[#07100D] font-mono text-[11px] text-white/50">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-display text-base font-bold text-white">
                      {section.label}
                    </span>
                    <span className="text-xs text-white/40">
                      {section.blurb}
                    </span>
                    <a
                      href={`/#${section.anchor}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto shrink-0 font-mono text-[10px] text-white/30 transition-colors hover:text-mint"
                    >
                      view ↗
                    </a>
                  </div>

                  {/* The editors behind this section, as things you can press
                      rather than a sentence describing them. */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch
                        title={item.blurb}
                        className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 transition-colors hover:border-mint/50 hover:bg-white/[0.07]"
                      >
                        <span className="text-[13px] text-white/75 group-hover:text-mint">
                          {item.label}
                        </span>
                        {item.countKey ? (
                          <span className="font-mono text-[10px] text-white/30">
                            {badge(item.countKey)}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── everywhere else ── */}
      <section>
        <h2 className="font-display text-sm font-bold text-white">Settings</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SETTINGS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-mint/40 hover:bg-white/[0.05]"
            >
              <span className="font-display text-base font-bold text-white">
                {item.label}
              </span>
              <p className="mt-1 text-xs text-white/45">{item.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
