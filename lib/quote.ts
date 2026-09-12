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

export type Quote = {
  perVideo: number;
  perMonth: number;
  monthly: number;
  discount: number;
  firstCutDate: string;
  /** What `perVideo` and `perMonth` are counted in. */
  unit: Unit;
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

export function buildQuote(
  typeId: string,
  cadenceId: string,
  addonIds: string[],
  tables: QuoteTables = {},
): Quote {
  const allTypes = tables.types?.length ? tables.types : PROJECT_TYPES;
  const allCadences = tables.cadences?.length ? tables.cadences : CADENCES;
  const allAddons = tables.addons?.length ? tables.addons : ADDONS;

  const type = allTypes.find((t) => t.id === typeId) ?? allTypes[0];
  const cadence =
    allCadences.find((c) => c.id === cadenceId) ?? allCadences[1] ?? allCadences[0];

  const addonTotal = allAddons
    .filter((a) => addonIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const multiplier = multiplierFor(cadence);
  const perVideo = Math.round((type.rate + addonTotal) * multiplier);

  return {
    perVideo,
    perMonth: cadence.perMonth,
    monthly: perVideo * cadence.perMonth,
    discount: discountFor(cadence),
    firstCutDate: addWorkingDays(type.firstCut),
    unit: type.unit || "video",
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
