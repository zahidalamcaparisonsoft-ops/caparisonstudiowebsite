import CTABand from "@/components/CTABand";
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
 * Section order is deliberately arrhythmic: contained sections alternate with
 * full-bleed ones, and the inverted bands (the light hero, light Pricing, the
 * mint CTA) are spaced apart so each tonal break reads as a beat rather than
 * decoration.
 *
 *   LIGHT hero → PROOF → deck → strip → full-bleed → MINT rail
 *   → editorial → contained → LIGHT → contained → FLOOD
 *
 * Client proof sits directly under the hero: it is the first question a visitor
 * has, and answering it before asking for anything is worth more than a wall of
 * quotes at the bottom nobody scrolls to.
 */
export default function Home() {
  return (
    <>
      <RevealProvider />
      <Header />
      <main>
        <Hero />
        <Testimonials />
        <WorkDeck />
        <ShowreelBand />
        <Proof />
        <Journey />
        <Story />
        <Onboarding />
        <Pricing />
        <FAQ />
        <CTABand />
      </main>
      <Footer />
      <TimelineRail />
    </>
  );
}
