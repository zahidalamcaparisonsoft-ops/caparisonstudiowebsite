/**
 * Supabase connection details, or null when they are not configured.
 *
 * The clients throw if handed undefined, which turned a missing Vercel
 * environment variable into a bare 500 on every /admin route. Callers check
 * this first so the failure can say what is actually wrong.
 *
 * NB: NEXT_PUBLIC_* values are inlined at build time, so adding them to the
 * host requires a redeploy — setting them alone does not fix a running build.
 */
export type SupabaseEnv = { url: string; anon: string };

export function supabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return { url, anon };
}

export const MISSING_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
