/**
 * The ORCA sky: what is drawn and when. Pure geometry and timing, no canvas.
 *
 * This is a schematic, not the real catalog: a few hundred made-up objects on
 * made-up orbits stand in for the 15,968 the tool screens, and nothing is to
 * scale. The page says so beside it. Lengths are in globe radii; x is to the
 * right, y is up and z is towards the viewer.
 */

export type Vec = [number, number, number];

/** The four steps, in the order of the project's own pipeline. The wording is from its description. */
export const STAGES = [
  {
    key: "catalog",
    label: "Catalog",
    seconds: 1.8,
    caption: "It starts from raw orbit data (TLEs): a catalog of 15,968 objects.",
  },
  {
    key: "search",
    label: "KD-tree search",
    seconds: 1.8,
    caption: "A KD-tree search keeps only the pairs that come within 100 km of each other.",
  },
  {
    key: "refine",
    label: "Refinement",
    seconds: 3.4,
    caption: "Each candidate is then refined in parallel, down to the close approach itself.",
  },
  {
    key: "tiers",
    label: "Risk tiers",
    seconds: 1.6,
    caption: "Close approaches are ranked by collision probability into 5 risk tiers. One day of them is screened in 19 s.",
  },
] as const;

export const LAST_STAGE = STAGES.length - 1;
export const REFINE_STAGE = 2;
export const HOLD_SECONDS = 1.5; // a finished step rests this long before the next, while playing
export const TIERS = 5;

/** A small seeded generator, so the sky is the same on every visit. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const rotateX = (v: Vec, a: number): Vec => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
};
const rotateY = (v: Vec, a: number): Vec => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
};

/** The whole scene is tipped towards the viewer by this much, so the pole shows. */
const VIEW_TILT = 0.4;
export const view = (v: Vec): Vec => rotateX(v, VIEW_TILT);

/** An object on a circular orbit: how far out, how tilted, where the orbit crosses the equator, and where on it the object is. */
export type Body = { radius: number; tilt: number; node: number; phase: number; rate: number };

export const CATALOG: Body[] = (() => {
  const random = seeded(15968);
  return Array.from({ length: 230 }, () => {
    const radius = 1.14 + 0.95 * random() ** 1.7;
    return {
      radius,
      tilt: 0.15 + random() * 1.75,
      node: random() * Math.PI * 2,
      phase: random() * Math.PI * 2,
      // lower orbits go round faster
      rate: 0.2 * radius ** -1.5,
    };
  });
})();

/** Where a body is at `time` seconds, as the viewer sees it. */
export function place(body: Body, time: number): Vec {
  const a = body.phase + body.rate * time;
  const flat: Vec = [Math.cos(a) * body.radius, 0, Math.sin(a) * body.radius];
  return view(rotateY(rotateX(flat, body.tilt), body.node));
}

/** Behind the globe, so not drawn. */
export const hidden = (v: Vec) => v[2] < 0 && Math.hypot(v[0], v[1]) < 1;

/** The globe's grid: parallels and meridians as lines of points on the unit sphere. */
const GRID: Vec[][] = (() => {
  const lines: Vec[][] = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const phi = (lat * Math.PI) / 180;
    lines.push(
      Array.from({ length: 49 }, (_, i): Vec => {
        const lon = (i / 48) * Math.PI * 2;
        return [Math.cos(phi) * Math.cos(lon), Math.sin(phi), Math.cos(phi) * Math.sin(lon)];
      }),
    );
  }
  for (let m = 0; m < 12; m++) {
    const lon = (m / 12) * Math.PI * 2;
    lines.push(
      Array.from({ length: 25 }, (_, i): Vec => {
        const phi = (i / 24 - 0.5) * Math.PI;
        return [Math.cos(phi) * Math.cos(lon), Math.sin(phi), Math.cos(phi) * Math.sin(lon)];
      }),
    );
  }
  return lines;
})();

/** The grid as the viewer sees it, with the globe turned by `spin` radians. */
export const grid = (spin: number): Vec[][] => GRID.map((line) => line.map((p) => view(rotateY(p, spin))));

/** Pairs closer than this count as candidates in the picture, in globe radii. Not the tool's 100 km. */
const NEAR = 0.17;

/** Every pair of visible bodies closer than NEAR. The picture is small enough to check each against each. */
export function nearPairs(places: Vec[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < places.length; i++) {
    if (hidden(places[i])) continue;
    for (let j = i + 1; j < places.length; j++) {
      const a = places[i];
      const b = places[j];
      const dx = a[0] - b[0];
      if (dx > NEAR || dx < -NEAR) continue;
      if (Math.hypot(dx, a[1] - b[1], a[2] - b[2]) < NEAR && !hidden(b)) pairs.push([i, j]);
    }
  }
  return pairs;
}

/** Which of the five tiers a candidate pair is shown in, 0 to 4. Made up, and fixed per pair so it does not flicker. */
export const tierOf = (i: number, j: number) => (i * 7 + j * 13) % TIERS;

/*
 * The two objects the picture follows. Their orbits are built to pass over
 * one point on the near side of the globe, one a little higher than the
 * other, so they close on each other, pass, and part.
 */
const normalise = (v: Vec): Vec => {
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
};
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const MEET = normalise([0.5, 0.34, 0.8]);
const ALONG_A = normalise(cross(MEET, [0, 1, 0]));
const ACROSS = cross(MEET, ALONG_A);
const SPLIT = 1.25; // the angle between the two orbits where they cross
const ALONG_B: Vec = [
  ALONG_A[0] * Math.cos(SPLIT) + ACROSS[0] * Math.sin(SPLIT),
  ALONG_A[1] * Math.cos(SPLIT) + ACROSS[1] * Math.sin(SPLIT),
  ALONG_A[2] * Math.cos(SPLIT) + ACROSS[2] * Math.sin(SPLIT),
];
const PAIR = [
  { radius: 1.5, along: ALONG_A },
  { radius: 1.68, along: ALONG_B },
];

/** How far round from the meeting point the pair starts the refinement step, in radians. */
const SWEEP = 0.95;

/**
 * The pair's angle from the meeting point, `clock` seconds into the
 * refinement step: it starts SWEEP short, is at the closest approach as the
 * step completes, and carries on round after that.
 */
export const pairAngle = (clock: number) => (clock / STAGES[REFINE_STAGE].seconds - 1) * SWEEP;

/** The clock value at which the pair is at its closest approach. */
export const CLOSEST: number = STAGES[REFINE_STAGE].seconds;

/** Where one of the pair (0 or 1) is at `angle` round its orbit. */
export function pairPlace(which: 0 | 1, angle: number): Vec {
  const { radius, along } = PAIR[which];
  const c = Math.cos(angle) * radius;
  const s = Math.sin(angle) * radius;
  return [MEET[0] * c + along[0] * s, MEET[1] * c + along[1] * s, MEET[2] * c + along[2] * s];
}

/** The pair's two whole orbits, as lines of points. */
export const PAIR_PATHS: Vec[][] = ([0, 1] as const).map((which) =>
  Array.from({ length: 121 }, (_, i) => pairPlace(which, (i / 120) * Math.PI * 2)),
);

export const distance = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** How much of something that belongs to `step` is drawn: 0 not yet, 1 fully. */
export function shown(step: number, stage: number, progress: number): number {
  if (stage > step) return 1;
  if (stage === step) return Math.max(0, Math.min(1, progress));
  return 0;
}
