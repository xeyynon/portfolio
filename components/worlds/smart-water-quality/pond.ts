/**
 * The water node's pond: what is drawn and when. Pure data and timing, no
 * canvas.
 *
 * This is a drawing, not the device: the node is shown as a buoy on still
 * water, and a ripple leaves it at the interval the node reports at. Each
 * ripple is three rings, one for each reading the node sends. No reading
 * values are drawn anywhere. Coordinates are fractions of the picture, x to
 * the right and y down.
 */

export type Point = [number, number];

/** From the project: readings go out every 3 s. The ripples keep this time for real. */
export const INTERVAL_SECONDS = 3;

/**
 * The three readings a ripple carries, outermost first. They are told apart
 * by the line each ring is drawn with, not by colour: `dash` is the canvas
 * line dash, and the legend under the picture repeats it.
 */
export const READINGS = [
  { key: "ph", label: "pH", line: "Solid ring", dash: [] as number[] },
  { key: "tds", label: "TDS", line: "Dashed ring", dash: [10, 7] },
  { key: "temperature", label: "Temperature", line: "Dotted ring", dash: [2, 6] },
] as const;

/** Where the node floats. */
export const NODE: Point = [0.5, 0.6];
/** The water is seen from a little above, so a ring is this much flatter than it is wide. */
export const FLATTEN = 0.36;
/** How long a ripple lasts, in seconds: long enough that three or four are on the water at once. */
export const RIPPLE_LIFE = 10;
/** How far apart the three rings of one ripple run, as a fraction of the picture's width. */
export const RING_GAP = 0.024;
/** The moment shown when nothing moves: three ripples on the water, the newest well clear of the node. */
export const STILL_TIME = 8.2;

export type Ripple = {
  /** Seconds since it left the node. */
  age: number;
  /** How far its outer ring has travelled, as a fraction of the picture's width. */
  reach: number;
  /** 1 when it has just left, fading to 0 at the end of its life. */
  strength: number;
};

/** The ripples on the water at `time` seconds, newest first. One leaves at 0 s and one every interval after. */
export function ripples(time: number): Ripple[] {
  const out: Ripple[] = [];
  for (let k = Math.floor(time / INTERVAL_SECONDS); k >= 0; k--) {
    const age = time - k * INTERVAL_SECONDS;
    if (age > RIPPLE_LIFE) break;
    const t = age / RIPPLE_LIFE;
    out.push({ age, reach: 0.05 + 0.66 * t, strength: Math.min(1, age / 0.3) * (1 - t) ** 1.3 });
  }
  return out;
}

/** How bright the node's antenna is: full as a ripple leaves, gone half a second later. */
export function pulse(time: number): number {
  return Math.max(0, 1 - (time % INTERVAL_SECONDS) / 0.5);
}

/** Small glints on the water: where each sits, how long it is, and when it catches the light. */
export const GLINTS: { at: Point; length: number; phase: number }[] = Array.from({ length: 16 }, (_, i) => ({
  at: [(i * 0.618 + 0.09) % 1, 0.1 + ((i * 0.377) % 1) * 0.84] as Point,
  length: 0.02 + ((i * 0.29) % 1) * 0.035,
  phase: i * 1.7,
}));
