/**
 * The phone call: what is shown and when. Pure data and timing, no canvas.
 *
 * The call is an example written for this page: the caller's words are made
 * up, and the waveform is a made-up loudness curve, not a recording. The page
 * says so beside it. The five steps and their wording are the project's own.
 */

/** The five steps, in the order a call runs them. */
export const STAGES = [
  {
    key: "caller",
    label: "Caller",
    caption: "A customer calls the shop and says the order out loud, in Telugu, Hindi, English or Hinglish.",
  },
  { key: "text", label: "Speech to text", caption: "Gnani Prisma turns the speech into text." },
  {
    key: "note",
    label: "Order note",
    caption: "The model only says which items and how many. Each item is matched to the shop's stock list.",
  },
  {
    key: "money",
    label: "Code does the money",
    caption: "Code checks stock, rounds, totals and writes every sentence that states an amount.",
  },
  { key: "speech", label: "Speech", caption: "Gnani Timbre speaks the reply, and the agent reads back the total." },
] as const;

export const LAST_STAGE = STAGES.length - 1;
export const STAGE_SECONDS = 2; // a step plays itself in
export const HOLD_SECONDS = 1.3; // then rests before the next, while playing

/** The made-up caller, in Hinglish, phrase by phrase. `item` marks the words the order note picks out. */
const PHRASES: { text: string; item?: string }[] = [
  { text: "Bhaiya," },
  { text: "do kilo chawal,", item: "rice" },
  { text: "ek kilo cheeni", item: "sugar" },
  { text: "aur" },
  { text: "aadha kilo toor dal", item: "dal" },
  { text: "bhej dena." },
];

/** The same sentence in English, for readers who do not speak Hindi. */
export const GLOSS = "Brother, please send two kilos of rice, one kilo of sugar and half a kilo of toor dal.";

export type Word = { text: string; item?: string };

/** The caller's sentence word by word, each knowing which item it belongs to. */
export const WORDS: Word[] = PHRASES.flatMap((phrase) =>
  phrase.text.split(" ").map((text) => ({ text, item: phrase.item })),
);

/** Milliseconds between one word appearing and the next. */
export const WORD_GAP_MS = 110;

/** How many bars fit across the waveform, each `pitch` px apart. */
export function barCount(width: number, pitch: number): number {
  return Math.max(12, Math.floor(width / pitch));
}

/**
 * A speech-like loudness for bar `i` of `n`, 0 to 1: syllables inside words,
 * with quieter gaps between them. `voice` tells the caller (0) from the agent (1).
 */
export function loudness(i: number, n: number, time: number, voice: number): number {
  const x = i / n;
  const syllable = Math.abs(Math.sin(x * 21 + voice * 2.1 + time * 1.7));
  const word = 0.5 + 0.5 * Math.sin(x * 6.3 + voice * 1.3 + time * 0.6);
  const grain = 0.5 + 0.5 * Math.sin(i * 12.9898 + voice * 4 + time * 5.2);
  const ends = Math.min(1, x * 8, (1 - x) * 8);
  return Math.max(0.05, ends * (0.25 + 0.75 * word) * (0.35 + 0.65 * syllable) * (0.6 + 0.4 * grain));
}

/** How one bar is drawn at a step: who is speaking, and whether it is sound or silence. */
export type Bar = { voice: "caller" | "agent" | "quiet"; level: number };

export function barAt(i: number, n: number, stage: number, progress: number, time: number): Bar {
  const x = i / n;
  // The caller speaks: the sound arrives from the left.
  if (stage === 0) return x <= progress ? { voice: "caller", level: loudness(i, n, time, 0) } : { voice: "quiet", level: 0 };
  // Speech to text: the sound is read off from the left and goes quiet behind the reading head.
  if (stage === 1) return x < progress ? { voice: "caller", level: 0 } : { voice: "caller", level: loudness(i, n, time, 0) };
  // The agent speaks.
  if (stage === LAST_STAGE) {
    return x <= progress ? { voice: "agent", level: loudness(i, n, time, 1) } : { voice: "quiet", level: 0 };
  }
  // The note and the money are worked out in silence.
  return { voice: "quiet", level: 0 };
}
