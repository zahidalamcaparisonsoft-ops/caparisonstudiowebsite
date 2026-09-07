import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/data";

const SITE = "https://caparison.studio";

/**
 * TODO: point this at `getProjects()` so the sitemap lists the real work.
 *
 * It maps the nine bundled samples, so nothing added from the panel is listed
 * here — and the homepage no longer carries a crawlable list of case-study
 * links either, since the deck's `<details>` fallback was removed. Between
 * them, a database project has no route in for a crawler.
 *
 * Not a one-line swap: /work/[slug] still reads the same bundled `PROJECTS`,
 * and both it and its OG image index `study.results[0]` with no guard. Every
 * row from the panel has an empty `results`, so pointing either at the
 * database without fixing those reads first returns a 500 — which is exactly
 * how the homepage went down. Guard them, then switch both over together.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    ...PROJECTS.map((project) => ({
      url: `${SITE}/work/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
