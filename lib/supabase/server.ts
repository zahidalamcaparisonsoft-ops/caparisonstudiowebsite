import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Supabase clients for the server.
 *
 * `readClient` is anonymous and is what the public site uses — RLS grants it
 * SELECT on content and nothing else, so a leak of the anon key exposes only
 * what is already on the page.
 *
 * `sessionClient` carries the signed-in admin's cookies, so every write is
 * checked against `is_admin()` by the database rather than by us remembering to
 * check. The service role key is never used to satisfy a browser request.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Anonymous, read-only in practice. Safe for public pages. */
export function readClient() {
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

/** Carries the admin's session cookies; RLS enforces permissions. */
export async function sessionClient() {
  const store = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component — middleware refreshes instead.
        }
      },
    },
  });
}

/**
 * Bypasses RLS. Only for work that is not on behalf of a browser request:
 * one-off maintenance, or granting the very first admin. Never import this
 * into anything a visitor can reach.
 */
export function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(URL, key, { auth: { persistSession: false } });
}
