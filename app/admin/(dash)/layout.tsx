import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import MobileNav from "@/components/admin/MobileNav";
import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/supabase/server";
import SignOut from "@/components/admin/SignOut";
import NotConfigured from "@/components/admin/NotConfigured";
import { supabaseEnv } from "@/lib/supabase/env";
import BareMode from "@/components/admin/BareMode";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Never prerender: every admin route depends on the caller's session.
export const dynamic = "force-dynamic";

/*
 * This layout requires a session, so /admin/login must NOT live under it —
 * otherwise the login page redirects itself and the browser loops. It sits in
 * the (dash) route group; login stays outside at app/admin/login.
 */

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Say what is wrong rather than throwing a 500 out of the client constructor.
  if (!supabaseEnv()) return <NotConfigured />;

  const supabase = await sessionClient();

  // One round trip for identity AND authorisation. Calling auth.getUser() and
  // then selecting from admin_users cost two trips to the database region on
  // every single admin page load.
  //
  // This is not weaker: PostgREST verifies the JWT signature before the
  // function runs, so auth.uid() inside it is as trustworthy as asking the auth
  // server — and the database still enforces is_admin() on every write.
  const { data } = await supabase.rpc("whoami");
  const me = (data ?? {}) as { uid?: string | null; email?: string; is_admin?: boolean };

  if (!me.uid) redirect("/admin/login");

  if (!me.is_admin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-extrabold text-white">
          This account has no admin access.
        </h1>
        <p className="max-w-sm text-sm text-white/50">
          Signed in as {me.email}. Ask an existing admin to add you.
        </p>
        <SignOut />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#07100D]">
      <BareMode />
      <aside data-admin-chrome className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/8 p-4 lg:flex">
        <Link href="/admin" className="px-3 font-display text-sm font-extrabold text-white">
          Caparison <span className="text-mint">admin</span>
        </Link>
        <div className="mt-5 flex-1 overflow-y-auto pr-1">
          <Sidebar />
        </div>
        <div className="mt-4 border-t border-white/8 pt-3">
          <p className="truncate px-3 text-[11px] text-white/30">{me.email}</p>
          <div className="mt-2 flex flex-col gap-1.5 px-3">
            <Link href="/" target="_blank" className="text-xs text-white/50 hover:text-mint">
              View site ↗
            </Link>
            <SignOut />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <div data-admin-chrome>
          <MobileNav email={me.email ?? ""} />
        </div>

        {children}
      </main>
    </div>
  );
}
