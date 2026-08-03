"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { browserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await browserClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.replace(params.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-7"
    >
      <h1 className="font-display text-xl font-extrabold text-white">
        Caparison <span className="text-mint">admin</span>
      </h1>
      <p className="mt-1 text-sm text-white/45">Sign in to manage the site.</p>

      <label className="mt-6 block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
          Email
        </span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/12 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-mint/60"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
          Password
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-white/12 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-mint/60"
        />
      </label>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-amber-400">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-full bg-mint py-3 text-sm font-bold text-black transition-colors hover:bg-mint-bright disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07100D] px-5">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
