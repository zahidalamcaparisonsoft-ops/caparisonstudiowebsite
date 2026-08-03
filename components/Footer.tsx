import Image from "next/image";
import Link from "next/link";

/**
 * Minimal footer.
 *
 * The CTA band directly above already does the asking, so this stays quiet:
 * one row of links, one legal line, and an oversized ghost wordmark as the
 * only flourish. No four-column link farm.
 *
 * Every link resolves — the original design had twelve anchors with no href.
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

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-5 pb-32 pt-20 sm:px-8">
        {/* Contact, set as the largest thing here. */}
        <div className="flex flex-col gap-10 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/30">
              Say hello
            </span>
            <a
              href="mailto:hello@caparison.studio"
              className="mt-4 block font-display text-[clamp(1.6rem,4.5vw,2.6rem)] font-extrabold leading-none tracking-[-0.03em] text-white transition-colors hover:text-mint"
            >
              hello@caparison.studio
            </a>
          </div>

          <div className="flex gap-6">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/50 transition-colors hover:text-mint"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {/* One row of links — no columns. */}
        <nav className="flex flex-wrap gap-x-7 gap-y-3 py-8">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Legal */}
        <div className="flex flex-col gap-3 border-t border-white/10 pt-7 font-mono text-[11px] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2.5">
            <Image
              src="/logo-mark.png"
              alt=""
              width={330}
              height={345}
              className="h-4 w-auto opacity-60"
            />
            © {new Date().getFullYear()} Caparison Studio
          </span>
          <span>Cut in Berlin · Delivered worldwide</span>
          <a href="#top" className="transition-colors hover:text-mint">
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
