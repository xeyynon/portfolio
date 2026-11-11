/**
 * The CSI-Sense room: what is in it and when. Pure geometry and timing, no canvas.
 *
 * This is a drawing of the idea, not recorded data: the waves, the way they
 * bend and the strip under the room are made up to show a signal being
 * disturbed by a person. The page says so beside the figure.
 */

export type Point = [number, number];

/**
 * What the visitor can put in the room. These three are for the drawing only;
 * they are not the classes the team's model was trained on.
 */
export const MODES = [
  {
    key: "empty",
    label: "Empty room",
    caption: "No one is in the room. The signal crosses to the four receivers undisturbed, and the strip stays flat.",
  },
  {
    key: "still",
    label: "Someone standing still",
    caption:
      "Someone stands in the signal's path. The waves bend round them, so what the receivers pick up is no longer what the empty room gave: that difference is presence.",
  },
  {
    key: "moving",
    label: "Someone moving",
    caption:
      "The person moves, and the signal at the receivers keeps changing with them. The change over time is what a CSI spectrogram holds, and what the classifier reads as activity.",
  },
] as const;

export const EMPTY = 0;
export const STILL = 1;
export const MOVING = 2;

/** Layout, as fractions of the room: x across its width, y down its height. */
export const ROUTER: Point = [0.09, 0.4];
export const RECEIVERS: Point[] = [
  [0.94, 0.14],
  [0.94, 0.36],
  [0.94, 0.58],
  [0.94, 0.8],
];
export const FLOOR = 0.92;
export const PERSON_TALL = 0.6; // of the room's height

export const WAVE_SECONDS = 1.4; // from one wavefront leaving the router to the next
export const WAVE_GAP = 0.11; // between wavefronts, in room widths

const SWAY = 0.8; // how fast the person walks to and fro, radians a second

/** A moment caught mid-stride, with waves right across the room: what reduced motion shows. */
export const STILL_TIME = 0.6;

/** Where the person stands, across the room. */
export function personX(mode: number, time: number): number {
  return mode === MOVING ? 0.5 + 0.15 * Math.sin(time * SWAY) : 0.5;
}

/** How fast they are moving and which way: -1 to 1, 0 when still. */
export function personPace(mode: number, time: number): number {
  return mode === MOVING ? Math.cos(time * SWAY) : 0;
}

/** How far the legs and arms are swung, -1 to 1. A walk when moving, a stance when still. */
export function personSwing(mode: number, time: number): number {
  return mode === MOVING ? Math.sin(time * 4) * (0.35 + 0.65 * Math.abs(personPace(mode, time))) : 0.25;
}

/** The person as the waves meet them: a standing bar, in the picture's own units. */
export type Body = { x: number; top: number; bottom: number };

export type FrontPoint = { x: number; y: number; strength: number };

const smooth = (from: number, to: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

/**
 * One wavefront: the right-hand half of a ring of `radius` round `source`.
 * Where the ring has passed the body it lags and weakens in the body's
 * shadow, and closes up again further on, so the front is seen to bend round.
 * `reach` is how far past the body the dent is deepest; `lag` is how deep.
 */
export function wavefront(
  source: Point,
  radius: number,
  body: Body | null,
  reach: number,
  lag: number,
  samples = 64,
): FrontPoint[] {
  const points: FrontPoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const angle = -Math.PI / 2 + (i / samples) * Math.PI;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let r = radius;
    let strength = 1;
    if (body && cos > 0.05) {
      const toBody = (body.x - source[0]) / cos;
      if (radius > toBody) {
        const meetY = source[1] + toBody * sin;
        const edge = (body.bottom - body.top) * 0.08;
        // 1 well inside the body's shadow, 0 clear of it.
        const shade = smooth(-edge, edge, Math.min(meetY - body.top, body.bottom - meetY));
        const past = (radius - toBody) / reach;
        r = radius - lag * shade * past * Math.exp(1 - past);
        strength = 1 - 0.8 * shade * Math.exp(-past / 2);
      }
    }
    points.push({ x: source[0] + r * cos, y: source[1] + r * sin, strength });
  }
  return points;
}

/** The strip under the room: how the signal changes over time, column by column. */
export const STRIP_COLS = 56;
export const STRIP_ROWS = 9;
export const COL_SECONDS = 0.22;

const noise = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * One column of the strip: how much each row is stirred, 0 to 1, at this
 * moment. Empty gives nothing, someone still gives a thin steady
 * band, someone moving gives a band that swings with their pace.
 */
export function stripColumn(mode: number, time: number, index: number): number[] {
  const mid = (STRIP_ROWS - 1) / 2;
  const pace = personPace(mode, time);
  const centre = mid - pace * (mid - 1);
  const strength = mode === EMPTY ? 0 : mode === STILL ? 0.34 : 0.45 + 0.5 * Math.abs(pace);
  const spread = mode === MOVING ? 1.15 : 0.7;
  return Array.from({ length: STRIP_ROWS }, (_, row) => {
    const d = (row - centre) / spread;
    return Math.min(1, strength * Math.exp(-d * d) * (0.8 + 0.4 * noise(index, row)));
  });
}

/** A full strip for one mode: what reduced motion shows, with nothing left to build. */
export function fullStrip(mode: number): number[][] {
  return Array.from({ length: STRIP_COLS }, (_, i) => stripColumn(mode, i * COL_SECONDS, i));
}
