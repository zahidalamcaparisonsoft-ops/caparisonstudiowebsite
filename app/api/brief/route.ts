import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/server";
import { plural } from "@/lib/quote";
import { callerIp, overLimit } from "@/lib/rate-limit";

/**
 * Brief submissions.
 *
 * This route used to validate a brief and then `console.log` it. There was no
 * table behind it, no email and no webhook, so every brief the site ever
 * received went to a function log and expired with it. They were real leads.
 *
 * It stores them now, the same way /api/trial does: honeypot, rate limit,
 * validation, then a service-role write into a table nothing else can read.
 * `brief_submissions` is admin-only under RLS — it holds names, addresses,
 * whatever was typed in the notes box and what each visitor was quoted — and
 * there is deliberately no anonymous insert policy for a bot to find.
 */

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max).trim() : "";
}

function int(value: unknown) {
  const n = Math.round(Number(value));
  /* A figure from the browser, so it is bounded here rather than trusted:
     nothing in this form can legitimately quote a million a month, and an
     integer column will reject a NaN with an error nobody can read. */
  return Number.isFinite(n) ? Math.max(0, Math.min(n, 10_000_000)) : 0;
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/**
 * The label a slug had on the day it was chosen.
 *
 * Stored alongside the slug rather than joined later: the panel can rename a
 * project type or delete it outright, and a brief from six months ago should
 * still say what the visitor actually picked. A lookup at read time shows
 * today's wording, or nothing where the row has since gone.
 *
 * A slug with no row behind it falls back to the slug itself, which is worth
 * more than an empty cell when someone is trying to work out what was asked
 * for.
 */
async function labels(
  supabase: ReturnType<typeof adminClient>,
  table: string,
  slugs: string[],
): Promise<Record<string, string>> {
  if (!slugs.length) return {};
  /* Keyed by `slug`, not `id`. These tables carry both — a uuid primary key
     and the short slug the loaders hand to the form as its `id` — so what
     arrives in the payload is "yt", never the uuid. Matching on `id` would
     return nothing at all and quietly store the slug as its own label.

     The readable column is not the same in each: project_types calls it
     `name`, cadences and addons call it `label`. */
  const { data } = await supabase.from(table).select("*").in("slug", slugs);
  const out: Record<string, string> = {};
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const slug = String(r.slug ?? "");
    if (slug) out[slug] = str(r.label ?? r.name ?? r.title, 160) || slug;
  }
  return out;
}

export async function POST(request: Request) {
  if (overLimit(callerIp(request))) {
    return bad(
      "That is a lot of briefs in a short time. Try again shortly.",
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

  const name = str(body.name, 120);
  const email = str(body.email, 200);
  if (name.length < 2) return bad("Please include your name.");
  if (!EMAIL.test(email))
    return bad("That email address doesn't look right.");

  const typeId = str(body.type, 60);
  const cadenceId = str(body.cadence, 60);
  const addonIds = Array.isArray(body.addons)
    ? body.addons.map((a) => str(a, 60)).filter(Boolean).slice(0, 20)
    : [];

  /* NOTE: the quote is worked out in the browser and posted here, so what
     follows is what the visitor says was on screen when they pressed send —
     not something this server recalculated and agreed with. It is stored
     rather than recomputed on purpose: rates move, and the figure someone was
     shown is the figure they will expect to hear back. If a number ever looks
     wrong in the panel, this is where it came from. */
  const quote = (body.quote ?? {}) as Record<string, unknown>;

  let supabase: ReturnType<typeof adminClient>;
  try {
    supabase = adminClient();
  } catch (e) {
    console.error("[brief] no service-role client", e);
    return bad(
      "We could not record your brief. Please email us instead.",
      503,
    );
  }

  const [types, cadences, addons] = await Promise.all([
    labels(supabase, "project_types", typeId ? [typeId] : []),
    labels(supabase, "cadences", cadenceId ? [cadenceId] : []),
    labels(supabase, "addons", addonIds),
  ]);

  const perMonth = int(quote.perMonth);
  const unit = str(quote.unit, 40) || "video";

  const brief = {
    name,
    email,
    project_type: types[typeId] ?? typeId,
    project_type_id: typeId,
    /* A length, or a number typed into the box, came from no row at all and
       arrives as "custom". Named from the figures rather than left as the
       word, because "custom" tells whoever answers this brief nothing, and
       these are the same numbers stored below — so the label cannot end up
       disagreeing with them. */
    volume:
      cadences[cadenceId] ??
      (perMonth > 0 ? `${perMonth} ${plural(unit, perMonth)}` : cadenceId),
    volume_id: cadenceId,
    extras: addonIds.map((id) => addons[id] ?? id),
    extras_ids: addonIds,
    links: str(body.links, 1000),
    notes: str(body.notes, 4000),
    quote_per_video: int(quote.perVideo),
    quote_per_month: perMonth,
    quote_monthly: int(quote.monthly),
    quote_discount: int(quote.discount),
    quote_first_cut: str(quote.firstCutDate, 60),
    /* What the two figures above are counted in. Three of the four project
       types are priced per finished piece and motion graphics is priced per
       minute, so "$150" and "4 a month" mean nothing on their own — and the
       type they picked can be renamed or deleted, which is why this is not
       looked up from it later. */
    quote_unit: unit,
  };

  const { error } = await supabase.from("brief_submissions").insert(brief);
  if (error) {
    /* Saying we could not take it is better than the success this route used
       to return while dropping the brief on the floor. */
    console.error("[brief] not stored", error.message);
    return bad(
      "We could not record your brief. Please email us instead.",
      503,
    );
  }

  // ---------------------------------------------------------------------
  // DISCORD — the notification goes here.
  //
  // The brief is already stored by this point, so anything below must not be
  // allowed to fail the request: a webhook that is down should cost a
  // notification, never the lead. Wrap it in its own try/catch and let a
  // failure fall through to the success response.
  //
  //   try {
  //     await fetch(process.env.DISCORD_WEBHOOK_URL!, { ... });
  //   } catch (e) {
  //     console.error("[brief] discord notify failed", e);
  //   }
  //
  // No env var is declared for it yet, by request.
  // ---------------------------------------------------------------------

  return NextResponse.json({ ok: true, firstCutDate: brief.quote_first_cut });
}
