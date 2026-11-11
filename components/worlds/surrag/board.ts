/**
 * The SURRAG board: what is drawn and when. Pure geometry and timing, no canvas.
 *
 * This is a schematic, not the demo's data: the reports, the people in them
 * and the links between them are made up to show the steps in order. The
 * demo itself runs on synthetic reports. The page says both beside it.
 * Coordinates are fractions of the board, x to the right and y down; sizes
 * are fractions of the board's shorter side.
 */

export type Point = [number, number];

/** The five steps, in the order of the project's own pipeline. The wording is from its description. */
export const STAGES = [
  {
    key: "fir",
    label: "Reports",
    seconds: 1.8,
    caption: "It starts from police first information reports (FIRs), each a case on its own.",
  },
  {
    key: "extract",
    label: "Entity extraction",
    seconds: 1.6,
    caption: "An LLM pulls the entities out of each report, with spaCy and regex as fallbacks.",
  },
  {
    key: "resolve",
    label: "Person resolution",
    seconds: 1.6,
    caption: "Fuzzy person resolution decides when a name in one report is the same person as a name in another.",
  },
  {
    key: "graph",
    label: "Case graph",
    seconds: 1.8,
    caption: "The cases and the people in them become one case graph, searchable by meaning as well.",
  },
  {
    key: "leads",
    label: "Leads",
    seconds: 1.6,
    caption: "A lead is a connection across cases, with a citation behind it: the reports it comes from.",
  },
] as const;

export const LAST_STAGE = STAGES.length - 1;
export const HOLD_SECONDS = 1.5; // a finished step rests this long before the next, while playing

/** The size of a report card, as fractions of the board's shorter side. */
export const CARD = { w: 0.34, h: 0.23 } as const;

/** The report cards pinned to the board: where each sits and how it is turned (radians). */
export const CARDS: { at: Point; angle: number }[] = [
  { at: [0.15, 0.27], angle: -0.06 },
  { at: [0.45, 0.22], angle: 0.05 },
  { at: [0.8, 0.28], angle: -0.04 },
  { at: [0.26, 0.74], angle: 0.04 },
  { at: [0.66, 0.73], angle: -0.05 },
];

/**
 * The people named in the reports: which card, where on it (fractions of the
 * card, from its centre), and who they turn out to be once resolved. Person
 * 4 is named only once, so nothing links through them.
 */
export const MENTIONS: { card: number; at: Point; person: number }[] = [
  { card: 0, at: [-0.22, 0.05], person: 0 },
  { card: 0, at: [0.26, 0.28], person: 1 },
  { card: 1, at: [0.12, 0.08], person: 0 },
  { card: 1, at: [-0.26, 0.3], person: 2 },
  { card: 2, at: [0.2, 0.02], person: 2 },
  { card: 2, at: [-0.24, 0.3], person: 4 },
  { card: 3, at: [0.02, 0.12], person: 1 },
  { card: 3, at: [0.3, 0.3], person: 3 },
  { card: 4, at: [-0.2, 0.1], person: 3 },
  { card: 4, at: [0.26, 0.28], person: 2 },
];

/** The people that link two or more reports. */
export const LINKED = [0, 1, 2, 3];

/** The lead the picture ends on: reports 1, 2 and 5, through persons 0 and 2. */
export const LEAD = { cards: [0, 1, 4], people: [0, 2] } as const;

/** Where a mention sits on the board, given the board's size in pixels. */
export function mentionAt(index: number, width: number, height: number): Point {
  const m = MENTIONS[index];
  const card = CARDS[m.card];
  const unit = Math.min(width, height);
  const dx = m.at[0] * CARD.w * unit;
  const dy = m.at[1] * CARD.h * unit;
  const c = Math.cos(card.angle);
  const s = Math.sin(card.angle);
  return [card.at[0] * width + dx * c - dy * s, card.at[1] * height + dx * s + dy * c];
}

/** Where a person's node sits once the graph is drawn: the middle of everywhere they are named. */
export function personAt(person: number, width: number, height: number): Point {
  let x = 0;
  let y = 0;
  let n = 0;
  MENTIONS.forEach((m, i) => {
    if (m.person !== person) return;
    const [mx, my] = mentionAt(i, width, height);
    x += mx;
    y += my;
    n++;
  });
  return n ? [x / n, y / n] : [width / 2, height / 2];
}

/** How much of something that belongs to `step` is drawn: 0 not yet, 1 fully. */
export function shown(step: number, stage: number, progress: number): number {
  if (stage > step) return 1;
  if (stage === step) return Math.max(0, Math.min(1, progress));
  return 0;
}

/** The share of a step's drawing that belongs to item `k` of `count`, so items arrive one after another. */
export const staggered = (share: number, k: number, count: number) =>
  Math.max(0, Math.min(1, share * count - k * 0.8));
