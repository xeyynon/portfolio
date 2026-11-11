/**
 * The knitting floor: which rows there are and how far each has got. Pure data
 * and timing, no canvas.
 *
 * The rows are made up to show the idea: each is an order being knitted toward
 * its ship date at the right edge, and a pace line crosses the floor showing
 * where a row has to be today. The one real thing is the sum: the row that
 * slows keeps knitting at 350 for every 467 the line moves, the project's own
 * example. The page says so beside the picture.
 */
import { EXAMPLE, type Status } from "./ontime";

export type Row = {
  key: string;
  /** Its speed against the pace line. null: no counts ever come in. */
  pace: number | null;
  /** Where on the way (0 to 1) it drops to the example's rate. */
  slowsAt?: number;
};

export const LATE_ROW = "late";

export const ROWS: Row[] = [
  { key: "first", pace: 1.07 },
  { key: "second", pace: 1.03 },
  { key: LATE_ROW, pace: 1.03, slowsAt: 0.18 },
  { key: "fourth", pace: 1.1 },
  { key: "silent", pace: null },
];

export const RUN_SECONDS = 10; // the pace line crosses the floor once
/** How far behind the line a row is before it is called behind. */
const BEHIND_GAP = 0.04;
const SLOW_PACE = EXAMPLE.made / EXAMPLE.need;

/** How much of a row is knitted when the pace line is at `t` (both 0 to 1). */
export function rowProgress(row: Row, t: number): number {
  if (row.pace === null) return 0;
  const at = Math.max(0, Math.min(1, t));
  const turn = row.slowsAt ?? 1;
  const made = at <= turn ? row.pace * at : row.pace * turn + (at - turn) * SLOW_PACE;
  return Math.max(0, Math.min(1, made));
}

export function rowStatus(row: Row, t: number): Status {
  if (row.pace === null) return "no-updates";
  return rowProgress(row, t) < Math.min(1, t) - BEHIND_GAP ? "behind" : "on-time";
}

/** How many stitches fit across a strip, each about `stitch` wide. */
export function columns(width: number, stitch: number): number {
  return Math.max(8, Math.round(width / stitch));
}

/** Whole stitches knitted, and how much of the next one. */
export function knitted(progress: number, cols: number): { whole: number; part: number } {
  const exact = Math.max(0, Math.min(1, progress)) * cols;
  const whole = Math.floor(exact);
  return { whole, part: exact - whole };
}
