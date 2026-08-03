import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps the Supabase session cookie fresh and gates /admin.
 *
 * (Next 16 renamed the `middleware` convention to `proxy`.)
 *
 * NB: `NextResponse.next({ request })` — the shape the Supabase SSR docs still
 * show for middleware — makes this emit a same-URL redirect under the proxy
 * convention, which loops the browser until it gives up. A plain
 * `NextResponse.next()` with refreshed cookies written onto it behaves.
 *
 * The redirect here is convenience, not security: every admin page checks the
 * session itself, and the database enforces `is_admin()` on every write. This
 * file alone is never the thing standing between a stranger and the data.
 */
export async function proxy(request: NextRequest) {
  // Cookies Supabase wants to refresh onto the response, if any.
  const refreshed: { name: string; value: string; options?: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const c of list) refreshed.push(c as (typeof refreshed)[number]);
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Returning a NextResponse.next() here makes the proxy convention emit a
  // same-URL redirect, which loops the browser. Continue by returning nothing,
  // and only build a response when there are cookies to write.
  if (!refreshed.length) return;

  const response = NextResponse.next();
  for (const { name, value, options } of refreshed) {
    response.cookies.set(name, value, options as never);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
