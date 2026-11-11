/**
 * Geometry of the gauntlet at the centre of the web. Pure: numbers in, SVG
 * path strings and points out. Drawn on the web's 760 by 560 grid, then
 * scaled and lifted as a whole (`HAND_TRANSFORM`) so it clears the project
 * names round it; `place` applies the same move to a point, so the stones
 * (drawn outside that group) land exactly in their bezels.
 */

export type Pt = { x: number; y: number };

const CX = 380;
const CY = 280;
const SCALE = 0.92;
const LIFT = -12;

export const HAND_TRANSFORM = `translate(${CX} ${CY + LIFT}) scale(${SCALE}) translate(${-CX} ${-CY})`;
export const place = (p: Pt): Pt => ({ x: CX + (p.x - CX) * SCALE, y: CY + (p.y - CY) * SCALE + LIFT });

/** Turns `p` about `c` by `deg`, clockwise on screen, as SVG's rotate() does. */
export function rotateAbout(p: Pt, c: Pt, deg: number): Pt {
  const t = (deg * Math.PI) / 180;
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(t) - dy * Math.sin(t), y: c.y + dx * Math.sin(t) + dy * Math.cos(t) };
}

export type Digit = {
  key: "thumb" | "index" | "middle" | "ring" | "little";
  /** Centre line and the knuckle it rises from, drawn upright before `angle` turns it. */
  cx: number;
  base: number;
  len: number;
  /** Width at the knuckle and at the tip. */
  wb: number;
  wt: number;
  angle: number;
  /** Where each plate starts and ends, as fractions of the length from the knuckle. */
  plates: [from: number, to: number][];
};

const FINGER_PLATES: [number, number][] = [
  [-0.03, 0.44],
  [0.38, 0.72],
  [0.66, 1],
];

export const FINGERS: Digit[] = [
  { key: "index", cx: 330, base: 262, len: 128, wb: 34, wt: 29, angle: -5, plates: FINGER_PLATES },
  { key: "middle", cx: 366, base: 256, len: 146, wb: 35, wt: 30, angle: -1, plates: FINGER_PLATES },
  { key: "ring", cx: 401, base: 259, len: 136, wb: 34, wt: 29, angle: 3, plates: FINGER_PLATES },
  { key: "little", cx: 433, base: 270, len: 104, wb: 29, wt: 25, angle: 9, plates: FINGER_PLATES },
];

export const THUMB: Digit = {
  key: "thumb",
  cx: 318,
  base: 352,
  len: 116,
  wb: 38,
  wt: 30,
  angle: -48,
  plates: [
    [-0.03, 0.56],
    [0.5, 1],
  ],
};

/**
 * One armour plate: straight sides that narrow toward the tip, an arched top,
 * and a bottom edge that bows down over the plate beneath it.
 */
function plate(cx: number, yb: number, yt: number, wb: number, wt: number): string {
  const l0 = cx - wb / 2;
  const r0 = cx + wb / 2;
  const l1 = cx - wt / 2;
  const r1 = cx + wt / 2;
  const shoulder = yt + wt * 0.5;
  const crown = yt - wt * 0.1;
  return `M${l0} ${yb} L${l1} ${shoulder} C${l1} ${crown} ${r1} ${crown} ${r1} ${shoulder} L${r0} ${yb} Q${cx} ${yb + 7} ${l0} ${yb} Z`;
}

/** A digit's plates, knuckle first, so each later one laps over the one below. */
export function digitPlates(d: Digit): { d: string; ridge: string }[] {
  const width = (f: number) => d.wb + (d.wt - d.wb) * Math.max(0, f);
  return d.plates.map(([from, to]) => {
    const yb = d.base - from * d.len;
    const yt = d.base - to * d.len;
    const wt = width(to);
    return {
      d: plate(d.cx, yb, yt, width(from), wt),
      ridge: `M${d.cx} ${yb - 5} L${d.cx} ${yt + wt * 0.35}`,
    };
  });
}

/** Where the stones sit, before the whole hand is moved: a knuckle, the thumb, the back of the hand. */
const knuckle = (key: Digit["key"]): Pt => {
  const f = FINGERS.find((x) => x.key === key)!;
  return { x: f.cx, y: f.base + 3 };
};
const THUMB_STONE = rotateAbout({ x: THUMB.cx, y: THUMB.base - THUMB.len * 0.28 }, { x: THUMB.cx, y: THUMB.base }, THUMB.angle);
export const CENTRE: Pt = { x: 381, y: 326 };

export type Setting = Pt & { r: number };

/**
 * The six settings, in the order of the areas in the content file (AI / ML,
 * Mobile, Web & Backend, Cloud & DevOps, Languages, Hardware). Each area sits
 * where the stone of its colour sits on the film's gauntlet: purple on the
 * index finger, blue on the middle, red on the ring, orange on the little
 * finger, green on the thumb, and the back of the hand (yellow there; no area
 * is yellow, so Mobile's indigo takes it).
 */
export const SETTINGS: Setting[] = [
  { ...knuckle("index"), r: 8 },
  { ...CENTRE, r: 13 },
  { ...knuckle("middle"), r: 8 },
  { ...THUMB_STONE, r: 7.5 },
  { ...knuckle("little"), r: 7 },
  { ...knuckle("ring"), r: 8 },
];

/** The same six, where they land on the page once the hand is moved into place. */
export const STONE_SPOTS: Setting[] = SETTINGS.map((s) => ({ ...place(s), r: s.r * SCALE }));

/** Where the fingers meet in the snap: a flash starts here. */
export const SNAP_POINT: Pt = place({ x: 340, y: 196 });
