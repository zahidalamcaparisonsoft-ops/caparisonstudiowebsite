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
import WorkGrid from "@/components/WorkGrid";

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
        <ClientMarquee />
        <WorkGrid />
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
      </main>
      <Footer />
      <TimelineRail />
    </>
  );
}
