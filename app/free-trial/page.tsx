import type { Metadata } from "next";
import FreeTrial from "@/components/FreeTrial";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RevealProvider from "@/components/RevealProvider";
import { getSettings, getTrialBand } from "@/lib/content";

/**
 * The free trial on a page of its own.
 *
 * The same section the homepage carries, at an address worth putting in an ad
 * or a cold email. One component, rendered twice — there is no second copy of
 * the form or its wording to keep in step.
 */

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Book a free trial",
  description:
    "Apply for a free 1-minute trial edit and see how we approach your content before you commit.",
  alternates: { canonical: "/free-trial" },
};

export default async function Page() {
  const [band, settings] = await Promise.all([getTrialBand(), getSettings()]);
  return (
    <>
      <RevealProvider />
      <Header />
      <main>
        <FreeTrial band={band} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
