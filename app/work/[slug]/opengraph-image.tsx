import { ImageResponse } from "next/og";
import { CATEGORY_LABEL, PROJECTS } from "@/lib/data";

export const alt = "Caparison Studio case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

/**
 * Per-case-study link preview. All nine studies previously shared the homepage
 * card, so sharing a specific piece of work said nothing about that work.
 * Leads with the headline outcome, because that is the reason to click.
 */
export default async function CaseStudyOG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#fff",
            fontSize: 48,
          }}
        >
          Caparison Studio
        </div>
      ),
      size,
    );
  }

  const headline = project.study.results[0];
  const hue = Math.round(project.hue * 360);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `radial-gradient(120% 120% at 18% 0%, hsl(${hue} 55% 18%) 0%, #050807 52%, #000000 100%)`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: 21,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#1BEDAC",
            }}
          >
            <div style={{ width: 42, height: 2, background: "#1BEDAC" }} />
            {CATEGORY_LABEL[project.cat]} · {project.client}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              maxWidth: 940,
            }}
          >
            {project.title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingTop: 30,
            borderTop: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 66,
                fontWeight: 800,
                color: "#1BEDAC",
                lineHeight: 1,
              }}
            >
              {headline.delta}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "rgba(255,255,255,0.55)",
                marginTop: 10,
              }}
            >
              {headline.label} · {headline.before} → {headline.after}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            caparison.studio
          </div>
        </div>
      </div>
    ),
    size,
  );
}
