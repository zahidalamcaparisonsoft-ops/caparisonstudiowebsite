import Image from "next/image";
import Link from "next/link";

/**
 * Every link here resolves. The original had twelve anchors with no href,
 * including all three social links.
 */

const COLUMNS = [
  {
    title: "Services",
    links: [
      { label: "YouTube automation", href: "/#work" },
      { label: "Podcast editing", href: "/#work" },
      { label: "SaaS animation", href: "/#work" },
      { label: "Documentary", href: "/#work" },
      { label: "Shorts & vertical", href: "/#work" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "Work", href: "/#work" },
      { label: "Process", href: "/#journey" },
      { label: "Our story", href: "/#story" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@caparison.studio", href: "mailto:hello@caparison.studio" },
      { label: "Start a project", href: "/#onboarding" },
    ],
  },
];

const SOCIALS = [
  { label: "YouTube", href: "https://youtube.com/@caparisonstudio" },
  { label: "Instagram", href: "https://instagram.com/caparisonstudio" },
  { label: "LinkedIn", href: "https://linkedin.com/company/caparisonstudio" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/8 px-5 pb-28 pt-16 sm:px-8 md:pb-32">
      <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-5">
          <Image
            src="/logo-wordmark.png"
            alt="Caparison Studio"
            width={984}
            height={640}
            className="h-11 w-auto self-start"
          />
          <p className="max-w-xs text-sm leading-relaxed text-white/45">
            A video editing studio for teams that publish every week.
          </p>
          <div className="flex gap-4">
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

        {COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
              {column.title}
            </span>
            {column.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 transition-colors hover:text-mint"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-[1240px] flex-col gap-2 border-t border-white/8 pt-6 font-mono text-[11px] text-white/30 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Caparison Studio</span>
        <span>Cut in Berlin · Delivered worldwide</span>
      </div>
    </footer>
  );
}
