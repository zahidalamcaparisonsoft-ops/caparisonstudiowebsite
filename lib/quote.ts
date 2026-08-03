/**
 * Instant-quote model.
 *
 * The single highest-leverage change to the brief flow: showing a real number
 * and a real date before the visitor submits. Someone who has seen a price is
 * far more likely to finish, and far less likely to be a tyre-kicker.
 *
 * Rates are illustrative — replace with your actual pricing before launch.
 */

export type TypeId = "yt" | "pod" | "saas" | "doc";
export type CadenceId = "one-off" | "weekly" | "twice" | "daily";

export const PROJECT_TYPES: {
  id: TypeId;
  label: string;
  copy: string;
  /** Per-video base rate in USD. */
  rate: number;
  /** Working days to first cut. */
  firstCut: number;
}[] = [
  {
    id: "yt",
    label: "YouTube automation",
    copy: "Faceless, scripted, high volume.",
    rate: 180,
    firstCut: 3,
  },
  {
    id: "pod",
    label: "Podcast editing",
    copy: "Multicam switching plus a clips pack.",
    rate: 240,
    firstCut: 4,
  },
  {
    id: "saas",
    label: "SaaS animation",
    copy: "Screen capture into motion graphics.",
    rate: 950,
    firstCut: 7,
  },
  {
    id: "doc",
    label: "Documentary",
    copy: "Long-form assembly and archive.",
    rate: 1400,
    firstCut: 10,
  },
];

export const CADENCES: { id: CadenceId; label: string; perMonth: number }[] = [
  { id: "one-off", label: "One-off", perMonth: 1 },
  { id: "weekly", label: "Weekly", perMonth: 4 },
  { id: "twice", label: "Twice weekly", perMonth: 8 },
  { id: "daily", label: "Daily", perMonth: 22 },
];

export const ADDONS: { id: string; label: string; copy: string; price: number }[] = [
  { id: "shorts", label: "Shorts pack", copy: "6 vertical cutdowns per video", price: 240 },
  { id: "thumbs", label: "Thumbnails", copy: "3 concepts, tested", price: 120 },
  { id: "captions", label: "Captions & subtitles", copy: "Burned-in and .srt", price: 60 },
  { id: "colour", label: "Colour & finishing", copy: "Graded master", price: 180 },
];

/** Volume discount — the more you publish, the lower the unit cost. */
function volumeMultiplier(perMonth: number) {
  if (perMonth >= 22) return 0.7;
  if (perMonth >= 8) return 0.82;
  if (perMonth >= 4) return 0.9;
  return 1;
}

export type Quote = {
  perVideo: number;
  perMonth: number;
  monthly: number;
  discount: number;
  firstCutDate: string;
};

export function buildQuote(
  typeId: TypeId,
  cadenceId: CadenceId,
  addonIds: string[],
): Quote {
  const type = PROJECT_TYPES.find((t) => t.id === typeId) ?? PROJECT_TYPES[0];
  const cadence = CADENCES.find((c) => c.id === cadenceId) ?? CADENCES[1];

  const addonTotal = ADDONS.filter((a) => addonIds.includes(a.id)).reduce(
    (sum, a) => sum + a.price,
    0,
  );

  const multiplier = volumeMultiplier(cadence.perMonth);
  const perVideo = Math.round((type.rate + addonTotal) * multiplier);

  return {
    perVideo,
    perMonth: cadence.perMonth,
    monthly: perVideo * cadence.perMonth,
    discount: Math.round((1 - multiplier) * 100),
    firstCutDate: addWorkingDays(type.firstCut),
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
