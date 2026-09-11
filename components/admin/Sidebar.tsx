"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { INBOX, SECTIONS, SETTINGS } from "./nav";

/**
 * The panel's navigation.
 *
 * Three bands, in the order someone needs them: what has come in, the site
 * itself, and the settings nobody changes twice.
 *
 * The inbox is never collapsed — it is two links, and hiding the one part of
 * the panel that goes stale behind a disclosure is how a lead sits unanswered
 * for a week. The homepage is a numbered stack of sections that open one at a
 * time; the section you are working in opens itself, and the rest stay shut so
 * the column stays short enough to scan.
 */
export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const [open, setOpen] = useState<string[]>(() => {
    const current = SECTIONS.find((s) =>
      s.items.some((i) => i.href === pathname),
    );
    return current ? [current.id] : [];
  });

  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const link = (href: string) =>
    `rounded-lg px-3 py-2 text-sm transition-colors ${
      pathname === href
        ? "bg-mint/10 font-semibold text-mint"
        : "text-white/60 hover:bg-white/5 hover:text-white"
    }`;

  const heading =
    "mt-5 px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30";

  return (
    <nav className="flex flex-col gap-1">
      <Link href="/admin" onClick={onNavigate} className={link("/admin")}>
        Dashboard
      </Link>

      <Link
        href="/admin/live"
        onClick={onNavigate}
        className={`flex items-center gap-2 ${link("/admin/live")}`}
      >
        <span aria-hidden="true">◧</span>
        Edit live
      </Link>

      {/* ── what has come in ── */}
      <p className={heading}>Inbox</p>
      {INBOX.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={link(item.href)}
        >
          {item.label}
        </Link>
      ))}

      {/* ── the site ── */}
      <p className={heading}>Homepage</p>
      {SECTIONS.map((section, i) => {
        const isOpen = open.includes(section.id);
        const holdsCurrent = section.items.some((x) => x.href === pathname);
        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => toggle(section.id)}
              aria-expanded={isOpen}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5 ${
                holdsCurrent && !isOpen ? "text-mint" : "text-white/70"
              }`}
            >
              <span className="font-mono text-[10px] text-white/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-sm">{section.label}</span>
              <span
                aria-hidden="true"
                className={`text-[10px] text-white/30 transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>

            {isOpen ? (
              <ul className="ml-[19px] mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      onClick={onNavigate}
                      className={`block ${link(item.href)}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}

      {/* ── everywhere else ── */}
      <p className={heading}>Settings</p>
      {SETTINGS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={link(item.href)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
