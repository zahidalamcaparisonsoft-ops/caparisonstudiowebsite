import Link from "next/link";

/**
 * Mint wash — the last beat before the footer. Ink on the wash is 15.1:1;
 * white is 1.1:1 and is never used here.
 */
export default function CTABand() {
  return (
    <section className="section-flood relative overflow-hidden py-24 md:py-28">
      {/* Faint film-sprocket texture so the flood isn't a flat rectangle. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #000 0 2px, transparent 2px 26px)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-white/45 blur-3xl"
      />

      <div className="shell relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-2xl">
          {/* No logo mark here — its PNG carries a baked dark background, which
              reads as a black box on the mint field. Type carries the band. */}
          <h2 className="h-loud font-display font-extrabold text-[#050807]">
            Send us your next upload.
          </h2>
          <p className="mt-5 max-w-md text-base font-medium text-[#083D30] lg:text-lg">
            Four questions, two minutes, and a price on screen before you send it.
            You&apos;ll hear back today.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-4 lg:items-end">
          <Link
            href="#onboarding"
            className="rounded-full bg-[#050807] px-9 py-5 text-base font-bold text-white shadow-[0_18px_40px_-16px_rgba(0,0,0,.6)] transition-transform hover:-translate-y-0.5"
          >
            Start onboarding →
          </Link>
          <a
            href="mailto:hello@caparison.studio"
            className="text-sm font-semibold text-[#083D30] underline underline-offset-4 hover:text-[#050807]"
          >
            or email hello@caparison.studio
          </a>
        </div>
      </div>
    </section>
  );
}
