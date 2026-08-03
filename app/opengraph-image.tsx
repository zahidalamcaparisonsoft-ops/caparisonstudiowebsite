import { ImageResponse } from "next/og";

export const alt = "Caparison Studio — video editing cut for retention";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Link preview card. The original bundle had none, so every share into Slack,
 * WhatsApp or X rendered as a bare "Bundled Page" with no image — which is
 * exactly how creative work gets passed around.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(120% 120% at 20% 0%, #12332A 0%, #050807 52%, #000000 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 22,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#1BEDAC",
            fontFamily: "monospace",
          }}
        >
          <div style={{ width: 48, height: 2, background: "#1BEDAC" }} />
          Video editing studio
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 36,
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "#ffffff",
          }}
        >
          Cut for&nbsp;<span style={{ color: "#1BEDAC" }}>retention</span>,
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#ffffff",
          }}
        >
          not applause.
        </div>

        <div
          style={{
            display: "flex",
            gap: "56px",
            marginTop: 56,
            paddingTop: 32,
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {[
            ["1,240", "Videos delivered"],
            ["+38%", "Median retention lift"],
            ["5 days", "To first cut"],
          ].map(([value, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: "#ffffff" }}>
                {value}
              </div>
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 72,
            fontSize: 26,
            fontWeight: 700,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          caparison.studio
        </div>
      </div>
    ),
    size,
  );
}
