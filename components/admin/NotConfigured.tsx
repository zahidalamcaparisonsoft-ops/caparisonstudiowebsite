import { MISSING_ENV_VARS } from "@/lib/supabase/env";

/** Shown instead of a 500 when the Supabase environment is not set. */
export default function NotConfigured() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07100D] px-5">
      <div className="w-full max-w-lg rounded-2xl border border-amber-400/30 bg-amber-400/5 p-7">
        <h1 className="font-display text-xl font-extrabold text-white">
          Admin is not configured
        </h1>
        <p className="mt-2 text-sm text-white/60">
          This deployment has no Supabase credentials, so there is nothing to
          sign in to. Add these in your hosting project&apos;s environment
          variables, then redeploy:
        </p>
        <ul className="mt-4 flex flex-col gap-1.5">
          {MISSING_ENV_VARS.map((v) => (
            <li
              key={v}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-mint"
            >
              {v}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-white/40">
          The first two are read by the browser and are baked in at build time,
          so a redeploy is required — setting them on a running deployment is
          not enough. Values are in your local <code>.env.local</code>.
        </p>
      </div>
    </main>
  );
}
