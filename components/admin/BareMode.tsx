"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Strips the admin's own navigation when a page is opened inside the live
 * editor's panel, where the surrounding chrome is already on screen.
 *
 * A layout is a server component and cannot read search params, so the class
 * goes on from the client and the CSS does the hiding.
 */
export default function BareMode() {
  const params = useSearchParams();
  const bare = params.get("bare") === "1";

  useEffect(() => {
    document.documentElement.classList.toggle("bare-admin", bare);
    return () => document.documentElement.classList.remove("bare-admin");
  }, [bare]);

  return null;
}
