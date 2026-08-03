/**
 * "Anatomy of a cut" — the decision log behind one edit.
 *
 * This is the positioning ("cut for retention, not applause") made literal:
 * every choice, what it cost in runtime, and what it returned in retention.
 *
 * PLACEHOLDER: numbers are illustrative. Replace with a real decision log from
 * an episode you have permission to show.
 */

export type EditAction = "cut" | "tighten" | "reorder" | "keep";

export type Decision = {
  /** Start in the raw assembly, seconds. */
  at: number;
  /** Duration of the affected region in the raw assembly, seconds. */
  span: number;
  action: EditAction;
  label: string;
  detail: string;
  /** Percentage points of retention attributed to this decision. */
  delta: number;
};

export const RAW_RUNTIME = 522; // 8:42
export const FINAL_RUNTIME = 310; // 5:10

export const ACTION_META: Record<
  EditAction,
  { label: string; tone: string; dot: string }
> = {
  cut: { label: "Cut", tone: "text-white/45", dot: "bg-white/25" },
  tighten: { label: "Tightened", tone: "text-mint/70", dot: "bg-mint/45" },
  reorder: { label: "Moved", tone: "text-mint", dot: "bg-mint/70" },
  keep: { label: "Kept", tone: "text-mint-bright", dot: "bg-mint" },
};

export const DECISIONS: Decision[] = [
  {
    at: 0,
    span: 54,
    action: "cut",
    label: "Killed the cold intro",
    detail:
      "54 seconds of channel branding and 'before we start' before anyone said anything. Nobody arrives to hear a preamble — this is where the steepest drop was.",
    delta: 11,
  },
  {
    at: 54,
    span: 38,
    action: "reorder",
    label: "Moved the payoff to frame one",
    detail:
      "The sharpest line in the episode was at 6:12. It now opens the video, before the title card. The rest of the edit exists to earn its way back to it.",
    delta: 9,
  },
  {
    at: 92,
    span: 26,
    action: "keep",
    label: "Title card, 4 seconds",
    detail:
      "Kept, but cut from 14 seconds to 4. Branding is worth exactly as long as it takes to read.",
    delta: 2,
  },
  {
    at: 118,
    span: 96,
    action: "tighten",
    label: "Removed 61 filler beats",
    detail:
      "Ums, restarts and dead air between clauses. Individually invisible, collectively a minute and a half of nothing.",
    delta: 6,
  },
  {
    at: 214,
    span: 74,
    action: "cut",
    label: "Dropped the second example",
    detail:
      "It made the same point as the first, less well. Two examples of one idea is one example and a delay.",
    delta: 5,
  },
  {
    at: 288,
    span: 118,
    action: "keep",
    label: "The demonstration, untouched",
    detail:
      "The one stretch that earns its length. Retention is flat across it in the finished cut — nobody leaves during this.",
    delta: 0,
  },
  {
    at: 406,
    span: 58,
    action: "tighten",
    label: "Compressed the recap",
    detail:
      "Trimmed to a single sentence. A recap is for the person who already stayed; it should not tax them.",
    delta: 3,
  },
  {
    at: 464,
    span: 58,
    action: "cut",
    label: "Cut the outro entirely",
    detail:
      "Ending on the last real idea instead of a 58-second sign-off. The end screen does that job without spending runtime.",
    delta: 2,
  },
];

export function timecode(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.floor(Math.max(0, seconds) % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Runtime that survives into the final cut. */
export const SURVIVING = DECISIONS.filter(
  (d) => d.action === "keep" || d.action === "tighten" || d.action === "reorder",
);

export const TOTAL_DELTA = DECISIONS.reduce((sum, d) => sum + d.delta, 0);
