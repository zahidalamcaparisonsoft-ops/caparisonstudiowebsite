"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_GROUPS } from "./nav";

/**
 * Grouped navigation.
 *
 * Seventeen flat links gave no sense of what any of them changed. These are
 * grouped by where the edit shows up, and the homepage group is in scroll
 * order — you find the thing under the headline by counting down, not by
 * guessing our word for it.
 */
export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // The group containing the current page starts open; the rest stay shut.
  const [open, setOpen] = useState<string[]>(() => {
    const current = NAV_GROUPS.find((g) => g.items.some((i) => i.href === pathname));
    return current ? [current.id] : ["page"];
  });

  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/admin"
        onClick={onNavigate}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
          pathname === "/admin"
            ? "bg-mint/10 font-semibold text-mint"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        }`}
      >
        Overview
      </Link>

      {NAV_GROUPS.map((group) => {
        const isOpen = open.includes(group.id);
        return (
          <div key={group.id} className="mt-2">
            <button
              type="button"
              onClick={() => toggle(group.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
            >
              <span
                aria-hidden="true"
                className={`text-[10px] text-white/30 transition-transform ${isOpen ? "rotate-90" : ""}`}
              >
                ▶
              </span>
              {/* The caption lives on the Overview page — in a column this
                  narrow it wraps to three lines and reads as clutter. */}
              <span className="flex-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                {group.title}
              </span>
              <span className="font-mono text-[10px] text-white/25">{group.items.length}</span>
            </button>

            {isOpen ? (
              <ul className="ml-[7px] mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                {group.items.map((item, i) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch
                        onClick={onNavigate}
                        className={`flex items-baseline gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                          active
                            ? "bg-mint/10 font-semibold text-mint"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {group.id === "page" ? (
                          <span className="font-mono text-[10px] text-white/25">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        ) : null}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
