/**
 * Geometry for the pruned branch on the not-found page. Pure and seeded, so
 * the server and the browser draw the same embers.
 *
 * The branch leaves the main line at SPLIT and ends at TIP, as two cubic
 * curves; the path string and the sample points come from the same numbers.
 */

type P = { x: number; y: number };

const A0: P = { x: 240, y: 110 };
const A1: P = { x: 290, y: 150 };
const A2: P = { x: 330, y: 180 };
const A3: P = { x: 380, y: 176 };
const B1: P = { x: 2 * A3.x - A2.x, y: 2 * A3.y - A2.y }; // the smooth join
const B2: P = { x: 450, y: 150 };
const B3: P = { x: 470, y: 170 };

export const SPLIT = A0;
export const TIP = B3;
export const BRANCH_PATH = `M${A0.x} ${A0.y} C${A1.x} ${A1.y} ${A2.x} ${A2.y} ${A3.x} ${A3.y} C${B1.x} ${B1.y} ${B2.x} ${B2.y} ${B3.x} ${B3.y}`;

function cubic(p0: P, p1: P, p2: P, p3: P, t: number): P {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/** A point along the whole branch: 0 at the split, 1 at the tip. */
function along(f: number): P {
  return f < 0.5 ? cubic(A0, A1, A2, A3, f * 2) : cubic(A3, B1, B2, B3, (f - 0.5) * 2);
}

/** A small fixed sequence of numbers in 0..1, the same on every render. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export type Ember = { x: number; y: number; r: number; f: number; dx: number; dy: number };

/** The embers the branch sheds as it burns back: `f` is how far along the branch each starts. */
export const EMBERS: Ember[] = (() => {
  const rand = seeded(7);
  return Array.from({ length: 46 }, (_, i) => {
    const f = (i + rand() * 0.8) / 46;
    const p = along(f);
    const r2 = (n: number) => Math.round(n * 10) / 10;
    return {
      x: r2(p.x + (rand() - 0.5) * 4),
      y: r2(p.y + (rand() - 0.5) * 4),
      r: r2(0.8 + rand() * 1.6),
      f: Math.round(f * 1000) / 1000,
      dx: r2(6 + rand() * 22),
      dy: r2(-(14 + rand() * 34)),
    };
  });
})();
