/**
 * Instant-quote model.
 *
 * The single highest-leverage change to the brief flow: showing a real number
 * and a real date before the visitor submits. Someone who has seen a price is
 * far more likely to finish, and far less likely to be a tyre-kicker.
 *
 * The four types and their rates are the ones published in the pricing
 * section, deliberately: a visitor who reads "$150 / minute" on a card and is
 * then quoted something else two screens later has learned that neither
 * number means anything. The constants below are the fallback — the published
 * figures live in `project_types` and are edited at /admin.
 */

export type TypeId = "faceless" | "talking-head" | "motion" | "reels";
export type CadenceId = "one-off" | "weekly" | "twice" | "daily";

/**
 * What a rate buys one of.
 *
 * Three of the four types are priced per finished piece and motion graphics is
 * priced per minute of animation, so nothing downstream may assume "video"
 * wherever it prints a quantity. The arithmetic is identical whichever it is —
 * rate × quantity — and only the wording moves.
 *
 * Held as free text rather than a union because the panel can add a type and
 * name its unit; `plural` below is what has to cope with whatever is typed.
 */
export type Unit = string;

/**
 * Units that measure one piece of work rather than count several.
 *
 * The difference decides the whole of question two. You publish four videos a
 * month, so the question is how often; you order a three-minute explainer
 * once, so the question is how long. Asking a studio how many minutes of
 * animation it wants *per month* is how you get no answer at all.
 *
 * A list rather than a column because it is a fact about the word, not about
 * the row: anything not named here is something you publish, which is the
 * behaviour every type had before motion graphics arrived.
 */
const MEASURES = ["minute", "second", "hour"];

export function isMeasuredUnit(unit: Unit): boolean {
  return MEASURES.includes(unit.trim().toLowerCase());
}

/**
 * The runs offered for a measured unit.
 *
 * Question two's other half is a box to type a number into, so these are only
 * the common answers — they exist to save typing, not to be the whole menu.
 */
export const QUANTITY_PRESETS = [1, 2, 5, 10];

/** Nothing here legitimately runs to four figures, and a typed box invites it. */
export const MAX_QUANTITY = 999;

export type ProjectType = {
  id: string;
  label: string;
  copy: string;
  /** Base rate in USD for one `unit`. */
  rate: number;
  /** What one of those is called: "video", "minute", "reel". */
  unit: Unit;
  /** Working days to first cut. */
  firstCut: number;
};

export type Cadence = {
  id: string;
  label: string;
  perMonth: number;
  /** What the volume takes off the unit rate. 0.9 is a 10% discount. */
  multiplier?: number;
};

export type Addon = { id: string; label: string; copy: string; price: number };

export const PROJECT_TYPES: ProjectType[] = [
  {
    id: "faceless",
    label: "Faceless Videos",
    copy: "YouTube • Documentary • Automation",
    rate: 120,
    unit: "video",
    firstCut: 3,
  },
  {
    id: "talking-head",
    label: "Talking Head Videos",
    copy: "Educational • Coaching • Brand Content",
    rate: 150,
    unit: "video",
    firstCut: 3,
  },
  {
    id: "motion",
    label: "Advanced Motion Graphics",
    copy: "Explainer • Brand Films • Custom Animation",
    rate: 150,
    unit: "minute",
    firstCut: 7,
  },
  {
    id: "reels",
    label: "Social Media Reels",
    copy: "Instagram • TikTok • YouTube Shorts",
    rate: 50,
    unit: "reel",
    firstCut: 2,
  },
];

export const CADENCES: Cadence[] = [
  { id: "one-off", label: "One-off", perMonth: 1, multiplier: 1 },
  { id: "weekly", label: "Weekly", perMonth: 4, multiplier: 0.9 },
  { id: "twice", label: "Twice weekly", perMonth: 8, multiplier: 0.82 },
  { id: "daily", label: "Daily", perMonth: 22, multiplier: 0.7 },
];

export const ADDONS: Addon[] = [
  { id: "shorts", label: "Shorts pack", copy: "6 vertical cutdowns per video", price: 240 },
  { id: "thumbs", label: "Thumbnails", copy: "3 concepts, tested", price: 120 },
  { id: "captions", label: "Captions & subtitles", copy: "Burned-in and .srt", price: 60 },
  { id: "colour", label: "Colour & finishing", copy: "Graded master", price: 180 },
];

/**
 * "4 minutes", "1 reel".
 *
 * Every unit this studio prices in takes a plain "s", so the rule is the rule
 * rather than a lookup table that would need an entry the first time someone
 * adds a type in the panel and never gets one.
 */
export function plural(unit: Unit, count: number): string {
  return count === 1 ? unit : `${unit}s`;
}

/** Volume discount — the more you publish, the lower the unit cost. */
function volumeMultiplier(perMonth: number) {
  if (perMonth >= 22) return 0.7;
  if (perMonth >= 8) return 0.82;
  if (perMonth >= 4) return 0.9;
  return 1;
}

/**
 * What a cadence actually takes off the rate.
 *
 * The panel sets a multiplier per row, so that leads; the band above is what
 * a row added without one falls back to. Clamped because the column is a free
 * number and a 0 there would quote every project at nothing.
 */
export function multiplierFor(cadence: Cadence): number {
  const m = cadence.multiplier;
  if (typeof m !== "number" || !Number.isFinite(m) || m <= 0 || m > 1) {
    return volumeMultiplier(cadence.perMonth);
  }
  return m;
}

/** The badge on a volume card, and the line in the estimate. */
export function discountFor(cadence: Cadence): number {
  return Math.round((1 - multiplierFor(cadence)) * 100);
}

/** The same badge, for a quantity picked or typed rather than chosen. */
export function discountForQuantity(perMonth: number): number {
  return Math.round((1 - volumeMultiplier(perMonth)) * 100);
}

export type Quote = {
  /** The published starting rate for one unit, before extras or volume. */
  baseRate: number;
  /** What the chosen extras add to one unit. */
  extras: number;
  /** One unit, with extras and any volume discount applied. */
  perVideo: number;
  /**
   * How many. Zero until question two is answered — which is what lets the
   * estimate show a starting rate and nothing it has not been told yet,
   * instead of a monthly total built on a volume nobody chose.
   */
  perMonth: number;
  /** perVideo × perMonth, so zero until there is a quantity. */
  monthly: number;
  discount: number;
  firstCutDate: string;
  /** What `perVideo` and `perMonth` are counted in. */
  unit: Unit;
  /** Whether that quantity recurs, or is the size of one piece of work. */
  measured: boolean;
};

/**
 * Tables to price against.
 *
 * Passed in rather than read from the constants above, because the constants
 * are only the fallback: a studio that raises a rate at /admin has changed
 * what the cards say, and a quote worked out from the bundled copy would
 * disagree with the card the visitor just clicked.
 */
export type QuoteTables = {
  types?: ProjectType[];
  cadences?: Cadence[];
  addons?: Addon[];
};

/** What the four questions have been answered with so far. */
export type QuoteInput = {
  typeId: string;
  /** A volume row they picked. */
  cadenceId?: string;
  /** A quantity they typed or picked instead of a row. Wins over the row. */
  quantity?: number;
  addonIds?: string[];
};

/**
 * The estimate, from the answers given and no further.
 *
 * It used to open on a monthly total for a volume nobody had chosen — four a
 * month, because that was the state's opening value — so the first figure a
 * visitor ever saw was one they had not asked for and could not account for.
 * An unanswered volume is zero here, and the panel shows the starting rate
 * until there is something real to multiply it by.
 */
export function buildQuote(input: QuoteInput, tables: QuoteTables = {}): Quote {
  const allTypes = tables.types?.length ? tables.types : PROJECT_TYPES;
  const allCadences = tables.cadences?.length ? tables.cadences : CADENCES;
  const allAddons = tables.addons?.length ? tables.addons : ADDONS;

  const type = allTypes.find((t) => t.id === input.typeId) ?? allTypes[0];
  const cadence = input.cadenceId
    ? allCadences.find((c) => c.id === input.cadenceId)
    : undefined;

  const typed =
    typeof input.quantity === "number" && Number.isFinite(input.quantity)
      ? Math.min(MAX_QUANTITY, Math.max(0, Math.floor(input.quantity)))
      : 0;

  /* A typed number leads, then a chosen row, then nothing — which is the
     order the visitor's own actions happen in. */
  const perMonth = typed > 0 ? typed : (cadence?.perMonth ?? 0);

  const extras = allAddons
    .filter((a) => (input.addonIds ?? []).includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  /* No volume, no volume discount: the rate on screen has to be the rate the
     card published, or question one is quoting against an answer to two. */
  const multiplier =
    perMonth <= 0
      ? 1
      : typed > 0
        ? volumeMultiplier(perMonth)
        : multiplierFor(cadence!);

  const perVideo = Math.round((type.rate + extras) * multiplier);

  return {
    baseRate: type.rate,
    extras,
    perVideo,
    perMonth,
    monthly: perVideo * perMonth,
    discount: Math.round((1 - multiplier) * 100),
    firstCutDate: addWorkingDays(type.firstCut),
    unit: type.unit || "video",
    measured: isMeasuredUnit(type.unit || "video"),
  };
}

/** Skips weekends, because a "5-day first cut" that lands on Sunday is a lie. */
export function addWorkingDays(days: number, from = new Date()): string {
  const date = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining--;
  }
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Powers the "next start date" line in the hero. */
export function nextAvailableSlot(): string {
  return addWorkingDays(7);
}

export function formatUSD(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}
