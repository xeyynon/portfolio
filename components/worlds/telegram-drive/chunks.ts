/**
 * The chunk arithmetic. Pure numbers, no React and no DOM.
 *
 * The one fact here is the chunk size, 48 MB, from the project's own
 * description. Everything else is division: how many chunks a file of a
 * given size becomes, assuming the last chunk holds whatever is left over.
 * The page labels the result as a calculation, not a measurement.
 */

export const CHUNK_MB = 48;

/** The range the visitor can choose from. These are the slider's ends, not limits of the app. */
export const MIN_MB = 1;
export const MAX_MB = 2000;
export const START_MB = 700;

export type ChunkPlan = {
  sizeMb: number;
  /** How many chunks, and so how many IVs: each chunk has its own. */
  count: number;
  /** How many of them are a full 48 MB. */
  full: number;
  /** The size of the last chunk: 48 when the file divides evenly. */
  lastMb: number;
};

export function chunkPlan(sizeMb: number): ChunkPlan {
  const size = Math.max(MIN_MB, Math.min(MAX_MB, Math.round(sizeMb) || MIN_MB));
  const count = Math.ceil(size / CHUNK_MB);
  const lastMb = size - (count - 1) * CHUNK_MB;
  return { sizeMb: size, count, full: lastMb === CHUNK_MB ? count : count - 1, lastMb };
}

const chunks = (n: number) => (n === 1 ? "1 chunk" : `${n} chunks`);

/** The headline: a size and what it becomes. */
export const planHeadline = (plan: ChunkPlan) => `${plan.sizeMb} MB → ${chunks(plan.count)}`;

/** The plan in a sentence: the full chunks, then the last one if it is short. */
export function planSentence(plan: ChunkPlan): string {
  if (plan.full === 0) return `One chunk of ${plan.lastMb} MB: the file is smaller than a single ${CHUNK_MB} MB chunk.`;
  const full = `${plan.full} full ${plan.full === 1 ? "chunk" : "chunks"} of ${CHUNK_MB} MB`;
  return plan.full === plan.count ? `${full}.` : `${full} and a last one of ${plan.lastMb} MB.`;
}

/** One IV for every chunk. */
export const ivSentence = (plan: ChunkPlan) =>
  plan.count === 1 ? "1 chunk, so 1 IV." : `${plan.count} chunks, so ${plan.count} IVs: one for each chunk.`;
