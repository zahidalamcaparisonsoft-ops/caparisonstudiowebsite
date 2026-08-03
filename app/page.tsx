import AnatomyOfACut from "@/components/AnatomyOfACut";
import CTABand from "@/components/CTABand";
import ClientMarquee from "@/components/ClientMarquee";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Onboarding from "@/components/Onboarding";
import Pricing from "@/components/Pricing";
import Proof from "@/components/Proof";
import RevealProvider from "@/components/RevealProvider";
import ShowreelBand from "@/components/ShowreelBand";
import Story from "@/components/Story";
import Testimonials from "@/components/Testimonials";
import TimelineRail from "@/components/TimelineRail";
import WorkDeck from "@/components/WorkDeck";

/**
 * Section order is deliberately arrhythmic. Contained sections alternate with
 * full-bleed ones, and the two inverted bands (light Pricing, mint CTA) sit
 * late — after the argument is made, where a tonal break reads as a
 * conclusion rather than a decoration.
 *
 *   contained → strip → contained → full-bleed → FULL-BLEED SCRUB → rail
 *   → editorial → contained → LIGHT → contained → editorial → FLOOD
 */
export default function Home() {
  return (
    <>
      <RevealProvider />
      <Header />
      <main>
        <Hero />
        {/* Rises over the pinned hero as you scroll — the reveal. The offset
            matches the hero stage's travel exactly, so there is never a gap of
            empty screen between the two. */}
        <div className="relative z-20 -mt-[100svh] bg-black">
          {/* Softens the leading edge so the incoming panel dissolves out of the
              cloud bank instead of slicing across the reel. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-28 h-28 bg-gradient-to-b from-transparent to-black"
          />
          <ClientMarquee />
        <WorkDeck />
        <ShowreelBand />
        <Proof />
        <AnatomyOfACut />
        <Journey />
        <Story />
        <Onboarding />
        <Pricing />
        <FAQ />
        <Testimonials />
        <CTABand />
        </div>
      </main>
      <Footer />
      <TimelineRail />
    </>
  );
}
