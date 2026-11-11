/**
 * The Telegram Drive scene: what is drawn and when. Pure data and timing, no
 * canvas.
 *
 * This is a schematic of the method, not a real upload: the file and the
 * number of chunks it is cut into are made up to show the five steps in
 * order. The page says so beside it. Coordinates are fractions of the scene,
 * x to the right and y down; the device is the left half, Telegram the right.
 */

export type Point = [number, number];

/** The five steps, in the order of the project's own pipeline. The wording is from the project's description. */
export const STAGES = [
  { key: "split", label: "Split", caption: "The file is cut into chunks of 48 MB." },
  {
    key: "encrypt",
    label: "Encrypt",
    caption: "Each chunk is encrypted on the device with AES-256-CTR, and each gets its own IV.",
  },
  {
    key: "send",
    label: "Send",
    caption: "The encrypted chunks leave for Telegram, which the app uses as its cloud storage.",
  },
  {
    key: "index",
    label: "Index",
    caption: "An encrypted index of the files is stored in a pinned Telegram message.",
  },
  {
    key: "stream",
    label: "Stream back",
    caption: "For playback the chunks are streamed back and decrypted on the fly.",
  },
] as const;

export const LAST_STAGE = STAGES.length - 1;
export const STAGE_SECONDS = 2.2; // a step draws itself in
export const HOLD_SECONDS = 1.4; // then rests before the next, while playing

/** How many chunks the made-up file is cut into. Six, so the picture stays readable on a phone. */
export const CHUNKS = 6;

/** One chunk, drawn as a slab: its size, and the gap that opens between slabs when the file is cut. */
export const SLAB = { width: 0.26, height: 0.088, gap: 0.022, top: 0.25 };
/** The left edge of the column of slabs on each side. */
export const DEVICE_X = 0.12;
export const CLOUD_X = 0.62;
/** The pinned message that holds the index, above the chunks in Telegram. */
export const INDEX = { x: CLOUD_X, y: 0.07, width: SLAB.width, height: 0.11 };

const clamp = (t: number) => Math.max(0, Math.min(1, t));

/** Slow at both ends. */
export const ease = (t: number) => {
  const c = clamp(t);
  return c * c * (3 - 2 * c);
};

/** How much of something that belongs to `step` is drawn: 0 not yet, 1 fully. */
export function shown(step: number, stage: number, progress: number): number {
  if (stage > step) return 1;
  if (stage === step) return clamp(progress);
  return 0;
}

/**
 * The same step, taken by each chunk in turn: chunk `k` starts a little after
 * the one before and takes `share` of the whole step to finish.
 */
export function turn(progress: number, k: number, share = 0.4): number {
  const start = (k / (CHUNKS - 1)) * (1 - share);
  return clamp((progress - start) / share);
}

/** The top edge of slab `k`. `spread` 0 is the file still whole, 1 is the chunks standing apart. */
export function slabTop(k: number, spread: number): number {
  const closed = ((CHUNKS - 1) * SLAB.gap) / 2;
  return SLAB.top + closed * (1 - spread) + k * (SLAB.height + SLAB.gap * spread);
}

/** A chunk on its way between the two sides: eased, and lifted a little in the middle. */
export function flight(fromX: number, toX: number, y: number, t: number): Point {
  const e = ease(t);
  return [fromX + (toX - fromX) * e, y - Math.sin(e * Math.PI) * 0.035];
}

/** The marks that stand for a chunk's IV: three squares, on or off, different for every chunk. */
export function ivMarks(k: number): boolean[] {
  const n = k + 1;
  return [Boolean(n & 4), Boolean(n & 2), Boolean(n & 1)];
}
