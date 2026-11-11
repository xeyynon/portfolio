/**
 * The path of the six stones from the waves to the bar. Pure: scroll in,
 * positions out. Tied to the scroll, not to a clock, so scrolling back up
 * flies them home again.
 */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * How far the stones have gone: 0 while the waves still fill the screen,
 * 1 once the opening has scrolled most of the way off. `bottom` is the
 * opening's bottom edge on screen.
 */
export const flightProgress = (bottom: number, vh: number) => clamp01((vh - bottom) / (vh * 0.55));

/** Stone `i` of `n` leaves a little after the one before it. */
const STAGGER = 0.08;
export function stoneProgress(f: number, i: number, n: number): number {
  const span = 1 - STAGGER * (n - 1);
  return clamp01((f - i * STAGGER) / span);
}

type Box = { x: number; y: number; size: number };

/** Where stone `i` is at its own progress `t`, from its wave to its slot, on a curve that swings out and up. */
export function stoneAt(from: Box, to: Box, t: number, i: number): Box & { turn: number } {
  const e = smooth(t);
  const swing = Math.sin(Math.PI * e);
  return {
    x: from.x + (to.x - from.x) * e + swing * (i % 2 ? 46 : -46),
    y: from.y + (to.y - from.y) * e - swing * 70,
    // a little larger at the top of its swing, so the flight reads
    size: from.size + (to.size - from.size) * e + swing * 10,
    turn: e * 360,
  };
}
