# Floyd Prism Portfolio — Product Requirements

Consolidated from the four source PRDs in `../../`. Where those documents disagree, this file is authoritative and [DECISIONS.md](DECISIONS.md) records why.

## What this is

The personal engineering portfolio of Surya Pratik — embedded systems, IoT, and applied ML. It exists to convert a recruiter, professor, or collaborator who has thirty seconds into someone who reads a project page.

## The narrative

White light enters a prism and refracts into six wavelengths. Each wavelength is a capability. The site is that diagram, unfolded down the page:

| Token    | nm  | Capability           |
| :------- | :-- | :------------------- |
| `--v400` | 400 | Embedded systems     |
| `--v450` | 450 | Software engineering |
| `--v500` | 500 | AI / ML              |
| `--v560` | 560 | Leadership           |
| `--v600` | 600 | Research             |
| `--v680` | 680 | Hardware             |

The prism is not decoration. It is the reason the colour system exists, and colour appears nowhere that is not tied to a capability.

## Design principles

- **Subtlety over spectacle.** If a visitor notices the animation before the content, the animation is wrong.
- **Monochrome by default.** Colour is reserved for the spectrum. Neutral surfaces, one accent per context.
- **Motion communicates physics.** Weight, natural acceleration, no bounce, no wobble. Slow and deliberate.
- **Typography over colour.** Rhythm, hierarchy, and whitespace carry the page. Fonts are fixed: Space Grotesk (display), Inter (sans), IBM Plex Mono (mono).
- **Every element justifies itself.** The question is always what can be deleted.

## Audience

Recruiters and hiring managers (skim: does this person build real things?), professors and research leads (depth: is the engineering sound?), and peers or collaborators (breadth: what do they know?).

## Success criteria

**Performance** — LCP under 1.5 s on desktop and mobile. CLS near zero. Minimal JavaScript; no library ships unless it earns its bytes.

**Accessibility** — WCAG AA. Full keyboard operation, correct semantics, `prefers-reduced-motion` honoured, 4.5:1 minimum on text in both themes on both surfaces.

**Qualitative** — the visitor should not think "nice animation." They should think "this person has exceptional attention to detail," without being able to say why.

## Scope

**In:** the six project pages, the refraction narrative, the spectrometer rail, the leadership timeline, the skills matrix, light/dark themes.

**Out:** a CMS, a blog, analytics, a contact form (mailto is sufficient), and any 3D/WebGL hero — see [D-001](DECISIONS.md#d-001).
