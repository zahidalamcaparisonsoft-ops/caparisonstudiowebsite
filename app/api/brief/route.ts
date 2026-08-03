import { NextResponse } from "next/server";

/**
 * Brief submission endpoint.
 *
 * The original design's form was inert — it faked an upload and never sent
 * anything anywhere. This validates the payload and gives you one place to
 * plug in delivery.
 *
 * TO GO LIVE, pick one and fill in the marked block below:
 *   - Resend      https://resend.com          (simplest; RESEND_API_KEY)
 *   - Postmark    https://postmarkapp.com
 *   - A webhook into Slack, Notion or your CRM
 *
 * Until then submissions are logged server-side so nothing is silently lost
 * during development.
 */

type Payload = {
  name?: unknown;
  email?: unknown;
  type?: unknown;
  cadence?: unknown;
  addons?: unknown;
  links?: unknown;
  notes?: unknown;
  quote?: { monthly?: unknown; perVideo?: unknown; firstCutDate?: unknown };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.slice(0, max).trim() : "";
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = str(body.name, 120);
  const email = str(body.email, 200);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please include your name." }, { status: 400 });
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right." },
      { status: 400 },
    );
  }

  const brief = {
    receivedAt: new Date().toISOString(),
    name,
    email,
    type: str(body.type, 40),
    cadence: str(body.cadence, 40),
    addons: Array.isArray(body.addons) ? body.addons.map((a) => str(a, 40)) : [],
    links: str(body.links, 500),
    notes: str(body.notes, 4000),
    quote: {
      monthly: Number(body.quote?.monthly) || 0,
      perVideo: Number(body.quote?.perVideo) || 0,
      firstCutDate: str(body.quote?.firstCutDate, 40),
    },
  };

  // ---------------------------------------------------------------------
  // DELIVERY — replace this block. Example with Resend:
  //
  //   const res = await fetch("https://api.resend.com/emails", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       from: "briefs@caparison.studio",
  //       to: "hello@caparison.studio",
  //       reply_to: brief.email,
  //       subject: `New brief — ${brief.name} (${brief.quote.monthly} USD/mo)`,
  //       text: JSON.stringify(brief, null, 2),
  //     }),
  //   });
  //   if (!res.ok) throw new Error("Delivery failed");
  // ---------------------------------------------------------------------
  console.log("[brief]", JSON.stringify(brief));

  return NextResponse.json({ ok: true, firstCutDate: brief.quote.firstCutDate });
}
