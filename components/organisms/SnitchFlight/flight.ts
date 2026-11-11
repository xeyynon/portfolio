/**
 * Where the small Snitch is, for a given scroll position. Pure: numbers in,
 * numbers out, so the path can be read and tested without a browser.
 *
 * It leaves as the opening scrolls away, weaves down the page from margin to
 * margin (a sine, sharpened so it waits at the edges and crosses quickly,
 * which keeps it off the text), then comes in from the left and lands on its
 * spot in Contact. Scrolling back flies it back.
 */

export type FlightInput = {
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  /** The furthest the page can scroll. */
  maxScroll: number;
  /** Page y where the opening ends. */
  openingEnd: number;
  /** Page coordinates of the centre of the landing spot. */
  landing: { x: number; y: number };
};

export type FlightState = {
  /** Viewport coordinates of the Snitch's centre. */
  x: number;
  y: number;
  /** 0 hidden, 1 fully there. */
  presence: number;
  /** 0 on its path, 1 arrived at the landing spot. */
  approach: number;
  landed: boolean;
};

const TURNS = 2.25; // margin-to-margin swings over the flight
const APPROACH_FROM = 0.86; // the part of the flight spent coming in to land
// Chosen so the path is at the left margin when the approach begins.
const PHASE = 1.5 * Math.PI - 2 * Math.PI * TURNS * APPROACH_FROM;
const WIDE = 900; // below this there are no margins to fly in

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function flight(input: FlightInput): FlightState {
  const { scrollY, viewportWidth: vw, viewportHeight: vh, maxScroll, openingEnd, landing } = input;
  const landingX = landing.x;
  const landingY = landing.y - scrollY;

  const start = openingEnd - vh * 0.35;
  // It lands when the landing spot is mid-screen, or at the end of the page if
  // the page ends before that can happen (a tall screen), so it always lands.
  const end = Math.min(landing.y - vh * 0.5, maxScroll - 2);
  const t = end > start ? (scrollY - start) / (end - start) : 1;

  if (t >= 1) return { x: landingX, y: landingY, presence: 1, approach: 1, landed: true };
  if (t <= 0) return { x: vw + 80, y: vh * 0.3, presence: 0, approach: 0, landed: false };

  const approach = smoothstep(APPROACH_FROM, 1, t);
  const wide = vw >= WIDE;

  let pathX: number;
  let pathY: number;
  if (wide) {
    const margin = Math.min(64, Math.max(28, vw * 0.04));
    const swing = Math.sin(2 * Math.PI * TURNS * t + PHASE);
    pathX = vw / 2 + (vw / 2 - margin) * Math.sign(swing) * Math.pow(Math.abs(swing), 0.35);
    pathY = vh * (0.5 + 0.2 * Math.sin(2 * Math.PI * 1.3 * t + 1));
  } else {
    // No margins: it waits off the left edge, level with where it will land.
    pathX = -60;
    pathY = landingY;
  }

  return {
    x: mix(pathX, landingX, approach),
    y: mix(pathY, landingY, approach),
    presence: wide ? smoothstep(0, 0.04, t) : smoothstep(0, 0.25, approach),
    approach,
    landed: false,
  };
}
