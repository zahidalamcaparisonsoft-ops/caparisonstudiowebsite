"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ALL_ITEMS } from "./nav";

/**
 * Shared header for every editor.
 *
 * Looks its own entry up in the nav map, so each page states what it changes on
 * the public site and links straight to that section — an editor that does not
 * say where its effect lands leaves you guessing.
 */
export function EditorHeader({
  title,
  description,
  status,
  dirty,
  children,
}: {
  title: string;
  description?: string;
  status?: string | null;
  dirty?: boolean;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const entry = ALL_ITEMS.find((i) => i.href === pathname);

  return (
    <header className="sticky top-0 z-20 -mx-5 mb-6 border-b border-white/8 bg-[#07100D]/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold text-white">{title}</h1>
          <p className="mt-1 text-sm text-white/45">
            {description ?? entry?.blurb}
          </p>
          {entry?.anchor ? (
            <Link
              href={`/#${entry.anchor}`}
              target="_blank"
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-mint hover:text-mint-bright"
            >
              See this section on the site ↗
            </Link>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {status ? (
            <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-semibold text-mint">
              {status}
            </span>
          ) : dirty ? (
            <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
              Unsaved changes
            </span>
          ) : null}
          {children}
        </div>
      </div>
    </header>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mb-4 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200"
    >
      {message}
    </p>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-mint px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-mint-bright disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}
