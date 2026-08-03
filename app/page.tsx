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
import {
  getAddons,
  getCadences,
  getCategories,
  getClipsBySlug,
  getFaqs,
  getHero,
  getOnboardingCopy,
  getPricingTiers,
  getProcessSteps,
  getProjectTypes,
  getProjects,
  getSettings,
  getTeam,
  getTestimonials,
  getTrustedBy,
} from "@/lib/content";

/**
 * Section order is deliberately arrhythmic: contained sections alternate with
 * full-bleed ones, and the inverted bands (the light hero, mint process, light
 * Pricing, the mint CTA) are spaced apart so each tonal break reads as a beat
 * rather than decoration.
 *
 *   LIGHT hero → PROOF → deck → strip → full-bleed → MINT rail
 *   → editorial → contained → LIGHT → contained → FLOOD
 *
 * Client proof sits directly under the hero: it is the first question a visitor
 * has, and answering it before asking for anything is worth more than a wall of
 * quotes at the bottom nobody scrolls to.
 *
 * All content is read from Supabase and edited at /admin. Every fetcher falls
 * back to the bundled sample data, so a database hiccup degrades to the previous
 * content rather than to an empty page.
 */

// Admin edits should show up immediately rather than at the next rebuild.
export const revalidate = 0;

export default async function Home() {
  const [
    hero,
    settings,
    clients,
    categories,
    projects,
    clips,
    testimonials,
    steps,
    team,
    briefCopy,
    types,
    cadences,
    addons,
    tiers,
    faqs,
  ] = await Promise.all([
    getHero(),
    getSettings(),
    getTrustedBy(),
    getCategories(),
    getProjects(),
    getClipsBySlug(),
    getTestimonials(),
    getProcessSteps(),
    getTeam(),
    getOnboardingCopy(),
    getProjectTypes(),
    getCadences(),
    getAddons(),
    getPricingTiers(),
    getFaqs(),
  ]);

  return (
    <>
      <RevealProvider />
      <Header />
      <main>
        <Hero content={hero} clients={clients} />
        <Testimonials items={testimonials} />
        <WorkDeck
          projects={projects}
          categories={categories.list}
          categoryLabels={categories.labelById}
          clips={clips}
        />
        <ShowreelBand projects={projects} clips={clips} />
        <Proof />
        <Journey steps={steps} />
        <Story team={team} />
        <Onboarding
          copy={briefCopy}
          types={types}
          cadences={cadences}
          addonList={addons}
        />
        <Pricing tiers={tiers ?? undefined} />
        <FAQ items={faqs ?? undefined} />
        <CTABand />
      </main>
      <Footer settings={settings} />
      <TimelineRail />
    </>
  );
}
