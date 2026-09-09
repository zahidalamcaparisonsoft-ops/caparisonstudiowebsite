import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Archivo, Caveat, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

// Archivo carries every heading; Inter carries everything else. Both are
// variable fonts, so the weight range costs one file each rather than one
// per weight.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// One script face, used for a single line beside the client quote. Weighted
// down to the one weight that line needs rather than the whole range.
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Set this to the real domain before launch so OG images resolve absolutely.
const SITE = "https://caparison.studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Caparison Studio — Video editing cut for retention",
    template: "%s — Caparison Studio",
  },
  description:
    "Long-form, shorts and product films for teams who publish every week. Send the files, get a first cut in five days. 1,240 videos delivered, 34-hour revisions.",
  keywords: [
    "video editing studio",
    "YouTube automation editing",
    "podcast editing",
    "SaaS product video",
    "documentary editing",
    "shorts editing",
  ],
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Caparison Studio",
    title: "Caparison Studio — Video editing cut for retention",
    description:
      "Long-form, shorts and product films for teams who publish every week. First cut in five days.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caparison Studio — Video editing cut for retention",
    description:
      "Long-form, shorts and product films for teams who publish every week. First cut in five days.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Caparison Studio",
  description:
    "Video editing studio for teams that publish every week. Long-form, shorts, podcasts and product films.",
  url: SITE,
  email: "hello@caparison.studio",
  foundingDate: "2021",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Berlin",
    addressCountry: "DE",
  },
  areaServed: "Worldwide",
  serviceType: [
    "Video editing",
    "Podcast editing",
    "Motion graphics",
    "Documentary post-production",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${jetbrains.variable} ${caveat.variable}`}
    >
      <head>
        {/* The hero's film comes from Vimeo, and its still from Vimeo's CDN —
            two hosts that each need a DNS lookup and a TLS handshake before
            the first byte. Started here, that happens while the document is
            still parsing rather than after it. */}
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <link rel="dns-prefetch" href="https://i.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://f.vimeocdn.com" />
      </head>
      <body>
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-mint focus:px-4 focus:py-2 focus:font-semibold focus:text-black"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <SmoothScroll />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
