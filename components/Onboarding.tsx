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
      className="scene relative overflow-hidden px-5 py-24 sm:px-8 md:py-32"
    >
      <span
        aria-hidden="true"
        className="orb left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 bg-mint/10"
      />

      <div className="relative mx-auto max-w-4xl">
        <div data-reveal="1" className="text-center">
          <h2 className="h-mid font-display font-extrabold text-white">
            {copy?.heading ?? "Four questions. Two minutes."}
          </h2>
          <p className="mt-4 text-base text-white/55">
            {copy?.subhead ?? "You'll see the price before you send it, and hear back today."}
          </p>
        </div>

        <div
          data-reveal="1"
          className="mt-10 overflow-hidden rounded-3xl border border-mint/25 bg-gradient-to-b from-white/[0.05] to-black/60 backdrop-blur-xl"
        >
          {/* Step indicator */}
          <ol className="flex flex-wrap gap-x-6 gap-y-2 border-b border-white/8 px-5 py-4 sm:px-8">
            {STEPS.map((label, i) => {
              const done = status === "sent" || i < step;
              const current = status !== "sent" && i === step;
              return (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] transition-colors ${
                      done
                        ? "bg-mint text-black"
                        : current
                          ? "border border-mint text-mint"
                          : "border border-white/20 text-white/35"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    className={`text-xs transition-colors ${
                      current ? "font-semibold text-white" : "text-white/40"
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
            <div className="px-5 py-7 sm:px-8">
              {status === "sent" ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-black">
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
                  <h3 className="mt-5 font-display text-2xl font-extrabold text-white">
                    Brief sent.
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                    We&apos;ll reply to {email} today confirming a first cut by{" "}
                    <strong className="text-mint">{quote.firstCutDate}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setStep(0);
                    }}
                    className="mt-7 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-mint/40 hover:bg-white/5"
                  >
                    Send another brief
                  </button>
                </div>
              ) : (
                <>
                  {step === 0 && (
                    <fieldset>
                      <legend className="font-display text-xl font-bold text-white">
                        What are we cutting?
                      </legend>
                      <p className="mt-2 text-sm text-white/50">
                        Pick the format. You can change this per project later.
                      </p>
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {TYPES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setType(t.id)}
                            aria-pressed={type === t.id}
                            className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                              type === t.id
                                ? "border-mint/60 bg-mint/10"
                                : "border-white/10 bg-white/[0.02] hover:border-mint/30 hover:bg-white/[0.05]"
                            }`}
                          >
                            <span className="block text-sm font-bold text-white">
                              {t.label}
                            </span>
                            <span className="mt-1 block text-xs leading-snug text-white/45">
                              {t.copy}
                            </span>
                            <span className="mt-3 block font-mono text-[11px] text-mint">
                              from {formatUSD(t.rate)}/video
                            </span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {step === 1 && (
                    <fieldset>
                      <legend className="font-display text-xl font-bold text-white">
                        How often do you publish?
                      </legend>
                      <p className="mt-2 text-sm text-white/50">
                        Higher volume lowers the per-video rate.
                      </p>
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {CADS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCadence(c.id)}
                            aria-pressed={cadence === c.id}
                            className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${
                              cadence === c.id
                                ? "border-mint/60 bg-mint/10"
                                : "border-white/10 bg-white/[0.02] hover:border-mint/30 hover:bg-white/[0.05]"
                            }`}
                          >
                            <span>
                              <span className="block text-sm font-bold text-white">
                                {c.label}
                              </span>
                              <span className="mt-0.5 block text-xs text-white/45">
                                {c.perMonth} video{c.perMonth > 1 ? "s" : ""} / month
                              </span>
                            </span>
                            {c.perMonth >= 4 ? (
                              <span className="shrink-0 rounded-full border border-mint/35 px-2 py-0.5 font-mono text-[10px] text-mint">
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
                      <legend className="font-display text-xl font-bold text-white">
                        Anything on top?
                      </legend>
                      <p className="mt-2 text-sm text-white/50">
                        All optional. Prices are per video.
                      </p>
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {ADDS.map((a) => {
                          const on = addons.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => toggleAddon(a.id)}
                              aria-pressed={on}
                              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
                                on
                                  ? "border-mint/60 bg-mint/10"
                                  : "border-white/10 bg-white/[0.02] hover:border-mint/30 hover:bg-white/[0.05]"
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                  on ? "border-mint bg-mint" : "border-white/25"
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
                                <span className="block text-sm font-bold text-white">
                                  {a.label}
                                </span>
                                <span className="mt-0.5 block text-xs text-white/45">
                                  {a.copy}
                                </span>
                                <span className="mt-2 block font-mono text-[11px] text-mint">
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
                      <h3 className="font-display text-xl font-bold text-white">
                        Where do we send the quote?
                      </h3>
                      <p className="mt-2 text-sm text-white/50">
                        Paste a Drive, Dropbox or Frame.io link if you have footage ready.
                      </p>
                      <div className="mt-6 grid gap-4">
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                            Your name
                          </span>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            className="rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-mint/60"
                            placeholder="Alex Rivera"
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                            Email
                          </span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            aria-invalid={email.length > 0 && !emailValid}
                            className="rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-mint/60"
                            placeholder="alex@company.com"
                          />
                          {email.length > 0 && !emailValid ? (
                            <span className="text-xs text-amber-400">
                              That doesn&apos;t look like an email address.
                            </span>
                          ) : null}
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                            Footage link <span className="text-white/30">(optional)</span>
                          </span>
                          <input
                            type="url"
                            value={links}
                            onChange={(e) => setLinks(e.target.value)}
                            className="rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-mint/60"
                            placeholder="https://drive.google.com/…"
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                            Anything we should know?{" "}
                            <span className="text-white/30">(optional)</span>
                          </span>
                          <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-mint/60"
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
            <aside className="border-t border-white/8 bg-black/40 px-5 py-7 sm:px-8 md:border-l md:border-t-0">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint">
                Your estimate
              </span>

              <div className="mt-5">
                <span className="block font-display text-4xl font-extrabold leading-none text-white">
                  {formatUSD(quote.monthly)}
                </span>
                <span className="mt-1.5 block text-xs text-white/45">
                  per month · {quote.perMonth} video{quote.perMonth > 1 ? "s" : ""}
                </span>
              </div>

              <dl className="mt-6 flex flex-col gap-3 border-t border-white/8 pt-5 text-xs">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/45">Per video</dt>
                  <dd className="font-mono text-white">{formatUSD(quote.perVideo)}</dd>
                </div>
                {quote.discount > 0 ? (
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-white/45">Volume discount</dt>
                    <dd className="font-mono text-mint">−{quote.discount}%</dd>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/45">First cut by</dt>
                  <dd className="font-mono text-mint">{quote.firstCutDate}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-white/45">Revisions</dt>
                  <dd className="font-mono text-white">2 rounds · 34h</dd>
                </div>
              </dl>

              <p className="mt-6 text-[11px] leading-relaxed text-white/30">
                {copy?.note ??
                  "Indicative only. We confirm the final number after seeing the footage — it has never gone up after a brief."}
              </p>
            </aside>
          </div>

          {/* Nav */}
          {status !== "sent" ? (
            <div className="flex items-center gap-4 border-t border-white/8 px-5 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-sm font-semibold text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Back
              </button>

              <div className="relative ml-auto hidden h-1 w-32 overflow-hidden rounded-full bg-white/10 sm:block">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-mint transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="rounded-full bg-mint px-6 py-3 text-sm font-bold text-black transition-all hover:bg-mint-bright"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit || status === "sending"}
                  className="rounded-full bg-mint px-6 py-3 text-sm font-bold text-black transition-all hover:bg-mint-bright disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === "sending" ? "Sending…" : "Send brief →"}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
