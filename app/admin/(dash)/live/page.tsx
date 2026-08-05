"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ALL_ITEMS, LIVE_TARGETS } from "@/components/admin/nav";

/**
 * Edit live.
 *
 * The real site in one pane, the editor for whatever you click in the other.
 * Both panes are the real thing rather than a reproduction: the preview is the
 * public page with `?edit=1`, and the panel is the same editor page you would
 * reach from the sidebar, with its own navigation hidden. Nothing about a
 * section's fields is described twice, so the two cannot drift.
 *
 * What this is not is a page builder. Sections cannot be dragged into a new
 * order or composed out of blocks, because the site is not built from blocks —
 * each section is a typed component backed by its own table. Editing content
 * in place is the part that is genuinely available here; rearranging the page
 * would mean rebuilding it as a block system first.
 */

const MSG = "caparison-live";
const LABEL = new Map(ALL_ITEMS.map((i) => [i.href, i.label]));

const SECTION_NAMES: Record<string, string> = {
  top: "Hero",
  testimonials: "Testimonials",
  work: "Work",
  journey: "Process",
  story: "Studio",
  onboarding: "Brief",
  pricing: "Pricing",
  faq: "FAQ",
  footer: "Footer",
};

export default function LiveEditor() {
  const preview = useRef<HTMLIFrameElement>(null);
  const [section, setSection] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(0);
  const [wide, setWide] = useState(true);

  const choose = useCallback((id: string) => {
    setSection(id);
    setTarget(LIVE_TARGETS[id]?.[0] ?? null);
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (d?.source === MSG && d.type === "select") choose(d.section);
      // An editor in the panel reports its own saves, so the preview can show
      // the change without the whole screen being reloaded.
      if (d?.source === "caparison-admin" && d.type === "saved") {
        setSavedAt(Date.now());
        preview.current?.contentWindow?.location.reload();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [choose]);

  const jumpPreview = (id: string) => {
    preview.current?.contentWindow?.postMessage(
      { source: MSG, type: "scrollTo", section: id },
      window.location.origin,
    );
  };

  return (
    <div className="flex h-[calc(100vh-2.5rem)] min-h-[560px] flex-col gap-4 sm:h-[calc(100vh-4rem)]">
      <header className="shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white">Edit live</h1>
            <p className="mt-1 text-sm text-white/45">
              Click any section of the site to edit it. Changes appear in the preview
              as soon as they save.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWide((v) => !v)}
            className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:border-mint/50 hover:text-mint"
          >
            {wide ? "Wider editor" : "Wider preview"}
          </button>
        </div>

        {/* Jump straight to a section without hunting for it in the preview. */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {Object.keys(SECTION_NAMES).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                choose(id);
                jumpPreview(id);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                section === id
                  ? "border-mint/60 bg-mint/15 text-mint"
                  : "border-white/12 bg-white/[0.03] text-white/60 hover:border-mint/40 hover:text-white"
              }`}
            >
              {SECTION_NAMES[id]}
            </button>
          ))}
        </div>
      </header>

      <div
        className={`grid min-h-0 flex-1 gap-4 ${
          wide ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)]"
        }`}
      >
        {/* ── The editor ── */}
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0A1310]">
          {target ? (
            <>
              {LIVE_TARGETS[section ?? ""]?.length > 1 ? (
                <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-white/8 p-3">
                  {LIVE_TARGETS[section ?? ""].map((href) => (
                    <button
                      key={href}
                      type="button"
                      onClick={() => setTarget(href)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                        target === href
                          ? "bg-mint/15 text-mint"
                          : "text-white/50 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {LABEL.get(href) ?? href}
                    </button>
                  ))}
                </div>
              ) : null}
              <iframe
                key={`${target}-${savedAt}`}
                src={`${target}?bare=1`}
                title="Section editor"
                className="min-h-0 flex-1 border-0 bg-[#07100D]"
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <p className="font-display text-lg font-bold text-white">
                Pick a section
              </p>
              <p className="max-w-xs text-sm text-white/40">
                Click anything in the preview, or use the buttons above. The editor
                for that section opens here.
              </p>
            </div>
          )}
        </section>

        {/* ── The site ── */}
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white">
          <iframe
            ref={preview}
            src="/?edit=1"
            title="Site preview"
            className="min-h-0 flex-1 border-0"
          />
        </section>
      </div>
    </div>
  );
}
