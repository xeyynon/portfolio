/**
 * The FlowIQ map: what is drawn and when. Pure data and timing, no canvas.
 *
 * This is a drawing of what routing is, not the app's screen and not a real
 * city: the street grid, the traffic and the blocked road are all made up.
 * The page says so beside it. Coordinates are fractions of the map, x to the
 * right and y down.
 */

export type Point = [number, number];

/** The three steps the map plays through. Only the first names what the app is built on. */
export const STAGES = [
  {
    key: "route",
    label: "Route",
    caption: "A route is drawn through the streets. In the app, routing comes from Google Maps and the Directions API.",
  },
  {
    key: "blocked",
    label: "Road blocked",
    caption: "In this drawing, one road on the route is blocked and the traffic on it stands still.",
  },
  {
    key: "redrawn",
    label: "Route redrawn",
    caption: "The route is drawn again, round the blocked road.",
  },
] as const;

export const LAST_STAGE = STAGES.length - 1;
export const STAGE_SECONDS = 1.6; // a step draws itself in
export const HOLD_SECONDS = 1.4; // then rests before the next, while playing

export type Street = { from: Point; to: Point; minor?: boolean };

const AVENUES = [0.07, 0.27, 0.47, 0.68, 0.9];
const ROWS = [0.13, 0.38, 0.63, 0.88];

/** The grid: avenues top to bottom, rows left to right, then a few lanes that carry no traffic. */
export const STREETS: Street[] = [
  ...AVENUES.map((x): Street => ({ from: [x, 0], to: [x, 1] })),
  ...ROWS.map((y): Street => ({ from: [0, y], to: [1, y] })),
  { from: [0.17, 0.13], to: [0.17, 0.38], minor: true },
  { from: [0.47, 0.255], to: [0.68, 0.255], minor: true },
  { from: [0.575, 0.63], to: [0.575, 0.88], minor: true },
  { from: [0.07, 0.755], to: [0.27, 0.755], minor: true },
  { from: [0.79, 0.63], to: [0.79, 1], minor: true },
  { from: [0.68, 0.38], to: [0.9, 0.13], minor: true },
];

/** The row the block sits on. Its traffic stops when the block appears. */
export const BLOCKED_STREET = AVENUES.length + 2;

export const START: Point = [0.14, 0.63];
export const END: Point = [0.9, 0.24];

/** The blocked stretch: one block of the row, short of the crossings at each end. */
export const BLOCK: [Point, Point] = [
  [0.305, 0.63],
  [0.435, 0.63],
];

/** The first route runs straight along the row, through what becomes the block. */
export const FIRST_ROUTE: Point[] = [START, [0.9, 0.63], END];
/** The second turns off one crossing early and takes the row above. */
export const NEW_ROUTE: Point[] = [START, [0.27, 0.63], [0.27, 0.38], [0.9, 0.38], END];

export type Car = { street: number; offset: number; speed: number };

/** Three cars to a street. Speed is in street lengths a second; its sign is the direction. */
export const CARS: Car[] = STREETS.flatMap((street, i) =>
  street.minor
    ? []
    : [0, 1, 2].map((k) => ({
        street: i,
        offset: (i * 0.37 + k * 0.31) % 1,
        speed: (0.035 + 0.014 * ((i + k) % 3)) * (k % 2 ? -1 : 1),
      })),
);

/** Where a car is on its street after `clock` seconds of moving. It leaves one end and comes back in at the other. */
export function carAt(car: Car, clock: number): Point {
  const { from, to } = STREETS[car.street];
  const f = (((car.offset + car.speed * clock) % 1) + 1) % 1;
  return [from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f];
}

/** How much of something that belongs to `step` is drawn: 0 not yet, 1 fully. */
export function shown(step: number, stage: number, progress: number): number {
  if (stage > step) return 1;
  if (stage === step) return Math.max(0, Math.min(1, progress));
  return 0;
}

/** The length of each leg of a polyline, and the whole. */
function legs(path: Point[]): { lengths: number[]; total: number } {
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    lengths.push(d);
    total += d;
  }
  return { lengths, total };
}

/** The first `fraction` of a polyline, by length: the corners passed, then the point reached. */
export function partial(path: Point[], fraction: number): Point[] {
  const { lengths, total } = legs(path);
  let left = Math.max(0, Math.min(1, fraction)) * total;
  const out: Point[] = [path[0]];
  for (let i = 0; i < lengths.length; i++) {
    if (left <= lengths[i]) {
      const t = lengths[i] ? left / lengths[i] : 0;
      out.push([path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t]);
      return out;
    }
    out.push(path[i + 1]);
    left -= lengths[i];
  }
  return out;
}

/** A point part-way along a polyline, by fraction of its length. */
export function along(path: Point[], fraction: number): Point {
  const reached = partial(path, fraction);
  return reached[reached.length - 1];
}
