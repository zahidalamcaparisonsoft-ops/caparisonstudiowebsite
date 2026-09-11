import { supabaseEnv } from "@/lib/supabase/env";
import PageMap from "@/components/admin/PageMap";

export default function AdminHome() {
  // The layout shows the misconfiguration notice, but this page still executes
  // to produce `children`, so it needs the same guard.
  if (!supabaseEnv()) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-white">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-white/45">
        Anything waiting on a reply first, then your homepage top to bottom.
      </p>
      {/* Counts arrive after paint, so the page is usable immediately rather
          than waiting on a round trip to the database before rendering. */}
      <PageMap />
    </div>
  );
}
