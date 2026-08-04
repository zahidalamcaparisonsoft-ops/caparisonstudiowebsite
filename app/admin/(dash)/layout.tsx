import Link from "next/link";
import { redirect } from "next/navigation";
import { sessionClient } from "@/lib/supabase/server";
import SignOut from "@/components/admin/SignOut";
import NotConfigured from "@/components/admin/NotConfigured";
import { supabaseEnv } from "@/lib/supabase/env";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Never prerender: every admin route depends on the caller's session.
export const dynamic = "force-dynamic";

/*
 * This layout requires a session, so /admin/login must NOT live under it —
 * otherwise the login page redirects itself and the browser loops. It sits in
 * the (dash) route group; login stays outside at app/admin/login.
 */

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/trusted", label: "Trusted by" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/clips", label: "Deliverables" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/process", label: "Process" },
  { href: "/admin/onboarding", label: "Brief copy" },
  { href: "/admin/project-types", label: "Project types" },
  { href: "/admin/cadences", label: "Cadences" },
  { href: "/admin/addons", label: "Add-ons" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/settings", label: "Site details" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Say what is wrong rather than throwing a 500 out of the client constructor.
  if (!supabaseEnv()) return <NotConfigured />;

  const supabase = await sessionClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware already redirects, but a page must never rely on it alone.
  if (!user) redirect("/admin/login");

  // Signed in is not the same as authorised.
  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-extrabold text-white">
          This account has no admin access.
        </h1>
        <p className="max-w-sm text-sm text-white/50">
          Signed in as {user.email}. Ask an existing admin to add you.
        </p>
        <SignOut />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#07100D]">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/8 p-4 lg:flex">
        <Link href="/admin" className="font-display text-sm font-extrabold text-white">
          Caparison <span className="text-mint">admin</span>
        </Link>
        <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-white/8 pt-3">
          <p className="truncate text-[11px] text-white/30">{user.email}</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <Link href="/" className="text-xs text-white/50 hover:text-mint">
              View site ↗
            </Link>
            <SignOut />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="shrink-0 rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/70"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        {children}
      </main>
    </div>
  );
}
