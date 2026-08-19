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

## D-006 — The prism became WebGL, but not via Three.js

**Date:** 2026-07-29 · **Status:** Accepted · **Supersedes the conclusion of [D-001](#d-001)**

The user reversed D-001 and asked for the prism to become the site's 3D centrepiece. D-001's *reasoning* still held, so only its conclusion was overturned: the hero is now WebGL, but hand-written GLSL rather than Three.js.

The scene is one convex solid and one light. A scene graph, loaders, and a PBR material system buy nothing here — and the thing that actually matters, per-wavelength dispersion, cannot be expressed by `MeshPhysicalMaterial` at all. Custom GLSL was required either way; Three.js would only have added ~600 KB around it. The renderer is ~6 KB, code-split, idle-deferred, and layered over the SVG hero which still ships in the HTML and remains the fallback.

**Consequence:** `three` stays uninstalled. The optics live in `lib/prism.ts` and are unit-testable without a browser — which is how three separate bugs below were caught.

---

## D-007 — Physics generates the spectrum; a gain amplifies it

**Date:** 2026-07-29 · **Status:** Accepted

Three failures had to be fixed before the fan rendered, and each was found by measurement rather than inspection:

1. **Every wavelength totally internally reflected.** At n ≈ 1.66 a 60° prism has a 37° critical angle while the internal ray arrives at ~45°, so no light escaped. Fixed by moving to crown-glass indices and aiming the beam at minimum deviation.
2. **A pose wedge silently killed the spectrum.** Negative yaw with positive pitch re-entered TIR. The boundary was mapped by sweeping the tracer and is now enforced by an explicit clamp (`yawFloor`), verified across 21,500 poses.
3. **The closest-point formula was inverted.** `segmentGlow` divided by `-den`, clamping every ray to its start point, so the fan rendered as dots. Confirmed against brute force over 300 random cases before correcting.

With the optics correct, real dispersion still only spread violet-to-red by ~13°, which reads as one diagonal streak at this aspect ratio. `FAN_GAIN` scales each ray's deviation from the fan's mean to ~31°, matching the established SVG hero.

**Why a gain rather than a stronger glass:** raising the index to widen the fan optically walks straight back into TIR. The gain leaves everything physical intact — wavelength ordering, relative spacing, entry/exit geometry, and the way the fan sweeps as the prism turns — and magnifies only the final angular spread.

**Revisit if:** the canvas aspect changes materially. A taller hero needs less gain.

---

## D-008 — The wordmark gradient is narrative, not decoration

**Date:** 2026-07-29 · **Status:** Accepted

Impeccable's `gradient-text` rule flags the spectrum gradient on the `SURYA PRATIK` wordmark as decorative — generally a fair call, since gradient headings are a common tell.

Kept, on the user's decision. This site's premise is white light refracting into a spectrum where each wavelength is a capability ([PRD.md](PRD.md)). The wordmark is where the beam lands; a solid fill would break the one place the narrative and the name meet. The gradient also predates this work and is drawn entirely from `--v400`…`--v680`, so it obeys the token system rather than introducing a one-off.

Persisted as a scoped ignore: `gradient-text=*` limited to `app/globals.css` in `.impeccable/config.json`. Scoped rather than global so gradient text appearing anywhere else still gets flagged.

**Revisit if:** the wordmark ever stops being the terminus of the beam, or gradients start spreading to other headings — at which point the rule is doing its job and should be re-enabled.

---

## D-009 — Theme script: raw `<script>` and `next/script` both warn in dev; production is clean

**Date:** 2026-07-29 · **Status:** Accepted, no code beyond the `next/script` migration

The pre-hydration theme script in `app/layout.tsx` (prevents a flash of the wrong theme) originally used a raw `<script dangerouslySetInnerHTML>`. On a true cold dev-server start, React 19 logs "Encountered a script tag while rendering React component." Switching to the officially documented `next/script` with `strategy="beforeInteractive"` was the correct fix regardless — but the same warning still fires on cold start with the documented API too.

Verified before accepting this: started a real production server (`next start`, a second port to avoid colliding with the dev preview) and loaded it cold in a fresh tab. Zero console errors. The warning is specific to Turbopack dev mode's handling of `beforeInteractive` scripts on the very first SSR pass in this Next/React version pairing — it does not recur on subsequent client navigation in the same dev session, and it does not exist in what actually ships.

**Why not eliminate the client script entirely** (e.g. read a theme cookie server-side via `next/headers` and skip the script altogether — a strictly better architecture for FOUC prevention when SSR is available): genuinely worth doing, but it's a bigger change than this specific, cosmetic, dev-only, already-verified-harmless finding justifies on its own.

**Revisit if:** the cookie-based server read is undertaken for other reasons, which would remove this dev-mode noise as a side effect.

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
