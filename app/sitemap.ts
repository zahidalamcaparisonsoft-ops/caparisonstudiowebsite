import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/data";

const SITE = "https://caparison.studio";

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
