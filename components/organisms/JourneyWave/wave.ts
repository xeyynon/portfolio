/** Pure geometry for the journey wave. No React, no DOM. */

export const ROW = 76; // px of track per point
export const PAD = 14; // px kept clear at each side of the track

/** Where a point sits across the track: level -1 is the left edge, +1 the right. */
export function xFor(level: number, width: number): number {
  const half = Math.max(0, width / 2 - PAD);
  return width / 2 + Math.max(-1, Math.min(1, level)) * half;
}

export const yFor = (index: number) => index * ROW + ROW / 2;

/** One smooth line down through every point, turning at each one. */
export function wavePath(levels: number[], width: number): string {
  if (!levels.length) return "";
  let d = `M${xFor(levels[0], width).toFixed(1)} ${yFor(0)}`;
  for (let i = 1; i < levels.length; i++) {
    const x0 = xFor(levels[i - 1], width).toFixed(1);
    const x1 = xFor(levels[i], width).toFixed(1);
    const mid = (yFor(i - 1) + yFor(i)) / 2;
    d += ` C${x0} ${mid} ${x1} ${mid} ${x1} ${yFor(i)}`;
  }
  return d;
}
