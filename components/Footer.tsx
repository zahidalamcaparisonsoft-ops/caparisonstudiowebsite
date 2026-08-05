import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/content";

/**
 * Footer — and the page's one full dark band.
 *
 * After a white page the ink base reads as the bottom of the document rather
 * than as another section, and it is the one place the logo mark's baked dark
 * background sits correctly.
 *
 * The address is the largest thing here on purpose: the CTA band directly
 * above already asked for the brief, so the job left is to be reachable. The
 * three columns underneath carry real content — where to go, where to follow,
 * where we are — rather than padding a grid out to four.
 *
 * Every link resolves. The original design had twelve anchors with no href.
 */

const LINKS = [
  { label: "Work", href: "/#work" },
  { label: "Process", href: "/#journey" },
  { label: "Studio", href: "/#story" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

const SOCIALS = [
  { label: "YouTube", href: "https://youtube.com/@caparisonstudio" },
  { label: "Instagram", href: "https://instagram.com/caparisonstudio" },
  { label: "LinkedIn", href: "https://linkedin.com/company/caparisonstudio" },
];

function ColumnHead({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-mono text-[10px] tracking-[0.04em] text-white/55">
      {children}
    </span>
  );
}

export default function Footer({ settings }: { settings?: SiteSettings }) {
  const email = settings?.email ?? "hello@caparison.studio";
  const socials = settings?.socials?.length ? settings.socials : SOCIALS;
  const location = settings?.location ?? "Cut in Berlin · Delivered worldwide";
  const name = settings?.studioName ?? "Caparison Studio";

  return (
    <footer className="on-dark relative overflow-hidden">
      {/* One soft brand bloom, so the band is not a flat rectangle. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-mint/12 blur-[110px]"
      />

      <div className="shell relative pb-32 pt-20">
        {/* Availability, then the address at display size. */}
        <span className="inline-flex items-center gap-2.5 rounded-full border border-mint/25 bg-mint/10 px-3.5 py-1.5 font-mono text-[11px] tracking-wide text-mint">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-70 [animation:ringPulse_2.4s_ease-out_infinite]" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
          </span>
          Taking on new projects
        </span>

        <a
          href={`mailto:${email}`}
          className="group mt-7 flex w-fit max-w-full items-center gap-4 font-display text-[clamp(1.75rem,5.5vw,3.6rem)] font-extrabold leading-none tracking-[-0.035em] text-white"
        >
          {/* The rule sweeps in from the left on hover — a background-size
              transition, so it costs no layout. */}
          <span className="min-w-0 break-all bg-gradient-to-r from-mint to-mint bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:bg-[length:100%_2px]">
            {email}
          </span>
          <span
            aria-hidden="true"
            className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 text-mint transition-all duration-300 group-hover:border-mint group-hover:bg-mint group-hover:text-ink sm:grid"
          >
            <svg width="18" height="14" viewBox="0 0 15 12" fill="none" aria-hidden="true">
              <path
                d="M1 6h12M9 2l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-3">
          <nav>
            <ColumnHead>Explore</ColumnHead>
            <ul className="mt-4 flex flex-col gap-2.5">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/75 transition-colors hover:text-mint"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <ColumnHead>Follow</ColumnHead>
            <ul className="mt-4 flex flex-col gap-2.5">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-white/75 transition-colors hover:text-mint"
                  >
                    {social.label}
                    <span
                      aria-hidden="true"
                      className="text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHead>Studio</ColumnHead>
            <p className="mt-4 text-sm leading-relaxed text-white/75">{location}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Replies within one working day
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 font-mono text-[11px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2.5">
            <Image
              src="/logo-mark.png"
              alt=""
              width={330}
              height={345}
              className="h-4 w-auto opacity-70"
            />
            © {new Date().getFullYear()} {name}
          </span>
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-mint"
          >
            Back to top ↑
          </a>
        </div>
      </div>

      {/* Oversized ghost wordmark — the only flourish, and it never obscures
          anything because it sits behind the content and is clipped. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-[0.18em] select-none text-center font-display text-[19vw] font-extrabold leading-none tracking-[-0.05em] text-white/[0.035]"
      >
        CAPARISON
      </span>
    </footer>
  );
}
