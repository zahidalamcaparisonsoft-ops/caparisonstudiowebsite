import CTABand from "@/components/CTABand";
import ClientLogos from "@/components/ClientLogos";
import LiveEditBridge from "@/components/LiveEditBridge";
import FAQ from "@/components/FAQ";
import FreeTrial from "@/components/FreeTrial";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Onboarding from "@/components/Onboarding";
import Pricing from "@/components/Pricing";
import RevealProvider from "@/components/RevealProvider";
import Story from "@/components/Story";
import Testimonials from "@/components/Testimonials";
import TimelineRail from "@/components/TimelineRail";
import WorkDeck from "@/components/WorkDeck";
import { resolveCategoryParam } from "@/lib/data";
import {
  getAddons,
  getCadences,
  getCategories,
  getClientBand,
  getTrialBand,
  getClientLogos,
  getClipsBySlug,
  getFaqs,
  getHero,
  getOnboardingCopy,
  getPricingBand,
  getPricingTiers,
  getProcessSteps,
  getProjectTypes,
  getProjects,
  getSettings,
  getTeam,
  getTestimonialBand,
  getTestimonials,
  getTrustedBy,
} from "@/lib/content";

/**
 * The page is white throughout. Rhythm comes from three steps of paper and the
 * two mint floods, spaced so each tonal break lands as a beat:
 *
 *   white hero → TINT testimonials → white clients → white deck
 *   → MINT process → TINT team → white brief → TINT pricing → white FAQ
 *   → MINT close → dark footer
 *
 * The clients band and the deck are both white and sit next to each other; a
 * hairline seam separates them, which is enough where a tonal step would be
 * one beat too many.
 *
 * Video is the one thing that stays dark, because a thumbnail on white reads
 * as a hole in the page — players and poster tiles are `.on-dark` islands
 * sitting inside light bands.
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

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // `?edit=1` turns the page into the admin's live canvas. It only adds an
  // overlay and reports clicks; every write still goes through the database's
  // own permission check.
  const live = params?.edit === "1";

  // `?work=<category>` opens the wall already filtered, for a link sent to a
  // client who wants to see one kind of work. Resolved here rather than in the
  // browser so the first paint is the filtered wall — reading it client-side
  // would render the whole wall and then visibly re-sort it.
  const workParam = typeof params?.work === "string" ? params.work : undefined;

  const [
    hero,
    settings,
    clients,
    categories,
    projects,
    clips,
    testimonials,
    band,
    clientLogos,
    clientBand,
    trialBand,
    steps,
    team,
    briefCopy,
    types,
    cadences,
    addons,
    tiers,
    pricingBand,
    faqs,
  ] = await Promise.all([
    getHero(),
    getSettings(),
    getTrustedBy(),
    getCategories(),
    getProjects(),
    getClipsBySlug(),
    getTestimonials(),
    getTestimonialBand(),
    getClientLogos(),
    getClientBand(),
    getTrialBand(),
    getProcessSteps(),
    getTeam(),
    getOnboardingCopy(),
    getProjectTypes(),
    getCadences(),
    getAddons(),
    getPricingTiers(),
    getPricingBand(),
    getFaqs(),
  ]);

  return (
    <>
      <RevealProvider />
      {live ? <LiveEditBridge /> : null}
      <Header />
      <main>
        <Hero content={hero} clients={clients} />
        <Testimonials items={testimonials} band={band} />
        <ClientLogos marks={clientLogos} band={clientBand} />
        <WorkDeck
          projects={projects}
          categories={categories.list}
          categoryLabels={categories.labelById}
          clips={clips}
          initialCategory={resolveCategoryParam(workParam, categories.list)}
        />
        <Journey steps={steps} />
        <FreeTrial band={trialBand} />
        <Story team={team} />
        <Onboarding
          copy={briefCopy}
          types={types}
          cadences={cadences}
          addonList={addons}
        />
        <Pricing tiers={tiers ?? undefined} band={pricingBand} />
        <FAQ items={faqs ?? undefined} />
        <CTABand />
      </main>
      <Footer settings={settings} />
      <TimelineRail />
    </>
  );
}
