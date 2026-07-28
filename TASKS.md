# Tasks

## Done — Phase 1: Audit & Foundation

- [x] Full codebase audit; findings recorded in [DECISIONS.md](DECISIONS.md)
- [x] Removed 8 unused packages (`three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`, `gsap`, `framer-motion`, `react-pdf`, `zustand`)
- [x] Deleted dead files: four placeholder `data/*.ts` stubs, unused `store/`, five Next scaffold SVGs
- [x] Deduplicated `globals.css` — the prism block was defined twice; removed orphaned `.certs` and `.pdetail` rules
- [x] Fixed `.nav-inner .logo` selector that had never matched its markup
- [x] Theme toggle and rail ticks are keyboard-operable `<button>`s with accessible names
- [x] Added skip link and `<main>` landmark; project page `<main>` → `<article>` to avoid nesting
- [x] Fixed light-mode contrast by binding spectrum tuning to surface ([D-002](DECISIONS.md#d-002))
- [x] Tokenised the hardcoded nav background so it inverts with the theme
- [x] Intro sequence: once per session, skippable, no longer blocks first paint
- [x] Theme persists to `localStorage`, applied pre-paint by an inline script
- [x] Replaced the substring skills↔projects join with explicit fields ([D-004](DECISIONS.md#d-004))
- [x] Replaced the hover-only skills tooltip with visible, keyboard-reachable project links
- [x] Typed `LeadershipStage` and `Achievement`; removed the `any`
- [x] Compressed slide decks 54.3 MB → 8.48 MB and gated them behind click-to-load ([D-003](DECISIONS.md#d-003))
- [x] `npm run build` and `npm run lint` clean; verified in browser in both themes

## Next — Phase 2: Typography & rhythm

- [ ] Establish a spacing scale (`--space-1` … `--space-8`) and replace the ad-hoc `px` values
- [ ] Replace the ~30 remaining inline `style` props in `app/page.tsx` with classes
- [ ] Audit vertical rhythm across section boundaries — section padding is currently inconsistent (`56px`, `64px`, `30px`)
- [ ] Set a max measure on body copy; `.about-copy p` caps at 440px but `.pp-desc` at 700px

## Phase 3: Motion quality

- [ ] Replace `ease` on the prism draw with a weighted curve; stagger currently reads as mechanical
- [ ] Scroll-linked parallax on the prism (transform only, `will-change` off by default)
- [ ] Project row hover: the chevron and title currently transition independently — unify the timing
- [ ] Verify every animation against `prefers-reduced-motion`

## Phase 4: Verification

- [ ] Lighthouse on `/` and `/projects/human-presence-detection`, mobile profile, against the LCP < 1.5 s target
- [ ] axe pass on both themes
- [ ] Keyboard-only walkthrough of every route
- [ ] Real-device check: iOS Safari, Android Chrome

## Known issues

- `PrismHero` resets and replays its animation every time it re-enters the viewport. Intentional or not, it should be a deliberate choice — currently it is a side effect of `setPlayed(entry.isIntersecting)`.
- `.pnum`, `.ptag`, and `.eyebrow` are defined in both the home and project-page sections of `globals.css` with different values. They do not currently conflict, but they will.
- `personalInfo.summary` has a missing space after "Chhattisgarh," and reads long for a skim-first audience.
