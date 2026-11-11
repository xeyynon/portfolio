/**
 * The EcoX floor: what rises and when the alarm sounds. Pure data and timing, no canvas.
 *
 * This is a drawing of the idea, not a reading: the project does not state an
 * alarm level, so the line below has no number on it, and the gas level, its
 * timing and the rings are made up. The page says so beside the figure.
 */

export const CYCLE_SECONDS = 16; // one rise, alarm and clearing, then it repeats
const RISE_END = 8;
const HOLD_END = 12;

const LOW = 0.18; // the gas level at the start and end of a cycle, as a share of the room's height
const HIGH = 0.82;

/** The alarm level, as a share of the room's height above the floor. Illustrative: no figure is given. */
export const THRESHOLD = 0.6;

const ease = (v: number) => v * v * (3 - 2 * v);

/** How high the gas has reached at this moment: 0 the floor, 1 the roof. */
export function gasLevel(time: number): number {
  const t = ((time % CYCLE_SECONDS) + CYCLE_SECONDS) % CYCLE_SECONDS;
  if (t < RISE_END) return LOW + (HIGH - LOW) * ease(t / RISE_END);
  if (t < HOLD_END) return HIGH;
  return HIGH - (HIGH - LOW) * ease((t - HOLD_END) / (CYCLE_SECONDS - HOLD_END));
}

/** Whether the gas is over the line, so the alarm is sounding. */
export const alarmOn = (time: number) => gasLevel(time) > THRESHOLD;

/** A moment with the gas over the line and the alarm well under way: what reduced motion shows. */
export const STILL_TIME = 10.5;

export const RING_EVERY = 1.1; // seconds between rings: a slow pulse, well under three a second
export const RING_SECONDS = 2.2; // for one ring to spread and fade

/**
 * The rings spreading from the speaker at this moment, each as how far it
 * has grown, 0 to 1. A ring is only started while the alarm is on; one
 * already started finishes spreading.
 */
export function rings(time: number): number[] {
  const out: number[] = [];
  const newest = Math.floor(time / RING_EVERY);
  for (let k = newest; k * RING_EVERY > time - RING_SECONDS; k--) {
    const born = k * RING_EVERY;
    if (born < 0 || !alarmOn(born)) continue;
    out.push((time - born) / RING_SECONDS);
  }
  return out;
}

/** One rising mote of gas: where across it starts, how fast it climbs, where in its climb it begins. */
export type Mote = { x: number; speed: number; phase: number; sway: number; size: number };

const seeded = (n: number) => {
  const s = Math.sin(n * 91.345 + 7.13) * 47453.5453;
  return s - Math.floor(s);
};

/** The motes leave from the machines on the left two thirds of the floor. */
export const MOTES: Mote[] = Array.from({ length: 90 }, (_, i) => ({
  x: 0.08 + 0.58 * seeded(i),
  speed: 0.12 + 0.12 * seeded(i + 100),
  phase: seeded(i + 200),
  sway: 0.01 + 0.025 * seeded(i + 300),
  size: 1.2 + 1.8 * seeded(i + 400),
}));

/**
 * Where a mote is at this moment, as fractions of the room: x across, and
 * height above the floor. It climbs as far as the gas has reached, then
 * starts again from the floor. `fade` is how strongly it is drawn.
 */
export function motePlace(mote: Mote, time: number): { x: number; height: number; fade: number } {
  const climb = (time * mote.speed + mote.phase) % 1;
  const level = gasLevel(time);
  const height = climb * level;
  const x = mote.x + mote.sway * Math.sin(time * 0.9 + mote.phase * 12) * (0.4 + climb);
  const fade = Math.min(1, climb * 6) * (1 - climb * climb);
  return { x, height, fade };
}
