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
| **WebGL video wall** | Hero only (`components/webgl/`) | Loaded lazily, desktop only |
| **Scroll-as-timeline** | Fixed rail, `components/TimelineRail.tsx` | Pure DOM |
| **Lit CSS 3D** | Every card (`.lit` + `useLitSurface`) | Pure CSS + one rAF |

The mock gave every card its own `perspective`, so nothing shared a vanishing
point and elements only rotated — they never moved in Z. Here a single
`perspective` is declared once on `.scene` and inherited, depth layers translate
in Z, and a pointer-tracked specular highlight moves against the shadow the way
it would under a real light. That, plus damped easing instead of snapping the
transform straight to the cursor, is most of the difference in feel.

## Swapping in real footage

**This site currently ships the mock's placeholder content.** Clients, team,
quotes and metrics in `lib/data.ts` are invented and must be replaced.

To use real video, add an mp4 to `public/reels/` and set `reel` on the project:

```ts
{
  slug: "deep-field-ep-14",
  reel: "/reels/deep-field.mp4",   // ← that's the whole change
  poster: "/reels/deep-field.jpg", // optional grid thumbnail
  featured: true,                  // also appears on the hero wall
}
```

Any project with a `reel` renders real video in the hero wall, the work grid and
its case study. Projects without one fall back to a procedural shader that reads
as footage, so the site looks finished while you gather assets.

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

Two non-obvious things, both of which cost real debugging time:

**Uniforms are written through the material ref, not the prop object.** R3F does
not necessarily bind the exact object passed as `uniforms=`, so mutating that
object per-frame can silently never reach the GPU. `VideoWall.tsx` writes via
`material.current.uniforms`.

**GLSL `smoothstep` is undefined when `edge0 > edge1`.** A descending
`smoothstep(1.15, 0.28, r)` vignette returned 0 on some drivers and blacked out
every plane. Falloffs are written ascending and inverted.

Also: the entrance animation uses its own delta accumulator rather than
`state.clock.elapsedTime`, because the clock is stopped and reset whenever
`frameloop` toggles for the offscreen pause.

## Accessibility & performance

- `prefers-reduced-motion` disables the wall, parallax, reveals and the CSS 3D
- Content is visible by default; `js-ready` opts into hiding it only once JS can
  animate it back, so a JS failure can't leave the page blank
- The wall renders frames only while on screen (IntersectionObserver → `frameloop`)
- No polling anywhere; the mock ran a `setInterval` every 700ms for the life of
  the page
