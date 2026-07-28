# Decisions

Append-only. Each entry records what was decided, what it cost, and what would justify revisiting it.

---

## D-001 — The prism stays SVG, not WebGL

**Date:** 2026-07-28 · **Status:** Accepted

The Feature PRD specifies a Three.js prism with refraction, bloom, volumetric light, and particles. The Technical Architecture PRD specifies minimal JavaScript, no animation frameworks, and LCP under 1.5 s. These cannot both hold: a Three.js hero with post-processing is roughly 600 KB of JS plus a shader compile before first paint.

We keep the inline SVG prism. It tells the same beam → refraction → spectrum story in about 2 KB of markup and pure CSS keyframes, and the effort goes into motion quality instead of renderer setup.

**Consequence:** removed `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`, `gsap`, `framer-motion`, `react-pdf`, and `zustand` — all had zero imports.

**Revisit if:** the hero becomes the site's primary differentiator *and* the budget is renegotiated. Any WebGL version must lazy-mount behind a static poster and be gated on pointer-fine + no reduced-motion.

---

## D-002 — Spectrum tuning binds to surface, not theme

**Date:** 2026-07-28 · **Status:** Accepted

The first attempt at fixing light-mode contrast overrode the spectrum inside `:root.light`. That was wrong: the cream `.light-panel` exists in *dark* theme too, where cyan `#4FD8E0` on `#F5F3EE` measures about 1.6:1. The About section's animated "Learning." was failing contrast in the default theme, and nobody had noticed.

Colour tuning is now a property of the surface. Two token sets, bound by the selectors documented in [ARCHITECTURE.md](ARCHITECTURE.md#the-colour-system).

**Consequence:** four surface/theme combinations to verify instead of two, but components stay ignorant of both.

---

## D-003 — Slide decks are compressed and click-to-load

**Date:** 2026-07-28 · **Status:** Accepted

`public/sources/PPTs/` held 54 MB, mounted in an eager `<iframe>`. Visiting the CSI project page began a 31 MB download immediately, which made the 1.5 s LCP target unreachable on that route.

Embedded raster images were downsampled to 1600 px at JPEG q=72 — visually indistinguishable at presentation scale, verified by rendering pages from both versions side by side. All 74 pages across five decks were render-checked.

| Deck   | Before  | After   |
| :----- | :------ | :------ |
| CSI    | 32.0 MB | 2.23 MB |
| Water  | 12.6 MB | 1.69 MB |
| LIFI   | 7.18 MB | 2.56 MB |
| ECOX   | 1.49 MB | 1.02 MB |
| FLOWIQ | 1.00 MB | 0.98 MB |
| **Total** | **54.3 MB** | **8.48 MB** |

`DeckViewer` additionally gates the iframe behind a click, so the PDF is not requested on page load at all.

**Note for anyone re-running the compression:** PyMuPDF's `update_stream` defaults to `compress=True`, which deflates the JPEG bytes while the `/DCTDecode` filter claims otherwise, producing a PDF no renderer can decode. Pass `compress=False`.

**Revisit if:** decks need to be re-exported from source. Compress before committing; originals are recoverable from git history.

---

## D-004 — Content cross-references are explicit fields

**Date:** 2026-07-28 · **Status:** Accepted

The skills grid joined to projects by lowercasing skill names and substring-matching them against project stacks and prose, then re-derived display names from a hardcoded chain of title fragments. `Git`, `C++`, and `Java` silently matched nothing.

Projects now declare `skills: string[]` and `short: string`; achievements declare `slug`. Joins are equality on those fields.

**Consequence:** adding a project means filling in two more fields. The type system enforces it.

---

## D-005 — Interactive elements are real elements

**Date:** 2026-07-28 · **Status:** Accepted

The theme toggle was a `<span onClick>` and the rail ticks were `<div onClick>` — neither focusable, neither keyboard-operable, neither named. The CSS already styled `.tick:focus-visible`, which nothing could trigger.

Both are `<button>` now, with accessible names, and the layout gained a skip link and a `<main>` landmark.

**Rule going forward:** no click handler on a non-interactive element, ever.
