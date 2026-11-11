/**
 * The wing, as geometry. Built from the film prop as photographed: a long
 * curved spine, like a sabre, with many fine parallel ribs hanging from it
 * and tapering to a point, so the whole reads as half a feather or a comb.
 * The one change is the owner's: it is glass, not metal (2026-11-11).
 *
 * Pure: numbers in, vertex positions out. No three.js, no DOM. The wing is
 * built for the right side, root at the origin, reaching along +x; the left
 * wing is the same geometry mirrored.
 */

type Vec3 = [number, number, number];

export const RIBS = 64;
const ACROSS = 5; // steps from the spine out to a rib's tip
const RIB_REACH = 1.18; // length of the longest rib, in sphere radii
const RIB_SWEEP = 0.45; // radians the ribs lean toward the tip
const CUP = 0.26; // how far the sail cups away from the viewer across a rib
const CORRUGATION = 0.034; // height of the ribbing: alternate ribs sit proud
const SPINE_SIDES = 5;

/** The spine: out from the root, then curving up, and sweeping back toward its tip. */
function spine(t: number): Vec3 {
  const u = 1 - t;
  return [2 * u * t * 2.1 + t * t * 3.6, 2 * u * t * 0.15 + t * t * 1.45, -0.38 * t * t];
}

function spineTangent(t: number): [number, number] {
  const x = 2 * (1 - t) * 2.1 + 2 * t * (3.6 - 2.1);
  const y = 2 * (1 - t) * 0.15 + 2 * t * (1.45 - 0.15);
  const len = Math.hypot(x, y);
  return [x / len, y / len];
}

/** Rib length along the spine: nothing at the root, widest a third of the way, a point at the tip. */
function ribLength(t: number, index: number): number {
  const profile = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.6)), 0.8);
  // Alternate ribs stop a little short, which gives the trailing edge its comb.
  return RIB_REACH * profile * (index % 2 ? 0.9 : 1);
}

function sailPoint(i: number, j: number): Vec3 {
  const t = i / RIBS;
  const s = j / ACROSS;
  const [sx, sy, sz] = spine(t);
  const [tx, ty] = spineTangent(t);
  // Perpendicular to the spine, on the trailing side, leaning toward the tip.
  const dx = ty * Math.cos(RIB_SWEEP) + tx * Math.sin(RIB_SWEEP);
  const dy = -tx * Math.cos(RIB_SWEEP) + ty * Math.sin(RIB_SWEEP);
  const d = ribLength(t, i) * s;
  const ridge = (i % 2 ? 1 : -1) * CORRUGATION * s;
  return [sx + dx * d, sy + dy * d, sz - CUP * d * d + ridge];
}

/** The ribbed sail as separate triangles, so each facet keeps its own flat normal. */
export function sailPositions(): Float32Array {
  const out: number[] = [];
  for (let i = 0; i < RIBS; i++) {
    for (let j = 0; j < ACROSS; j++) {
      const a = sailPoint(i, j);
      const b = sailPoint(i + 1, j);
      const c = sailPoint(i + 1, j + 1);
      const d = sailPoint(i, j + 1);
      out.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  }
  return new Float32Array(out);
}

/** The spine as a tapering rod of glass. */
export function spinePositions(): Float32Array {
  const ring = (i: number): Vec3[] => {
    const t = i / RIBS;
    const [sx, sy, sz] = spine(t);
    const [tx, ty] = spineTangent(t);
    const radius = 0.05 * (1 - 0.85 * t) + 0.006;
    return Array.from({ length: SPINE_SIDES }, (_, k) => {
      const angle = (k / SPINE_SIDES) * Math.PI * 2;
      // The rod's cross-section lies in the plane across the spine.
      return [sx + ty * Math.cos(angle) * radius, sy - tx * Math.cos(angle) * radius, sz + Math.sin(angle) * radius];
    });
  };
  const out: number[] = [];
  for (let i = 0; i < RIBS; i++) {
    const near = ring(i);
    const far = ring(i + 1);
    for (let k = 0; k < SPINE_SIDES; k++) {
      const n = (k + 1) % SPINE_SIDES;
      out.push(...near[k], ...far[k], ...far[n], ...near[k], ...far[n], ...near[n]);
    }
  }
  return new Float32Array(out);
}
