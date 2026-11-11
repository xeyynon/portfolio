/**
 * The kindofui mosaic: how many tiles, where each sits and what it is doing.
 * Pure data, geometry and timing, no canvas.
 *
 * The tiles are drawn for this page. There is one for each of the library's
 * 134 live examples, but a tile is a stand-in, not a copy of a demo, and which
 * tile shows which little control is made up. The page says so beside it.
 */

/** One tile for each live example on the library's page. */
export const TILE_COUNT = 134;

/** What the library holds, as the project lists it. */
export const COUNTS = [
  { count: 38, label: "visual styles" },
  { count: 18, label: "layouts" },
  { count: 18, label: "navigation patterns" },
  { count: 25, label: "components and UX patterns" },
  { count: 5, label: "AI patterns" },
  { count: 10, label: "UX laws" },
] as const;

/** The little controls a tile can show. */
export const KINDS = ["button", "toggle", "slider", "tabs", "field", "card"] as const;
export type Kind = (typeof KINDS)[number];

/** A steady 0 to 1 number for a tile, different for each. */
function seed(i: number): number {
  const s = Math.sin(i * 127.1 + 11.7) * 43758.5453;
  return s - Math.floor(s);
}

export function kindOf(i: number): Kind {
  return KINDS[Math.floor(seed(i + 300) * KINDS.length) % KINDS.length];
}

export type Grid = { cols: number; rows: number; size: number; left: number; top: number };

/** The largest square tile that lets `count` tiles fit in the box, and the grid that makes. */
export function fit(width: number, height: number, count: number): Grid {
  let size = Math.max(4, Math.floor(Math.sqrt((width * height) / count)));
  while (size > 4 && Math.floor(width / size) * Math.floor(height / size) < count) size--;
  const cols = Math.max(1, Math.floor(width / size));
  const rows = Math.ceil(count / cols);
  return { cols, rows, size, left: (width - cols * size) / 2, top: (height - rows * size) / 2 };
}

/** The top left corner of tile `i`. */
export function corner(grid: Grid, i: number): [number, number] {
  return [grid.left + (i % grid.cols) * grid.size, grid.top + Math.floor(i / grid.cols) * grid.size];
}

/** Which tile is under a point, or -1. */
export function tileAt(grid: Grid, x: number, y: number, count: number): number {
  const col = Math.floor((x - grid.left) / grid.size);
  const row = Math.floor((y - grid.top) / grid.size);
  if (col < 0 || col >= grid.cols || row < 0) return -1;
  const i = row * grid.cols + col;
  return i < count ? i : -1;
}

const smooth = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

/**
 * How far a tile's control is switched, 0 to 1. Each tile flips back and
 * forth in its own time and rests at one end or the other in between.
 * At time 0 it is a still picture: some on, some off.
 */
export function level(i: number, time: number): number {
  const s = seed(i);
  const period = 3.5 + s * 6;
  const wave = Math.sin((time / period + s * 7) * Math.PI * 2);
  return smooth((wave + 0.3) / 0.6);
}

export const INTRO_SECONDS = 2.4; // the tiles arrive one after another

/** How much of tile `i` has arrived when the intro is `intro` of the way through (0 to 1). */
export function arrived(i: number, intro: number, count: number): number {
  const tail = 14; // tiles arriving at once
  return smooth((intro * (count + tail) - i) / tail);
}
