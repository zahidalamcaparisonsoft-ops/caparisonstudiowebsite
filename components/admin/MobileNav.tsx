"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "./Sidebar";
import SignOut from "./SignOut";

/** Sheet nav for narrow screens — the same grouping as the sidebar. */
export default function MobileNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin" className="font-display text-sm font-extrabold text-white">
          Caparison <span className="text-mint">admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white"
        >
          {open ? "Close" : "Sections"}
        </button>
      </div>

      {open ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <Sidebar onNavigate={() => setOpen(false)} />
          <div className="mt-3 flex items-center justify-between border-t border-white/8 px-3 pt-3">
            <span className="truncate text-[11px] text-white/30">{email}</span>
            <SignOut />
          </div>
        </div>
      ) : null}
    </div>
  );
}
