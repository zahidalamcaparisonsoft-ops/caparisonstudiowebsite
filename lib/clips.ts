/**
 * Deliverables for each project — the row that appears under a card once it
 * flips open, the way an episode list sits under a show.
 *
 * PLACEHOLDER: titles and runtimes are invented. Every clip currently points at
 * the same placeholder file; give a clip its own `src` and `poster` to use real
 * media, and the player picks it up with no other change.
 */

export type Clip = {
  id: string;
  title: string;
  duration: string;
  /** Real media, when you have it. Falls back to the placeholder reel. */
  src?: string;
  poster?: string;
};

export const FALLBACK_CLIP_SRC = "/reels/showreel-hero.mp4";

export const CLIPS: Record<string, Clip[]> = {
  "deep-field-ep-14": [
    { id: "df-1", title: "Cold open", duration: "0:41" },
    { id: "df-2", title: "Full episode", duration: "48:12" },
    { id: "df-3", title: "Clip — the archive answer", duration: "1:12" },
    { id: "df-4", title: "Clip — what nobody says", duration: "0:58" },
    { id: "df-5", title: "Vertical cutdown", duration: "0:46" },
    { id: "df-6", title: "Trailer", duration: "0:32" },
  ],
  "ledger-product-tour": [
    { id: "lg-1", title: "Product tour", duration: "1:52" },
    { id: "lg-2", title: "Sales cut", duration: "1:04" },
    { id: "lg-3", title: "Feature — reconciliation", duration: "0:38" },
    { id: "lg-4", title: "Feature — reporting", duration: "0:35" },
    { id: "lg-5", title: "Vertical teaser", duration: "0:22" },
    { id: "lg-6", title: "Silent loop", duration: "0:18" },
  ],
  "nine-days-north": [
    { id: "nd-1", title: "Festival cut", duration: "22:40" },
    { id: "nd-2", title: "Opening sequence", duration: "3:14" },
    { id: "nd-3", title: "The crossing", duration: "5:02" },
    { id: "nd-4", title: "Trailer", duration: "1:48" },
    { id: "nd-5", title: "Teaser", duration: "0:44" },
    { id: "nd-6", title: "Behind the edit", duration: "6:20" },
  ],
  "vault-daily-uploads": [
    { id: "vt-1", title: "Daily — Monday", duration: "12:06" },
    { id: "vt-2", title: "Daily — Tuesday", duration: "11:48" },
    { id: "vt-3", title: "Daily — Wednesday", duration: "12:31" },
    { id: "vt-4", title: "Weekly recap", duration: "18:02" },
    { id: "vt-5", title: "Shorts pack", duration: "0:52" },
    { id: "vt-6", title: "Channel trailer", duration: "1:10" },
  ],
  "atlas-onboarding-film": [
    { id: "at-1", title: "Onboarding film", duration: "2:18" },
    { id: "at-2", title: "Chapter — setup", duration: "0:44" },
    { id: "at-3", title: "Chapter — importing", duration: "0:39" },
    { id: "at-4", title: "Chapter — permissions", duration: "0:36" },
    { id: "at-5", title: "In-app loop", duration: "0:15" },
    { id: "at-6", title: "Support cutdown", duration: "1:02" },
  ],
  "quiet-hours-ep-62": [
    { id: "qh-1", title: "Full episode", duration: "1:04:20" },
    { id: "qh-2", title: "Cold open", duration: "0:52" },
    { id: "qh-3", title: "Clip — the long pause", duration: "1:26" },
    { id: "qh-4", title: "Clip — on quitting", duration: "1:08" },
    { id: "qh-5", title: "Vertical pack", duration: "0:48" },
    { id: "qh-6", title: "Audiogram", duration: "0:30" },
  ],
  "the-salt-line": [
    { id: "sl-1", title: "Feature cut", duration: "38:04" },
    { id: "sl-2", title: "Structural draft A", duration: "41:12" },
    { id: "sl-3", title: "Opening", duration: "4:06" },
    { id: "sl-4", title: "Trailer", duration: "2:02" },
    { id: "sl-5", title: "Teaser", duration: "0:38" },
    { id: "sl-6", title: "Festival package", duration: "1:24" },
  ],
  "signal-60-shorts": [
    { id: "sg-1", title: "Short — the hook test", duration: "0:48" },
    { id: "sg-2", title: "Short — one claim", duration: "0:41" },
    { id: "sg-3", title: "Short — the reversal", duration: "0:52" },
    { id: "sg-4", title: "Short — proof first", duration: "0:38" },
    { id: "sg-5", title: "Short — no cold intro", duration: "0:44" },
    { id: "sg-6", title: "Batch reel", duration: "2:10" },
  ],
  "rowan-vale-patagonia": [
    { id: "rv-1", title: "Episode 1 — the road south", duration: "14:06" },
    { id: "rv-2", title: "Episode 2 — the pass", duration: "13:22" },
    { id: "rv-3", title: "Episode 3 — weather", duration: "15:41" },
    { id: "rv-4", title: "Series trailer", duration: "1:04" },
    { id: "rv-5", title: "Shorts pack", duration: "0:47" },
    { id: "rv-6", title: "Colour reel", duration: "1:18" },
  ],
};

export function clipsFor(slug: string): Clip[] {
  return CLIPS[slug] ?? [];
}
