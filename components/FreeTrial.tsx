"use client";

import { useRef, useState } from "react";
import type { TrialBand } from "@/lib/data";
import AccentHeading from "./AccentHeading";

/**
 * The free trial: the offer on the left, the application on the right.
 *
 * The lowest-friction ask on the page, which is why it sits after the process
 * and well before the brief — two forms next to each other is a choice nobody
 * wants to make.
 *
 * The form posts to /api/trial, which is the only way into the table: the
 * submissions hold strangers' email addresses, so nothing about this table is
 * reachable with the anon key that ships in this bundle.
 *
 * Errors are shown on the field that caused them. An alert says one thing at a
 * time, disappears when it is dismissed, and leaves the person hunting for
 * which box was wrong.
 */

const FIELDS = [
  { key: "name", label: "Name", type: "text", autoComplete: "name" },
  { key: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    key: "brand",
    label: "Brand / Channel",
    type: "text",
    autoComplete: "organization",
  },
  {
    key: "footage_url",
    label: "Footage link (Google Drive, Dropbox, etc.)",
    type: "url",
    autoComplete: "url",
  },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"] | "message";
type Values = Record<FieldKey, string>;
type Errors = Partial<Record<FieldKey, string>>;

const EMPTY: Values = {
  name: "",
  email: "",
  brand: "",
  footage_url: "",
  message: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please tell us your name.";
  if (!EMAIL.test(v.email.trim()))
    e.email = "That email address doesn't look right.";
  /* Everything else is optional. A trial application that arrives with a name
     and an address is one we can answer; demanding a footage link before we
     have said hello is how an application gets abandoned. */
  return e;
}

/* ------------------------------------------------------------------- icons */

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<string, React.ReactNode> = {
    film: (
      <>
        <rect x="3" y="4.5" width="18" height="15" rx="2.5" {...p} />
        <path d="M3 9.5h18M3 14.5h18M8 4.5v15M16 4.5v15" {...p} />
      </>
    ),
    shield: <path d="M12 3.2l7 2.8v5.2c0 4.3-2.9 7.7-7 9.6-4.1-1.9-7-5.3-7-9.6V6l7-2.8z" {...p} />,
    bolt: <path d="M13.2 2.8 5 13.4h5.4L10 21.2 18.6 10.4H13l.2-7.6z" {...p} />,
    upload: (
      <>
        <path d="M12 15.5V4.2M8 8l4-3.8L16 8" {...p} />
        <path d="M4.5 15v3.3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" {...p} />
      </>
    ),
    scissors: (
      <>
        <circle cx="6" cy="6.5" r="2.6" {...p} />
        <circle cx="6" cy="17.5" r="2.6" {...p} />
        <path d="M8.3 8.1 19 19M19 5 8.3 15.9" {...p} />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" {...p} />
        <circle cx="12" cy="12" r="3.1" {...p} />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.4" {...p} />
        <path d="M5 20v-1a4.5 4.5 0 0 1 4.5-4.5h5A4.5 4.5 0 0 1 19 19v1" {...p} />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" {...p} />
        <path d="m4 7.5 8 5.5 8-5.5" {...p} />
      </>
    ),
    channel: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" {...p} />
        <path d="M10.5 9.2 15 12l-4.5 2.8V9.2z" fill="currentColor" stroke="none" />
      </>
    ),
    link: (
      <>
        <path d="M10 13.8a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7l-1.3 1.3" {...p} />
        <path d="M14 10.2a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.3-1.3" {...p} />
      </>
    ),
    list: (
      <>
        <path d="M8.5 7h11M8.5 12h11M8.5 17h7" {...p} />
        <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" {...p} strokeWidth={2.4} />
      </>
    ),
    arrow: <path d="M1 7h15M10.5 1.5 16.5 7l-6 5.5" {...p} strokeWidth={2} />,
    check: <path d="M4.5 12.5 9.5 17.5 19.5 6.5" {...p} strokeWidth={2.2} />,
  };
  return (
    <svg
      viewBox={name === "arrow" ? "0 0 18 14" : "0 0 24 24"}
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

const POINT_ICONS = ["film", "shield", "bolt"];
const STEP_ICONS = ["upload", "scissors", "eye"];

/** A marker underline. Stroked with round caps, so it reads as drawn. */
function Swash({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 8.4C34 4.2 76 2.4 118 3.2c28 .5 54 2 79 4.6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Points the note at the form. */
function CurvedArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 92 78" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 5c24 3 50 15 66 36 6 8 10 17 12 27"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M70 60 84 70.5 89 54"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------- the section */

export default function FreeTrial({ band }: { band: TrialBand }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [failed, setFailed] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  /* Named as something a bot will want to fill in, hidden from everyone else.
     A submission that carries it is dropped server-side. */
  const trap = useRef<HTMLInputElement>(null);

  const set = (key: FieldKey, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    /* Clear the complaint as soon as they act on it, rather than making them
       submit again to find out whether it is fixed. */
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setFailed("");

    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: trap.current?.value ?? "" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        field?: FieldKey;
      };
      if (!res.ok) {
        /* Whatever they typed stays in the form. Losing a filled-in
           application to a failed request is how someone decides not to
           bother a second time. */
        if (data.field) setErrors({ [data.field]: data.error });
        else setFailed(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setFailed("Could not reach the studio. Please check your connection.");
    } finally {
      setPending(false);
    }
  }

  const field =
    "w-full rounded-xl border bg-paper-2 py-3.5 pl-11 pr-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:bg-white";

  return (
    <section
      id="free-trial"
      className="relative isolate overflow-hidden py-20 md:py-24"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(150deg, #F1FAF6 0%, #FFFFFF 45%, #EFF9F4 100%)",
        }}
      />
      {["-left-44 -top-56 h-[560px] w-[560px]", "-bottom-64 -right-44 h-[620px] w-[620px]"].map(
        (pos) => (
          <svg
            key={pos}
            aria-hidden="true"
            viewBox="0 0 400 400"
            fill="none"
            className={`pointer-events-none absolute -z-10 ${pos}`}
          >
            {[120, 160, 200, 240].map((r) => (
              <circle
                key={r}
                cx="200"
                cy="200"
                r={r}
                stroke="currentColor"
                className="text-brand/15"
                strokeWidth="1"
              />
            ))}
          </svg>
        ),
      )}

      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-start lg:gap-16">
        {/* ── the offer ── */}
        <div data-reveal="1" className="min-w-0">
          {band.eyebrow ? (
            <span className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white py-2 pl-2 pr-4 shadow-[0_2px_10px_rgba(6,40,30,0.06)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-deep">
                <svg width="9" height="10" viewBox="0 0 16 18" aria-hidden="true">
                  <path d="M15 9 1 17.66V.34L15 9Z" fill="#fff" />
                </svg>
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
                {band.eyebrow}
              </span>
            </span>
          ) : null}

          <h2 className="mt-6 font-display text-[clamp(2.1rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-ink">
            <AccentHeading text={band.heading} accent={band.headingAccent} />
          </h2>

          {band.subhead ? (
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-body sm:text-[17px]">
              {band.subhead}
            </p>
          ) : null}

          {/* The three points, divided by hairlines rather than boxed. */}
          {band.points.length ? (
            <ul className="mt-8 flex flex-wrap items-center gap-y-4">
              {band.points.map((point, i) => (
                <li
                  key={point}
                  className={`flex items-center gap-3 pr-6 ${
                    i > 0 ? "border-l border-ink/10 pl-6" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-pale text-brand">
                    <Icon name={POINT_ICONS[i % 3]} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="max-w-[7.5rem] text-[14px] font-semibold leading-tight text-ink">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {/* The steps. The dashed joins are drawn between the cards rather
              than on them, so a card can be rewritten without the line moving
              and the last card never trails one into nothing. */}
          {band.steps.length ? (
            <ol className="mt-9 grid gap-3 sm:grid-cols-3 sm:gap-x-6">
              {band.steps.map((step, i) => (
                <li key={step.title} className="relative flex items-stretch">
                  {i > 0 ? (
                    <span
                      aria-hidden="true"
                      className="absolute -left-6 top-1/2 hidden h-px w-6 border-t-2 border-dashed border-ink/20 sm:block"
                    />
                  ) : null}
                  <div className="flex-1 rounded-2xl border border-ink/[0.07] bg-white p-4 shadow-[0_6px_24px_-14px_rgba(6,40,30,0.25)]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] font-semibold text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-pale text-brand">
                        <Icon name={STEP_ICONS[i % 3]} className="h-4 w-4" />
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-[15px] font-bold tracking-[-0.01em] text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-snug text-muted">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}

          {band.noteBottom ? (
            <div className="mt-9 hidden w-fit lg:block">
              <p className="font-script text-xl leading-[1.25] text-ink/75">
                {band.noteBottom}
              </p>
              <Swash className="mt-1 block h-[10px] w-[190px] text-mint" />
            </div>
          ) : null}
        </div>

        {/* ── the application ── */}
        <div data-reveal="1" className="relative min-w-0">
          {band.noteTop ? (
            <div className="pointer-events-none absolute -top-16 right-0 hidden items-start gap-2 lg:flex">
              <CurvedArrow className="mt-6 h-[54px] w-[64px] text-ink/70" />
              <p className="max-w-[13rem] font-script text-xl leading-[1.2] text-ink/75">
                {band.noteTop}
              </p>
            </div>
          ) : null}

          <div className="rounded-[1.75rem] border border-ink/[0.06] bg-white p-6 shadow-[0_24px_70px_-30px_rgba(6,40,30,0.35)] sm:p-8">
            {sent ? (
              /* The card is replaced rather than a banner added: the form has
                 done its job and leaving it there invites a second copy of the
                 same application. */
              <div className="py-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-pale text-brand">
                  <Icon name="check" className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-display text-xl font-extrabold tracking-[-0.02em] text-ink">
                  Application received.
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-body">
                  We read every one. Expect a reply within one working day —
                  check your inbox, and your spam folder just in case.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <h3 className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink sm:text-[1.4rem]">
                  {band.formTitle}
                </h3>
                {band.formSubhead ? (
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    {band.formSubhead}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-col gap-3">
                  {FIELDS.map((f) => {
                    const bad = errors[f.key];
                    return (
                      <div key={f.key}>
                        <label className="sr-only" htmlFor={`trial-${f.key}`}>
                          {f.label}
                        </label>
                        <div className="relative">
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                              bad ? "text-red-500" : "text-muted"
                            }`}
                          >
                            <Icon
                              name={
                                { name: "user", email: "mail", brand: "channel", footage_url: "link" }[
                                  f.key
                                ]!
                              }
                              className="h-[18px] w-[18px]"
                            />
                          </span>
                          <input
                            id={`trial-${f.key}`}
                            type={f.type}
                            autoComplete={f.autoComplete}
                            placeholder={f.label}
                            value={values[f.key]}
                            onChange={(e) => set(f.key, e.target.value)}
                            aria-invalid={bad ? true : undefined}
                            aria-describedby={bad ? `trial-${f.key}-error` : undefined}
                            className={`${field} ${
                              bad
                                ? "border-red-400 focus:border-red-500"
                                : "border-ink/[0.07] focus:border-brand/45"
                            }`}
                          />
                        </div>
                        {bad ? (
                          <p
                            id={`trial-${f.key}-error`}
                            className="mt-1.5 pl-1 text-[12.5px] text-red-600"
                          >
                            {bad}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}

                  <div className="relative">
                    <label className="sr-only" htmlFor="trial-message">
                      What do you need?
                    </label>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-4 text-muted"
                    >
                      <Icon name="list" className="h-[18px] w-[18px]" />
                    </span>
                    <textarea
                      id="trial-message"
                      rows={3}
                      placeholder="What do you need?"
                      value={values.message}
                      onChange={(e) => set("message", e.target.value)}
                      className={`${field} resize-y border-ink/[0.07] pt-3.5 focus:border-brand/45`}
                    />
                  </div>
                </div>

                {/* The trap. Off-screen rather than `display:none`, which some
                    bots know to skip, and hidden from assistive tech so nobody
                    is ever asked to fill it in. */}
                <div aria-hidden="true" className="absolute left-[-9999px] top-0">
                  <label htmlFor="trial-company">Company</label>
                  <input
                    ref={trap}
                    id="trial-company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {failed ? (
                  <p role="alert" className="mt-4 text-[13px] text-red-600">
                    {failed}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-deep px-6 py-4 text-[15px] font-bold text-white shadow-[0_16px_36px_-14px_rgba(6,40,30,0.6)] transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                >
                  {pending ? "Sending…" : band.buttonLabel}
                  {pending ? null : <Icon name="arrow" className="h-3 w-[17px]" />}
                </button>

                {band.formNote ? (
                  <p className="mt-3.5 flex items-center justify-center gap-2 text-[12.5px] text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {band.formNote}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
