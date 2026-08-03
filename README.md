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
| **WebGL cloud bank** | Hero only (`components/webgl/`) | One quad, loaded lazily |
| **Scroll-as-timeline** | Fixed rail, `components/TimelineRail.tsx` | Pure DOM |
| **Lit CSS 3D** | Every card (`.lit` + `useLitSurface`) | Pure CSS + one rAF |

The mock gave every card its own `perspective`, so nothing shared a vanishing
point and elements only rotated — they never moved in Z. Here a single
`perspective` is declared once on `.scene` and inherited, depth layers translate
in Z, and a pointer-tracked specular highlight moves against the shadow the way
it would under a real light. That, plus damped easing instead of snapping the
transform straight to the cursor, is most of the difference in feel.

## The hero

Navbar, then the reel, then a drifting cloud bank beneath it. Scrolling clears
the clouds while the next section rises over the pinned hero.

The section is `200svh` tall with a `100svh` sticky stage inside. That travel
figure is not arbitrary: the following block carries `-mt-[100svh]`, so its
document top sits exactly one viewport down and reaches the top of the screen
precisely as the hero finishes clearing. Change one and you must change the
other, or a band of empty black opens up between them.

Clicking the reel opens a full-frame cinema view with a timecode/scrub/mute HUD;
Escape closes it. The header and scroll rail hide via a `cinema-open` class on
`<html>` so the chrome leaves the picture.

`public/reels/showreel-hero.mp4` is a **generated placeholder** — three abstract
looks cross-dissolved, made with ffmpeg, graded to the studio palette. Replace
the file to use a real reel; nothing else needs to change.

The cloud bank is one fullscreen quad running an fbm shader
(`components/webgl/cloudShader.ts`). Scroll progress drives `uDissipate`.

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
