"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/#work", label: "Work" },
  { href: "/#journey", label: "Process" },
  { href: "/#story", label: "Studio" },
  { href: "/#pricing", label: "Pricing" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page while the mobile sheet is open.
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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "border-b border-white/10 bg-black/75 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/logo-mark.png"
            alt=""
            width={34}
            height={36}
            priority
            className="h-8 w-auto"
          />
          <Image
            src="/logo-text.png"
            alt="Caparison Studio"
            width={820}
            height={245}
            priority
            className="hidden h-4 w-auto sm:block"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <span className="h-5 w-px bg-white/15" />
          <Link
            href="/#onboarding"
            className="rounded-full bg-mint px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_24px_-4px_rgba(27,237,172,.6)] transition-all hover:bg-mint-bright hover:shadow-[0_0_36px_-2px_rgba(27,237,172,.85)]"
          >
            Start a project
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 md:hidden"
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
      </div>

      {/* Mobile sheet. The original template had no mobile layout at all. */}
      <div
        className={`fixed inset-0 top-0 z-40 bg-black/96 backdrop-blur-2xl transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col justify-center gap-2 px-8">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/8 py-5 font-display text-3xl font-bold text-white transition-transform duration-500"
              style={{
                transform: open ? "none" : "translateY(14px)",
                opacity: open ? 1 : 0,
                transitionDelay: `${i * 55}ms`,
              }}
            >
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
