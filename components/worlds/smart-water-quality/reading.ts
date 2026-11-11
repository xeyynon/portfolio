/**
 * The path of one reading, and the made-up samples that illustrate the
 * averaging. Pure data, no React and no DOM.
 *
 * The three stages and what each does are from the project's own
 * description. The samples are not: they are example values from a seeded
 * random number generator, drawn with no scale, to show ten samples becoming
 * one reading. The page says so beside them.
 */

/** From the project: every reading is the average of 10 samples. */
export const SAMPLES = 10;

/** Sensor to radio, in the order of the project's own pipeline. */
export const PATH = [
  { key: "sensors", name: "Sensors", does: "pH, TDS and temperature are read." },
  { key: "esp32", name: "ESP32", does: "Ten samples are averaged into one reading." },
  { key: "lora", name: "LoRa radio", does: "The readings are sent at 433 MHz, every 3 s." },
] as const;

/** A small seeded generator (mulberry32), so a set of samples is the same on the server and in the browser. */
function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SampleSet = {
  /** Ten example values, each between 0 (the bottom of the plot) and 1 (the top). */
  samples: number[];
  /** Their average. */
  mean: number;
};

/** Example set number `set`: ten values scattered round a level, and their average. */
export function sampleSet(set: number): SampleSet {
  const next = random(set * 7919 + 13);
  const level = 0.35 + 0.3 * next();
  const samples = Array.from({ length: SAMPLES }, () =>
    Math.max(0.04, Math.min(0.96, level + (next() - 0.5) * 0.5)),
  );
  return { samples, mean: samples.reduce((sum, v) => sum + v, 0) / SAMPLES };
}

/** The plot's own units: its size, and where the samples sit in it. */
export const PLOT = { width: 400, height: 150, left: 40, step: 35.5, top: 16, bottom: 134 };

export const plotX = (i: number) => PLOT.left + i * PLOT.step;
export const plotY = (value: number) => PLOT.bottom - value * (PLOT.bottom - PLOT.top);
