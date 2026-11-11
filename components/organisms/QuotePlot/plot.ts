/**
 * Pure maths and geometry for the sine and tangent plot. No React, no DOM.
 * The plot's x axis is the angle in radians; the readings are in degrees.
 */

export const X_MIN = -1.55;
export const X_MAX = 1.62; // a little past pi/2, so the asymptote is in view
export const Y_MIN = -1.6;
export const Y_MAX = 7.2; // tangent leaves the frame above this

export const WIDTH = 640;
export const HEIGHT = 380;

/** The largest angle the control reaches. Tangent is undefined at exactly 90. */
export const MAX_DEGREES = 89.99;

export const PRESETS = [0, 30, 45, 60, 80, 89, 89.9, 89.99] as const;

export const toX = (x: number) => ((x - X_MIN) / (X_MAX - X_MIN)) * WIDTH;
export const toY = (y: number) => HEIGHT - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * HEIGHT;

export const radians = (degrees: number) => (degrees * Math.PI) / 180;

function path(fn: (x: number) => number, from: number, to: number, steps: number): string {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const x = from + ((to - from) * i) / steps;
    d += `${i === 0 ? "M" : "L"}${toX(x).toFixed(1)} ${toY(fn(x)).toFixed(1)}`;
  }
  return d;
}

export const sinePath = () => path(Math.sin, X_MIN, X_MAX, 120);

/** Tangent on the branch between its two asymptotes, stopped where it leaves the frame. */
export function tangentPath(): string {
  const top = Math.atan(Y_MAX + 0.6);
  const bottom = Math.max(X_MIN, Math.atan(Y_MIN - 0.6));
  return path(Math.tan, bottom, top, 160);
}

export type Reading = { sin: number; cos: number; tan: number; inFrame: boolean };

export function reading(degrees: number): Reading {
  const t = radians(degrees);
  const tan = Math.tan(t);
  return { sin: Math.sin(t), cos: Math.cos(t), tan, inFrame: tan <= Y_MAX };
}

/** Four decimals, with thousands separated, as in the owner's table of values. */
export function formatValue(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export function formatDegrees(d: number): string {
  return `${Number(d.toFixed(2))}°`;
}
