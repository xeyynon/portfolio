/**
 * The KD-tree picture: a real, small KD-tree over made-up dots on a flat
 * field. Pure data, no DOM.
 *
 * It shows the idea behind ORCA's candidate search, not its data: the dots,
 * the field and the radius here are invented for the picture. The page says
 * so beside it. Coordinates are in the units of the SVG's viewBox.
 */

/** The three views of the picture. ORCA's own figures (100 km, refinement) are from the project's description. */
export const STEPS = [
  { key: "catalog", label: "Catalog", text: "Every dot stands for an object in the catalog." },
  { key: "tree", label: "Tree", text: "A KD-tree cuts the space into boxes with a few objects in each." },
  {
    key: "search",
    label: "Search",
    text: "For one object, only the boxes its search radius touches are opened. In ORCA that radius is 100 km, and what it finds goes on to refinement.",
  },
] as const;

export const SEARCH_STEP = STEPS.length - 1;

export const FIELD = { width: 320, height: 200 } as const;
export const RADIUS = 30; // the search radius in the picture
const LEAF = 4; // a box is not cut again once it holds this few dots

export type Dot = { x: number; y: number };
export type Box = { x0: number; y0: number; x1: number; y1: number };
export type Cut = { x1: number; y1: number; x2: number; y2: number };
export type Leaf = { box: Box; dots: number[] };

/** A small seeded generator, so the field is the same on every visit. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const DOTS: Dot[] = (() => {
  const random = seeded(100);
  return Array.from({ length: 64 }, () => ({
    x: 8 + random() * (FIELD.width - 16),
    y: 8 + random() * (FIELD.height - 16),
  }));
})();

/** Cuts a box in two at the middle dot, across x then y in turn, until each box holds only a few. */
function cut(ids: number[], box: Box, depth: number, leaves: Leaf[], cuts: Cut[]): void {
  if (ids.length <= LEAF) {
    leaves.push({ box, dots: ids });
    return;
  }
  const axis = depth % 2 === 0 ? "x" : "y";
  const sorted = [...ids].sort((a, b) => DOTS[a][axis] - DOTS[b][axis]);
  const middle = sorted.length >> 1;
  const at = (DOTS[sorted[middle - 1]][axis] + DOTS[sorted[middle]][axis]) / 2;
  if (axis === "x") {
    cuts.push({ x1: at, y1: box.y0, x2: at, y2: box.y1 });
    cut(sorted.slice(0, middle), { ...box, x1: at }, depth + 1, leaves, cuts);
    cut(sorted.slice(middle), { ...box, x0: at }, depth + 1, leaves, cuts);
  } else {
    cuts.push({ x1: box.x0, y1: at, x2: box.x1, y2: at });
    cut(sorted.slice(0, middle), { ...box, y1: at }, depth + 1, leaves, cuts);
    cut(sorted.slice(middle), { ...box, y0: at }, depth + 1, leaves, cuts);
  }
}

export const TREE: { leaves: Leaf[]; cuts: Cut[] } = (() => {
  const leaves: Leaf[] = [];
  const cuts: Cut[] = [];
  cut(
    DOTS.map((_, i) => i),
    { x0: 0, y0: 0, x1: FIELD.width, y1: FIELD.height },
    0,
    leaves,
    cuts,
  );
  return { leaves, cuts };
})();

export type Search = {
  /** The boxes the radius touches: only these are opened. */
  opened: number[];
  /** How many other dots sit in the opened boxes, and so are measured. */
  checked: number;
  /** The dots inside the radius: the candidates. */
  inside: number[];
};

/** The search round one dot: which boxes its radius touches, and which dots it finds in them. */
export function search(dot: number): Search {
  const { x, y } = DOTS[dot];
  const opened: number[] = [];
  const inside: number[] = [];
  let checked = 0;
  TREE.leaves.forEach((leaf, i) => {
    const nearestX = Math.max(leaf.box.x0, Math.min(x, leaf.box.x1));
    const nearestY = Math.max(leaf.box.y0, Math.min(y, leaf.box.y1));
    if (Math.hypot(x - nearestX, y - nearestY) > RADIUS) return;
    opened.push(i);
    for (const other of leaf.dots) {
      if (other === dot) continue;
      checked++;
      if (Math.hypot(x - DOTS[other].x, y - DOTS[other].y) <= RADIUS) inside.push(other);
    }
  });
  return { opened, checked, inside };
}

/** The dots the picture steps through: a handful that have neighbours inside the radius, spread over the field. */
export const QUERIES: number[] = (() => {
  const busy = DOTS.map((_, i) => i).filter((i) => search(i).inside.length >= 2);
  const pool = busy.length ? busy : DOTS.map((_, i) => i);
  const step = Math.max(1, Math.floor(pool.length / 5));
  return pool.filter((_, k) => k % step === 0).slice(0, 5);
})();
