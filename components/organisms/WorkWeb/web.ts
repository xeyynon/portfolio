/**
 * Layout of the web that joins every project to the areas of work it uses.
 * Pure geometry: names in, positions out. The areas sit on an inner ring, the
 * projects on an outer one, and a thread runs from each project to each of
 * its areas.
 */

import { STONE_SPOTS } from "./hand";

export const WIDTH = 760;
export const HEIGHT = 560;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const PROJECT_RING_X = 238; // an ellipse, wider than tall, to leave room for names at the sides
const PROJECT_RING_Y = 205;

export type Spot = { x: number; y: number };

export type Socket = Spot & { r: number };

/** Where area `i` sits: its stone on the gauntlet (gauntlet.ts). */
export const areaSpot = (i: number): Socket => STONE_SPOTS[i % STONE_SPOTS.length];

export type ProjectSpot = Spot & {
  /** Where the name goes, and which way it reads from the node. */
  labelX: number;
  labelY: number;
  anchor: "start" | "end" | "middle";
};

/** Where project `i` of `count` sits, and where its name goes: always on the outside. */
export function projectSpot(i: number, count: number): ProjectSpot {
  const a = -Math.PI / 2 + ((i + 0.5) / count) * Math.PI * 2;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const x = CX + cos * PROJECT_RING_X;
  const y = CY + sin * PROJECT_RING_Y;
  const side = Math.abs(cos) < 0.22 ? "middle" : cos > 0 ? "start" : "end";
  return {
    x,
    y,
    labelX: x + (side === "middle" ? 0 : cos > 0 ? 12 : -12),
    labelY: y + (side === "middle" ? (sin > 0 ? 22 : -14) : 4),
    anchor: side,
  };
}

/** A thread from a project to an area, bowed a little toward the centre so threads do not lie on each other. */
export function thread(from: Spot, to: Spot): string {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const pull = 0.16;
  const qx = mx + (CX - mx) * pull;
  const qy = my + (CY - my) * pull;
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}
