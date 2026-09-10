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
 * The address is still the largest thing here: the CTA band directly above
 * already asked for the brief, so the job left is to be reachable. Everything
 * else is a link and belongs on one line with the others.
 *
 * It used to stand 710px — most of a laptop screen — because nine short links
 * and two lines of text were given a three-column grid of their own, with a
 * rule above and below it. The links now sit beside the address instead of
 * under it, which is the whole of the saving; nothing was cut but the air.
 *
 * The last row clears the timeline rail, which is fixed 74px along the bottom
 * of every viewport from `md` up — without that the copyright line is read
 * through the scrubber.
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

export default function Footer({ settings }: { settings?: SiteSettings }) {
  const email = settings?.email ?? "hello@caparisonstudio.com";
  const socials = settings?.socials?.length ? settings.socials : SOCIALS;
  const location = settings?.location ?? "Cut in Berlin · Delivered worldwide";
  const name = settings?.studioName ?? "Caparison Studio";

  return (
    <footer className="on-dark relative overflow-hidden">
      {/* One soft brand bloom, so the band is not a flat rectangle. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-mint/12 blur-[100px]"
      />

      <div className="shell relative pb-[calc(74px+1.25rem)] pt-14 md:pt-16">
        {/* The address, and everything that is only a link.

            `items-end` rather than `items-center`: the address is display size
            and the links are not, so centring them leaves the run of links
            floating in the middle of a tall row. Sat on the same baseline they
            read as one line of footer. */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-mint/25 bg-mint/10 px-3.5 py-1.5 font-mono text-[11px] tracking-wide text-mint">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-70 [animation:ringPulse_2.4s_ease-out_infinite]" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              Taking on new projects
            </span>

            <a
              href={`mailto:${email}`}
              className="group mt-5 flex w-fit max-w-full items-center gap-3.5 font-display text-[clamp(1.5rem,3.6vw,2.5rem)] font-extrabold leading-none tracking-[-0.035em] text-white"
            >
              {/* The rule sweeps in from the left on hover — a background-size
                  transition, so it costs no layout. */}
              <span className="min-w-0 break-all bg-gradient-to-r from-mint to-mint bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:bg-[length:100%_2px]">
                {email}
              </span>
              <span
                aria-hidden="true"
                className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-mint transition-all duration-300 group-hover:border-mint group-hover:bg-mint group-hover:text-ink sm:grid"
              >
                <svg
                  width="16"
                  height="13"
                  viewBox="0 0 15 12"
                  fill="none"
                  aria-hidden="true"
                >
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
          </div>

          {/* Two runs rather than three columns: where to go, and where to
              follow. The studio's location moved to the line below, which was
              already carrying that kind of thing. */}
          <div className="flex shrink-0 flex-col gap-3 lg:items-end">
            <nav>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:justify-end">
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

            <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:justify-end">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-white/55 transition-colors hover:text-mint"
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
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-[11px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
          {/* Wraps as two pieces, not four: on a narrow screen the separator
              was ending up alone on a line between them. */}
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
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
            <span>
              <span aria-hidden="true" className="mr-2.5 text-white/25">
                ·
              </span>
              {location}
            </span>
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
          anything because it sits behind the content and is clipped. Sized to
          the band: at the old 19vw it would stand taller than the footer now
          does and read as texture rather than as a word. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-[0.16em] select-none text-center font-display text-[11vw] font-extrabold leading-none tracking-[-0.05em] text-white/[0.035]"
      >
        CAPARISON
      </span>
    </footer>
  );
}
