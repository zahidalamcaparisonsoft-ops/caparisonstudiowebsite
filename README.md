# Caparison Studio — website

Next.js 16 + React Three Fiber rebuild of the original single-file design mock
(`Caparison Studio - Portfolio Site.html`, kept in the repo for reference).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## What the 3D actually is

Three layers, deliberately separated so the expensive one is small:

| Layer | Where | Cost |
|---|---|---|
| **Fanned work deck** | `components/WorkDeck.tsx` | CSS 3D, one shared perspective |
| **Scroll-as-timeline** | Fixed rail, `components/TimelineRail.tsx` | Pure DOM |
| **Lit CSS 3D** | Every card (`.lit` + `useLitSurface`) | Pure CSS + one rAF |

The mock gave every card its own `perspective`, so nothing shared a vanishing
point and elements only rotated — they never moved in Z. Here a single
`perspective` is declared once on `.scene` and inherited, depth layers translate
in Z, and a pointer-tracked specular highlight moves against the shadow the way
it would under a real light. That, plus damped easing instead of snapping the
transform straight to the cursor, is most of the difference in feel.

## The hero

Light section: centred serif eyebrow, oversized headline, one pill CTA, then a
large rounded media panel carrying the demo reel. Figures sit over the footage
and the client bar is notched into the panel's bottom edge with concave corners.

It is the only light section above the fold, so the header inverts while it is
over it (`overLight` in `Header.tsx`, measured from this section's box).

### Putting the demo on Vimeo

`components/HeroMedia.tsx` holds one constant:

```ts
export const VIMEO_ID = ""; // ← put the Vimeo id here
```

Set it to the digits from `vimeo.com/1234567890` and the Vimeo player takes
over. Until then the panel plays the local placeholder reel, so the page is
never broken while you upload.

The embed uses `background=1`, which is Vimeo's chromeless autoplay/loop/muted
mode — the only mode that autoplays reliably, and the right one for a hero.
`dnt=1` asks Vimeo not to track viewers.

## The work deck

A fanned hand of cards. Drag, scroll horizontally, use the arrow keys, or click
a card to bring it to centre; click the centre card and it flips open into a
detail view with that project's deliverables beneath. Click a deliverable and it
maximises and autoplays.

Cards rotate about a pivot *below* the deck (`transform-origin: 50% 165%`) —
that is what makes them splay like a hand rather than slide like a carousel.

Two things that are load-bearing:

- **The fan spread is a JS breakpoint, not a CSS one**, because it lives in
  inline transforms. On phones the full-width spread pushed the page to 486px
  wide; `compact` narrows the angle and culls the outer cards.
- **Vertical wheel is deliberately not captured.** Hijacking page scroll to
  drive a carousel strands anyone who just wants to get past the section.

Clip metadata lives in `lib/clips.ts`, keyed by project slug. Give a clip its
own `src`/`poster` to use real media; without one it falls back to the
placeholder reel.

## Swapping in real footage

**This site currently ships the mock's placeholder content.** Clients, team,
quotes and metrics in `lib/data.ts` are invented and must be replaced.

To use real video, add an mp4 to `public/reels/` and set `reel` on the project:

```ts
{
  slug: "deep-field-ep-14",
  reel: "/reels/deep-field.mp4",   // ← that's the whole change
  poster: "/reels/deep-field.jpg", // optional grid thumbnail
  featured: true,                  // leads the work grid
}
```

Any project with a `reel` renders real video in the work grid and its case study.
Projects without one fall back to a tinted placeholder frame, so the site looks
finished while you gather assets. The hero reel is separate — see above.

For the raw-vs-final scrubber, pass real media:

```tsx
<BeforeAfter beforeSrc="/reels/raw.mp4" afterSrc="/reels/final.mp4" />
```

Without those props it renders synthesised stand-in frames (`SynthRaw` /
`SynthFinal` in `components/BeforeAfter.tsx`) — delete those two functions once
real stills or clips exist.

## Before you launch

- [ ] Replace all placeholder content in `lib/data.ts`
- [ ] Replace the illustrative rates in `lib/quote.ts` and `components/Pricing.tsx`
- [ ] Set the real domain in `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`
- [ ] Wire up brief delivery — see the marked block in `app/api/brief/route.ts`
      (Resend example included); until then submissions only log server-side
- [ ] Point the footer social links at the real accounts
- [ ] Supply the real brand font if one is licensed (currently Poppins/Manrope/
      JetBrains Mono as the mock noted)

## Notes for whoever picks this up

Three non-obvious things, all of which cost real debugging time:

**Uniforms are written through the material ref, not the prop object.** R3F does
not necessarily bind the exact object passed as `uniforms=`, so mutating that
object per-frame can silently never reach the GPU. `CloudField.tsx` writes via
`material.current.uniforms`.

**`perspective` breaks `position: fixed`.** An element with `perspective` (our
`.scene` helper) becomes the containing block for fixed descendants, so a
full-screen overlay inside one sizes itself to that section, not the viewport.
The hero deliberately does not use `.scene`.

**GLSL `smoothstep` is undefined when `edge0 > edge1`.** A descending
`smoothstep(1.15, 0.28, r)` vignette returned 0 on some drivers and blacked out
every plane. Falloffs are written ascending and inverted.

Also: animation uses its own delta accumulator rather than
`state.clock.elapsedTime`, because the clock is stopped and reset whenever
`frameloop` toggles for the offscreen pause.

## Accessibility & performance

- `prefers-reduced-motion` freezes the clouds and disables reveals and the CSS 3D
- Content is visible by default; `js-ready` opts into hiding it only once JS can
  animate it back, so a JS failure can't leave the page blank
- The cloud canvas renders only while on screen (IntersectionObserver → `frameloop`)
- No polling anywhere; the mock ran a `setInterval` every 700ms for the life of
  the page
