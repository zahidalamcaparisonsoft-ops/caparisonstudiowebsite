/**
 * Sizing a picture to the film inside it.
 *
 * Shared by every surface that plays something — the work stage and the
 * testimonial player — because they had the same bug for the same reason: a
 * fixed 16:9 box, and a vertical cut arriving as a thin strip of picture
 * between two black bars.
 */

/* A stray oEmbed reading, or a hand-entered number, should not be able to hand
   a player a shape that cannot fit on a screen. Neither bound clips a real
   9:16 (0.5625) or 16:9 (1.78) film. */
export const MIN_ASPECT = 0.5;
export const MAX_ASPECT = 2.4;

/** The film's width/height, bounded, falling back to widescreen. */
export function ratioOf(aspect?: number) {
  if (!aspect || aspect <= 0) return 16 / 9;
  return Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, aspect));
}

/**
 * The picture's box: its own aspect, and never taller than `capVh` of the
 * viewport.
 *
 * `aspect-ratio` alone will not hold it — with `width: 100%` a `max-height`
 * leaves the box its full width and breaks the ratio instead of shrinking it.
 * Capping the *width* at `cap × ratio` bounds the height to `cap` while the
 * ratio does the rest, so the box shrinks rather than distorts.
 *
 * The cap is well under 100 because something always sits under the picture —
 * a strip of other films, a row of figures — and has to be on screen with it.
 */
export function pictureBox(ratio: number, capVh: number) {
  return {
    aspectRatio: String(ratio),
    width: `min(100%, ${(capVh * ratio).toFixed(1)}vh)`,
  };
}

/**
 * The picture's box, at the height a widescreen film would take in this column.
 *
 * Every shape comes out the same height, so switching between a widescreen
 * testimonial and a vertical one never moves anything under the picture. The
 * height is not a number picked in advance: it is whatever 16:9 works out to
 * across the column, so it tracks the layout instead of fighting it.
 *
 * The arithmetic is one line. A widescreen film takes the full width, making
 * the height `width / (16/9)`. Any other shape must reach that same height, so
 * its width is `height x ratio` — which reduces to `ratio / (16/9)` of the
 * column. A 9:16 cut lands at just under a third of the width, and the two
 * boxes stand level.
 *
 * `min(100%, ...)` only bites on something wider than 16:9, which would
 * otherwise ask for more width than the column has.
 */
export function pictureAtSharedHeight(ratio: number, base = 16 / 9) {
  return {
    aspectRatio: String(ratio),
    width: `min(100%, ${((ratio / base) * 100).toFixed(3)}%)`,
  };
}
