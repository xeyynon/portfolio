/**
 * The Li-Fi bench: what is on the beam and when. Pure data and timing, no canvas.
 *
 * This is a drawing of on-off keying, slowed down until single bits can be
 * seen. The speeds below are chosen for the eye, not measured from the link,
 * and the page says so beside the figure.
 */

import { textToBits } from "./bits";

/** The link in four steps. The wording is from the project's own description. */
export const STAGES = [
  { key: "laser", label: "Laser", caption: "A laser transmitter on an Arduino Mega switches the beam on and off: on-off keying." },
  { key: "pulse", label: "Light pulse", caption: "The data crosses the gap as pulses of laser light. The real link was 50 m long." },
  { key: "receiver", label: "Solar receiver", caption: "A solar panel catches the pulses, and an LM358 amplifier brings the signal up." },
  {
    key: "decode",
    label: "Decode",
    caption: "Firmware on the receiving side turns the pulses back into what was sent: text, or an 8×8 grayscale image.",
  },
] as const;

/** The word the drawn beam carries, on repeat. */
export const WORD = "Li-Fi";

export const BIT_SECONDS = 0.5; // one bit on the beam: at most one on-off a second, far from a flicker
export const FLIGHT_SECONDS = 3; // for a mark to cross the picture (a whole number of bits)
export const TRACE_SECONDS = 7; // how much of the past the two traces show

/** A moment with every part of the picture full: what reduced motion shows. */
export const STILL_TIME = 12.25;

const IDLE_BITS = 6; // dark between one sending of the word and the next
const STREAM: number[] = [...textToBits(WORD), ...Array.from({ length: IDLE_BITS }, () => 0)];

/** The bit in this slot of the stream. Before the start the laser is off. */
export function bitAt(index: number): number {
  return index < 0 ? 0 : STREAM[index % STREAM.length];
}

/** What the transmitter is keying at this moment: 1 laser on, 0 laser off. */
export function sentLevel(seconds: number): number {
  return bitAt(Math.floor(seconds / BIT_SECONDS));
}

/**
 * The lit stretches of the beam at this moment, each as [from, to] in
 * fractions of its length: 0 at the laser, 1 at the panel. A 1 bit is a
 * stretch of light under way, a 0 bit is the gap behind it.
 */
export function litStretches(time: number): [number, number][] {
  const out: [number, number][] = [];
  const newest = Math.floor(time / BIT_SECONDS);
  const oldest = Math.floor((time - FLIGHT_SECONDS) / BIT_SECONDS);
  for (let k = newest; k >= oldest; k--) {
    if (!bitAt(k)) continue;
    const from = Math.max(0, (time - (k + 1) * BIT_SECONDS) / FLIGHT_SECONDS);
    const to = Math.min(1, (time - k * BIT_SECONDS) / FLIGHT_SECONDS);
    if (to <= from) continue;
    const before = out[out.length - 1];
    // Two 1 bits in a row are one unbroken stretch of light.
    if (before && Math.abs(before[1] - from) < 1e-9) before[1] = to;
    else out.push([from, to]);
  }
  return out;
}

const EDGE_SECONDS = 0.16; // the receiver does not answer at once: edges arrive as slopes
const FLOOR_LEVEL = 0.1;
const SWING = 0.78;

/**
 * What the receiver hands on at this moment, 0 to 1: the sent bits, later by
 * the flight time, with sloped edges and a little ripple. Made up to look like
 * an amplified signal; it is not a measurement.
 */
export function receivedLevel(seconds: number): number {
  const t = seconds - FLIGHT_SECONDS;
  const k = Math.floor(t / BIT_SECONDS);
  const into = t - k * BIT_SECONDS;
  const now = bitAt(k);
  const was = bitAt(k - 1);
  const f = Math.min(1, into / EDGE_SECONDS);
  const level = was + (now - was) * f * f * (3 - 2 * f);
  const ripple = 0.03 * Math.sin(seconds * 23) + 0.02 * Math.sin(seconds * 41 + 1);
  return FLOOR_LEVEL + SWING * level + ripple;
}

/** The level the decoder compares against: above is a 1, below is a 0. */
export const DECISION_LEVEL = FLOOR_LEVEL + SWING / 2;

/** When the decoder reads bit `index`: the middle of the bit, as it arrives. */
export function decisionTime(index: number): number {
  return FLIGHT_SECONDS + (index + 0.5) * BIT_SECONDS;
}

/** The bit the decoder reads then, from the received level alone. */
export function decidedBit(index: number): number {
  return receivedLevel(decisionTime(index)) > DECISION_LEVEL ? 1 : 0;
}
