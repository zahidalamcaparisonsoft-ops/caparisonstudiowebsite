import ClientMarquee from "@/components/ClientMarquee";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Onboarding from "@/components/Onboarding";
import Pricing from "@/components/Pricing";
import Proof from "@/components/Proof";
import RevealProvider from "@/components/RevealProvider";
import Story from "@/components/Story";
import Testimonials from "@/components/Testimonials";
import TimelineRail from "@/components/TimelineRail";
import WorkGrid from "@/components/WorkGrid";

export default function Home() {
  return (
    <>
      <RevealProvider />
      <Header />
      <main>
        <Hero />
        <ClientMarquee />
        <WorkGrid />
        <Proof />
        <Journey />
        <Story />
        <Onboarding />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
      <TimelineRail />
    </>
  );
}
