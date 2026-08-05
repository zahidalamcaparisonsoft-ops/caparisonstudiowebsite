"use client";

import { useMemo, useState } from "react";
import {
  ADDONS,
  CADENCES,
  PROJECT_TYPES,
  buildQuote,
  formatUSD,
  type CadenceId,
  type TypeId,
} from "@/lib/quote";

const STEPS = ["Project type", "Volume", "Extras", "Details"];

export type BriefCopy = { heading: string; subhead: string; note: string };
type TypeRow = { id: string; label: string; copy: string; rate: number; firstCut: number };
type CadenceRow = { id: string; label: string; perMonth: number };
type AddonRow = { id: string; label: string; copy: string; price: number };

type Status = "idle" | "sending" | "sent" | "error";

export default function Onboarding({
  copy,
  types,
  cadences,
  addonList,
}: {
  copy?: BriefCopy;
  types?: TypeRow[];
  cadences?: CadenceRow[];
  addonList?: AddonRow[];
}) {
  const TYPES = types?.length ? types : PROJECT_TYPES;
  const CADS = cadences?.length ? cadences : CADENCES;
  const ADDS = addonList?.length ? addonList : ADDONS;
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string>("yt");
  const [cadence, setCadence] = useState<string>("weekly");
  const [addons, setAddons] = useState<string[]>(["shorts"]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [links, setLinks] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const quote = useMemo(
    () => buildQuote(type as TypeId, cadence as CadenceId, addons),
    [type, cadence, addons],
  );

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailValid && name.trim().length > 1;

  const toggleAddon = (id: string) =>
    setAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );

  async function submit() {
    if (!canSubmit || status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          type,
          cadence,
          addons,
          links,
          notes,
          quote,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  const progress = status === "sent" ? 100 : ((step + 1) / STEPS.length) * 100;

  return (
    <section
      id="onboarding"
      className="scene relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-12 [scroll-snap-align:center]"
    >
      <span
        aria-hidden="true"
        className="orb left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 bg-mint/20"
      />

      <div className="shell">
        <div className="relative mx-auto w-full max-w-4xl">
        <div data-reveal="1" className="text-center">
          <h2 className="h-mid font-display font-extrabold text-ink">
            {copy?.heading ?? "Four questions. Two minutes."}
          </h2>
          <p className="mt-4 text-base text-body">
            {copy?.subhead ?? "You'll see the price before you send it, and hear back today."}
          </p>
        </div>

        <div
          data-reveal="1"
          className="mt-8 overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-b from-white to-paper-2 shadow-[0_40px_90px_-50px_rgba(5,30,24,.45)]"
        >
          {/* Step indicator */}
          <ol className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/8 px-5 py-4 sm:px-8">
            {STEPS.map((label, i) => {
              const done = status === "sent" || i < step;
              const current = status !== "sent" && i === step;
              return (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] transition-colors ${
                      done
                        ? "bg-mint text-ink"
                        : current
                          ? "border border-brand text-brand"
                          : "border border-ink/20 text-muted"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    className={`text-xs transition-colors ${
                      current ? "font-semibold text-ink" : "text-muted"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="grid gap-0 md:grid-cols-[1.35fr_.65fr]">
            {/* Question pane */}
            <div className="px-5 py-6 sm:px-8">
              {status === "sent" ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-ink">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">
                    Brief sent.
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-body">
                    We&apos;ll reply to {email} today confirming a first cut by{" "}
                    <strong className="text-brand">{quote.firstCutDate}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setStep(0);
                    }}
                    className="mt-7 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/50 hover:bg-mint/10"
                  >
                    Send another brief
                  </button>
                </div>
              ) : (
                <>
                  {step === 0 && (
                    <fieldset>
                      <legend className="font-display text-xl font-bold text-ink">
                        What are we cutting?
                      </legend>
                      <p className="mt-2 text-sm text-body">
                        Pick the format. You can change this per project later.
                      </p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {TYPES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setType(t.id)}
                            aria-pressed={type === t.id}
                            className={`rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                              type === t.id
                                ? "border-mint/60 bg-mint/10"
                                : "border-ink/10 bg-white hover:border-brand/40 hover:bg-mint/10"
                            }`}
                          >
                            <span className="block text-sm font-bold text-ink">
                              {t.label}
                            </span>
                            <span className="mt-1 block text-xs leading-snug text-muted">
                              {t.copy}
                            </span>
                            <span className="mt-3 block font-mono text-[11px] text-brand">
                              from {formatUSD(t.rate)}/video
                            </span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {step === 1 && (
                    <fieldset>
                      <legend className="font-display text-xl font-bold text-ink">
                        How often do you publish?
                      </legend>
                      <p className="mt-2 text-sm text-body">
                        Higher volume lowers the per-video rate.
                      </p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {CADS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCadence(c.id)}
                            aria-pressed={cadence === c.id}
                            className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                              cadence === c.id
                                ? "border-mint/60 bg-mint/10"
                                : "border-ink/10 bg-white hover:border-brand/40 hover:bg-mint/10"
                            }`}
                          >
                            <span>
                              <span className="block text-sm font-bold text-ink">
                                {c.label}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted">
                                {c.perMonth} video{c.perMonth > 1 ? "s" : ""} / month
                              </span>
                            </span>
                            {c.perMonth >= 4 ? (
                              <span className="shrink-0 rounded-full border border-brand/35 px-2 py-0.5 font-mono text-[10px] text-brand">
                                −{Math.round((1 - (c.perMonth >= 22 ? 0.7 : c.perMonth >= 8 ? 0.82 : 0.9)) * 100)}%
                              </span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {step === 2 && (
                    <fieldset>
                      <legend className="font-display text-xl font-bold text-ink">
                        Anything on top?
                      </legend>
                      <p className="mt-2 text-sm text-body">
                        All optional. Prices are per video.
                      </p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {ADDS.map((a) => {
                          const on = addons.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => toggleAddon(a.id)}
                              aria-pressed={on}
                              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                                on
                                  ? "border-mint/60 bg-mint/10"
                                  : "border-ink/10 bg-white hover:border-brand/40 hover:bg-mint/10"
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                  on ? "border-brand bg-mint" : "border-ink/25"
                                }`}
                              >
                                {on ? (
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                                    <path
                                      d="M1 4l2.5 2.5L9 1"
                                      stroke="#000"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : null}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-bold text-ink">
                                  {a.label}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted">
                                  {a.copy}
                                </span>
                                <span className="mt-2 block font-mono text-[11px] text-brand">
                                  +{formatUSD(a.price)}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}

                  {step === 3 && (
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink">
                        Where do we send the quote?
                      </h3>
                      <p className="mt-2 text-sm text-body">
                        Paste a Drive, Dropbox or Frame.io link if you have footage ready.
                      </p>
                      <div className="mt-6 grid gap-4">
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold tracking-normal text-body">
                            Your name
                          </span>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            className="rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-brand"
                            placeholder="Alex Rivera"
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold tracking-normal text-body">
                            Email
                          </span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            aria-invalid={email.length > 0 && !emailValid}
                            className="rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-brand"
                            placeholder="alex@company.com"
                          />
                          {email.length > 0 && !emailValid ? (
                            <span className="text-xs text-amber-400">
                              That doesn&apos;t look like an email address.
                            </span>
                          ) : null}
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold tracking-normal text-body">
                            Footage link <span className="text-muted">(optional)</span>
                          </span>
                          <input
                            type="url"
                            value={links}
                            onChange={(e) => setLinks(e.target.value)}
                            className="rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-brand"
                            placeholder="https://drive.google.com/…"
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold tracking-normal text-body">
                            Anything we should know?{" "}
                            <span className="text-muted">(optional)</span>
                          </span>
                          <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-brand"
                            placeholder="References, style notes, things that went wrong last time."
                          />
                        </label>
                      </div>
                      {error ? (
                        <p role="alert" className="mt-4 text-sm text-amber-400">
                          {error}
                        </p>
                      ) : null}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Live quote pane — visible from the first click. */}
            <aside className="border-t border-ink/8 bg-white px-5 py-6 sm:px-8 md:border-l md:border-t-0">
              <span className="font-mono text-[11px] tracking-[0.04em] text-brand">
                Your estimate
              </span>

              <div className="mt-5">
                <span className="block font-display text-4xl font-extrabold leading-none text-ink">
                  {formatUSD(quote.monthly)}
                </span>
                <span className="mt-1.5 block text-xs text-muted">
                  per month · {quote.perMonth} video{quote.perMonth > 1 ? "s" : ""}
                </span>
              </div>

              <dl className="mt-6 flex flex-col gap-3 border-t border-ink/8 pt-5 text-xs">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Per video</dt>
                  <dd className="font-mono text-ink">{formatUSD(quote.perVideo)}</dd>
                </div>
                {quote.discount > 0 ? (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted">Volume discount</dt>
                    <dd className="font-mono text-brand">−{quote.discount}%</dd>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">First cut by</dt>
                  <dd className="font-mono text-brand">{quote.firstCutDate}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Revisions</dt>
                  <dd className="font-mono text-ink">2 rounds · 34h</dd>
                </div>
              </dl>

              <p className="mt-6 text-[11px] leading-relaxed text-muted">
                {copy?.note ??
                  "Indicative only. We confirm the final number after seeing the footage — it has never gone up after a brief."}
              </p>
            </aside>
          </div>

          {/* Nav */}
          {status !== "sent" ? (
            <div className="flex items-center gap-4 border-t border-ink/8 px-5 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-sm font-semibold text-body transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Back
              </button>

              <div className="relative ml-auto hidden h-1 w-32 overflow-hidden rounded-full bg-ink/10 sm:block">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-mint transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="rounded-full bg-mint px-6 py-3 text-sm font-bold text-ink transition-all hover:bg-mint-bright"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit || status === "sending"}
                  className="rounded-full bg-mint px-6 py-3 text-sm font-bold text-ink transition-all hover:bg-mint-bright disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === "sending" ? "Sending…" : "Send brief →"}
                </button>
              )}
            </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
