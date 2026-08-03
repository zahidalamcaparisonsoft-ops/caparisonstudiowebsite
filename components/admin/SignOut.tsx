"use client";

import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/client";

export default function SignOut() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await browserClient().auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
      className="self-start text-xs text-white/50 transition-colors hover:text-amber-300"
    >
      Sign out
    </button>
  );
}
