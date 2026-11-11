/**
 * Pure mapping from scroll progress (0..1) to the sphere's states. No three.js,
 * no DOM, so the choreography can be read and tested in one place. The DOM
 * fades in sphere-lab.module.css use the same break points; change both.
 */

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export type SphereState = {
  /** 0 closed, 1 the six segments fully open. */
  open: number;
  /** 0 dark inside, 1 the core fully lit. */
  glow: number;
  /** 0 camera at rest, 1 camera at the mouth of the sphere. */
  dive: number;
  /** 0 the dark field, 1 the inside has covered the whole screen. */
  reveal: number;
};

export const BREAKS = {
  open: [0.1, 0.52],
  glow: [0.14, 0.48],
  dive: [0.4, 0.86],
  reveal: [0.5, 0.9],
} as const;

export function sphereState(progress: number): SphereState {
  const p = clamp01(progress);
  return {
    open: smoothstep(BREAKS.open[0], BREAKS.open[1], p),
    glow: smoothstep(BREAKS.glow[0], BREAKS.glow[1], p),
    dive: smoothstep(BREAKS.dive[0], BREAKS.dive[1], p),
    reveal: smoothstep(BREAKS.reveal[0], BREAKS.reveal[1], p),
  };
}

/** Scroll progress of a tall element whose sticky child fills the viewport. */
export function stickyProgress(top: number, height: number, viewport: number): number {
  const travel = height - viewport;
  if (travel <= 0) return 0;
  return clamp01(-top / travel);
}
