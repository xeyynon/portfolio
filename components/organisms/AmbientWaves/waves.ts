/**
 * The six areas as one branching timeline, by the same formula the opening's
 * shader uses (INSIDE_FRAG in scene/sphere/shaders.ts), so the lines drawn
 * here are the same lines, not lookalikes. Keep the numbers in both the same.
 *
 * On the left the six run together as one line (their colours add up to
 * near white); one after another they peel off it into their own branches,
 * each on its own swing; and here and there a strand crosses from one branch
 * to another, as branches of a timeline do.
 *
 * Units are the shader's: x and y in screen heights from the centre of the
 * screen, y upward. `half` is half the screen's width in those units, so the
 * branching sits the same way on a phone and on a wide screen.
 */

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Where across the screen (-1 left edge, 1 right edge) each branch starts to leave the line. */
export const SPLIT = [-0.62, -0.4, -0.18, -0.74, -0.52, -0.3];
const SPLIT_LENGTH = 0.55;

/** The one line they share before they part. */
const trunk = (x: number, t: number) => 0.035 * Math.sin(x * 2.2 + t * 0.24);

/** Branch `i` on its own: its height on the screen and its own swing. */
const own = (i: number, x: number, t: number) => {
  const amp = 0.045 + 0.012 * i;
  const k = 2.6 + i * 0.55;
  const ph = t * (0.22 + 0.04 * i) + i * 1.7;
  return (i - 2.5) * 0.115 + amp * Math.sin(x * k + ph);
};

/** How far branch `i` has left the line at `x`: 0 still on it, 1 on its own. */
export const parted = (i: number, x: number, half: number) =>
  smooth(SPLIT[i], SPLIT[i] + SPLIT_LENGTH, x / half);

/** Height of branch `i` at `x`, at time `t` (seconds on the shared wave clock). */
export function waveY(i: number, x: number, t: number, half: number): number {
  const s = parted(i, x, half);
  return trunk(x, t) * (1 - s) + own(i, x, t) * s;
}

/** Brightness of branch `i` at `x`: lower while all six share the line, so it is not six times as bright. */
export const weight = (i: number, x: number, half: number) => 0.4 + 0.6 * parted(i, x, half);

/**
 * The strands that cross between branches: from branch `a` to branch `b`,
 * over the stretch starting at `at` (-1..1 across the screen).
 */
export const LINKS = [
  { a: 0, b: 1, at: 0.08 },
  { a: 3, b: 5, at: 0.02 },
  { a: 2, b: 4, at: 0.42 },
  { a: 1, b: 3, at: 0.62 },
];
const LINK_LENGTH = 0.3;

/** Height of a strand at `x`, and how much of it shows there (0 outside its stretch). */
export function linkAt(link: (typeof LINKS)[number], x: number, t: number, half: number): { y: number; show: number } {
  const u = x / half;
  const show = smooth(link.at - 0.04, link.at, u) * (1 - smooth(link.at + LINK_LENGTH, link.at + LINK_LENGTH + 0.04, u));
  const m = smooth(link.at, link.at + LINK_LENGTH, u);
  const y = waveY(link.a, x, t, half) * (1 - m) + waveY(link.b, x, t, half) * m;
  return { y, show };
}

/**
 * How the waves are carried after the opening: 1 at the hand-off (exactly
 * as the opening left them), easing down to a quiet `REST` once the reader
 * is most of a screen into the next section. `scrolled` is how far past the
 * hand-off the page has moved, in screen heights.
 */
export const REST = 0.07;
const ease = (scrolled: number) => smooth(0, 0.7, scrolled);
export const strength = (scrolled: number) => 1 - (1 - REST) * ease(scrolled);

/** How fast time runs for them: full speed at the hand-off, almost still at rest, so they do not draw the eye. */
export const pace = (scrolled: number) => 1 - 0.9 * ease(scrolled);
