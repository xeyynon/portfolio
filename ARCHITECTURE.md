# Architecture

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4 for layout utilities, hand-written CSS for the design system. Two runtime dependencies: `next` and `lucide-react` (two icons). No animation library, no 3D library, no state manager — see [D-001](DECISIONS.md#d-001).

Every route is statically prerendered. There is no server, no database, and no API.

## Layout

```
app/
  layout.tsx              Root shell: fonts, theme script, skip link, <main>
  page.tsx                Home — hero, work, about, leadership, achievements, skills, contact
  globals.css             The entire design system
  projects/[slug]/page.tsx  Project detail, SSG via generateStaticParams
components/
  PrismHero.tsx           SVG refraction diagram, plays on intersection
  IntroSequence.tsx       Once-per-session word sequence, skippable
  DeckViewer.tsx          Click-to-load PDF gate
  LeadershipTimeline.tsx
  ui/Header.tsx           Nav + theme toggle
  ui/Rail.tsx             Spectrometer scroll index
data/
  portfolioData.ts        Single source of truth for all content
```

`data/portfolioData.ts` is the only content file. Projects, achievements, skills, and leadership all live there, typed, and cross-reference each other by **explicit fields** — `Project.skills`, `Project.short`, `Achievement.slug`. Never re-introduce substring matching between them; that was the bug fixed in [D-004](DECISIONS.md#d-004).

## The colour system

Two tunings of six hues:

```
--spec-bright-*   legible on near-black
--spec-deep-*     legible on cream
```

`--v400` … `--v680` are bound to whichever tuning suits the **surface**, not the theme:

```css
:root,                       .light-panel { deep }
:root.light .light-panel     :root.light  { deep }
```

Read as: whatever is dark uses bright, whatever is cream uses deep. Because `.light-panel` is cream in dark theme and near-black in light theme, the two theme rules simply swap. Components only ever reference `var(--v500)` and get the correct tuning automatically.

Neutral tokens (`--bg-dark`, `--ink-hi`, `--line-dark`, `--nav-bg`, `--tick-idle`) invert wholesale in `:root.light`.

## Theming

The theme is a `light` class on `<html>`. An inline synchronous script in `layout.tsx` applies it from `localStorage` before first paint, so there is no flash. `Header` reads it through `useSyncExternalStore` subscribed to a `themechange` event — external DOM state that React does not own, so there is no effect and no sync-on-mount.

## Motion

All animation is CSS. `PrismHero` toggles a `.play` class from an `IntersectionObserver`; the keyframes do the rest. Transforms and opacity only, so everything stays on the compositor. `prefers-reduced-motion: reduce` is honoured in both the CSS and the JS entry points.

## Performance posture

- Slide decks are gated behind `DeckViewer`; the PDF is never requested until the visitor clicks. See [D-003](DECISIONS.md#d-003).
- Fonts are `next/font` (self-hosted, no layout shift).
- The intro overlay mounts on the frame *after* first paint and only once per session, so it never delays LCP.
