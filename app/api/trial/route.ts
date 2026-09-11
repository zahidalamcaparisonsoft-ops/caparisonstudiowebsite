import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/server";
import { callerIp, overLimit } from "@/lib/rate-limit";

/**
 * Free-trial applications.
 *
 * The only way into `trial_applications`. The table is admin-only under RLS —
 * it holds strangers' names and email addresses, and the anon key ships in the
 * browser bundle — so the write happens here with the service role, behind the
 * checks below. There is deliberately no anonymous insert policy for a bot to
 * find.
 *
 * Unlike /api/brief, which validates a submission and then console.logs it,
 * this one stores what it receives. That route should get the same treatment.
 */

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max).trim() : "";
}

function bad(error: string, field?: string, status = 400) {
  return NextResponse.json({ error, field }, { status });
}

export async function POST(request: Request) {
  if (overLimit(callerIp(request))) {
    return bad(
      "That is a lot of applications in a short time. Try again shortly.",
      undefined,
      429,
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request body.");
  }

  /* The honeypot. A field no person can see, so anything in it came from
     something filling every input it found. Answered with a plain success:
     told it failed, a bot retries with the field left empty. */
  if (str(body.company, 200)) return NextResponse.json({ ok: true });

  const application = {
    name: str(body.name, 120),
    email: str(body.email, 200),
    brand: str(body.brand, 160),
    footage_url: str(body.footage_url, 600),
    message: str(body.message, 4000),
  };

  if (application.name.length < 2)
    return bad("Please tell us your name.", "name");
  if (!EMAIL.test(application.email))
    return bad("That email address doesn't look right.", "email");

  /* `adminClient` throws when the service-role key is missing, so the whole
     write sits in one guard. Saying we could not take it is better than
     accepting an application and dropping it, which is what the brief form
     has been doing since it was built. */
  try {
    const { error } = await adminClient()
      .from("trial_applications")
      .insert(application);
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("[trial] not stored", e instanceof Error ? e.message : e);
    return bad(
      "We could not record your application. Please email us instead.",
      undefined,
      503,
    );
  }

  // ---------------------------------------------------------------------
  // DISCORD — the notification goes here.
  //
  // The application is already stored by this point, so anything below must
  // not be allowed to fail the request: a webhook that is down should cost a
  // notification, never the lead. Wrap it in its own try/catch and let a
  // failure fall through to the success response.
  //
  //   try {
  //     await fetch(process.env.DISCORD_WEBHOOK_URL!, { ... });
  //   } catch (e) {
  //     console.error("[trial] discord notify failed", e);
  //   }
  //
  // No env var is declared for it yet, by request.
  // ---------------------------------------------------------------------

  return NextResponse.json({ ok: true });
}
