<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working in this repo

Read [PRD.md](PRD.md) for what this site is, [ARCHITECTURE.md](ARCHITECTURE.md) for how it is built, and [DECISIONS.md](DECISIONS.md) before proposing anything that contradicts a past call. [TASKS.md](TASKS.md) is the live backlog.

## Non-negotiables

1. **Question the dependency.** This project removed six unused packages in its first cleanup. Before adding one, state what it does that CSS or a platform API cannot. `three`, `gsap`, and `framer-motion` were all deliberately removed — see [DECISIONS.md](DECISIONS.md#d-001).
2. **Interactive means `<button>` or `<a>`.** Never `onClick` on a `<div>` or `<span>`. Every control needs an accessible name, a visible focus ring, and keyboard operation.
3. **Colour comes from tokens, never literals.** The spectrum has two tunings (`--spec-bright-*` for dark surfaces, `--spec-deep-*` for cream). Use `var(--v500)` and let the surface binding pick the tuning. A hex literal in a component is a bug.
4. **Both themes, both surfaces.** The cream panel exists in dark theme and the near-black panel exists in light theme. Four combinations, all of which must clear 4.5:1. Check before shipping colour work.
5. **Assets are a budget, not a detail.** Nothing over ~2 MB ships without a click-to-load gate. See [DECISIONS.md](DECISIONS.md#d-003).
6. **Measure before claiming.** `npm run build`, `npm run lint`, and an actual look in a browser. Do not report work as done on the strength of the diff alone.

## Commands

```bash
npm run dev
```

```bash
npm run build && npm run lint
```
