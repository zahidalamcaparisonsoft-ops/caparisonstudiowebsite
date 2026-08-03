"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useActiveSection } from "@/lib/hooks";

/**
 * Floating capsule navigation.
 *
 * A centred pill that hovers over the hero rather than a full-width bar:
 * logo disc on the left, icon + label items, an inner filled pill marking the
 * section you are actually looking at, a hairline divider, then the CTA.
 *
 * The active pill is driven by scroll position (IntersectionObserver), so it
 * tracks where you are rather than only what you last clicked.
 */

type NavItem = { id: string; href: string; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  {
    id: "work",
    href: "/#work",
    label: "Work",
    icon: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2.5" strokeWidth="1.7" />
        <path d="M2 9h20M7.5 4v5M16.5 4v5" strokeWidth="1.7" />
      </>
    ),
  },
  {
    id: "anatomy",
    href: "/#anatomy",
    label: "The cut",
    icon: (
      <>
        <path d="M4 6v12M4 12h9" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="16" cy="12" r="3.4" strokeWidth="1.7" />
        <path d="M19.4 12H21" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "journey",
    href: "/#journey",
    label: "Process",
    icon: (
      <>
        <circle cx="5.5" cy="6" r="2.5" strokeWidth="1.7" />
        <circle cx="18.5" cy="18" r="2.5" strokeWidth="1.7" />
        <path
          d="M8 6h6a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h6"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: "pricing",
    href: "/#pricing",
    label: "Pricing",
    icon: (
      <>
        <path d="M12 2v20" strokeWidth="1.7" strokeLinecap="round" />
        <path
          d="M17 6.5H9.8a3.3 3.3 0 0 0 0 6.6h4.4a3.3 3.3 0 0 1 0 6.6H6"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </>
    ),
  },
];

/* "top" is tracked but has no nav item, so while you are still on the hero no
   pill is lit — otherwise the hook falls back to the first id and "Work"
   appears active before you have reached it. */
const IDS = ["top", ...NAV.map((n) => n.id)];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Section tracking only means anything on the long-scroll homepage.
  const active = useActiveSection(useMemo(() => (isHome ? IDS : []), [isHome]));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-5 sm:px-5">
      <nav
        /* relative z-50 is load-bearing: backdrop-blur creates a stacking
           context, which would otherwise trap the close button beneath the
           mobile sheet and leave no way to dismiss it. */
        className={`pointer-events-auto relative z-50 flex items-center gap-1 rounded-full border p-1.5 shadow-[0_18px_50px_-20px_rgba(0,0,0,.9)] transition-colors duration-500 ${
          scrolled
            ? "border-white/12 bg-black/80 backdrop-blur-2xl"
            : "border-white/8 bg-black/55 backdrop-blur-xl"
        }`}
      >
        {/* Logo disc */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Caparison Studio — home"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] transition-colors hover:bg-white/12"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={330}
            height={345}
            priority
            className="h-6 w-auto"
          />
        </Link>

        {/* Nav items — desktop */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const isActive = isHome && active === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? "bg-white/[0.11] text-white"
                      : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={isActive ? "text-mint" : "text-current"}
                  >
                    {item.icon}
                  </svg>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <span aria-hidden="true" className="mx-2 hidden h-6 w-px bg-white/12 lg:block" />

        {/* Text CTAs — weight carries the hierarchy, as in the reference. */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link
            href="/#work"
            className="rounded-full px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            See work
          </Link>
          <Link
            href="/#onboarding"
            className="rounded-full px-5 py-2.5 text-sm font-bold text-mint transition-colors hover:text-mint-bright"
          >
            Start a project
          </Link>
        </div>

        {/* Compact CTA + menu — below lg */}
        <Link
          href="/#onboarding"
          className="rounded-full px-4 py-2.5 text-sm font-bold text-mint lg:hidden"
        >
          Start
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="relative z-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] transition-colors hover:bg-white/12 lg:hidden"
        >
          <span className="flex flex-col gap-[5px]">
            <span
              className={`block h-[1.5px] w-4 bg-white transition-transform duration-300 ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
            />
            <span
              className={`block h-[1.5px] w-4 bg-white transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-[1.5px] w-4 bg-white transition-transform duration-300 ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile sheet */}
      <div
        className={`fixed inset-0 z-40 bg-black/96 backdrop-blur-2xl transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col justify-center gap-1 px-8">
          {NAV.map((item, i) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 border-b border-white/8 py-5 font-display text-3xl font-bold text-white transition-all duration-500"
              style={{
                transform: open ? "none" : "translateY(14px)",
                opacity: open ? 1 : 0,
                transitionDelay: `${i * 55}ms`,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-mint"
              >
                {item.icon}
              </svg>
              {item.label}
            </Link>
          ))}
          <Link
            href="/#onboarding"
            onClick={() => setOpen(false)}
            className="mt-8 rounded-full bg-mint px-6 py-4 text-center text-base font-bold text-black"
          >
            Start a project →
          </Link>
        </nav>
      </div>
    </header>
  );
}
