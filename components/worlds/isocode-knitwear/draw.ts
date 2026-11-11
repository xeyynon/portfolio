import { columns, knitted } from "./floor";

/** The floor's colours, read from the world's tokens by the component. */
export type FloorColours = {
  floor: string;
  guide: string;
  yarn: string;
  ink: string;
};

type StripFrame = {
  width: number;
  height: number;
  /** How much of the row is knitted, 0 to 1. */
  progress: number;
  /** Where the pace line stands, 0 to 1. */
  pace: number;
  /** The colour of the row's status. */
  colour: string;
  /** Behind: the gap to the pace line is drawn. */
  behind: boolean;
  /** No updates: nothing is known, so the row is only an outline. */
  hollow: boolean;
  colours: FloorColours;
};

const STITCH = 14; // px, about
const COURSES = 2; // lines of stitches in one row

/**
 * Draws one row of the floor: the stitches knitted so far in the row's status
 * colour, the ones still to come as a faint outline, the pace line where the
 * row has to be today, and the ship date as the right edge.
 */
export function drawStrip(ctx: CanvasRenderingContext2D, frame: StripFrame): void {
  const { width: w, height: h, colours: c } = frame;
  const cols = columns(w, STITCH);
  const sw = w / cols;
  const ch = h / COURSES;
  const { whole, part } = knitted(frame.progress, cols);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.floor;
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // One knit stitch: a V.
  const column = (col: number) => {
    for (let course = 0; course < COURSES; course++) {
      const x = col * sw;
      const y = course * ch;
      ctx.moveTo(x + sw * 0.14, y + ch * 0.2);
      ctx.lineTo(x + sw * 0.5, y + ch * 0.8);
      ctx.lineTo(x + sw * 0.86, y + ch * 0.2);
    }
  };

  // Still to knit.
  ctx.strokeStyle = frame.hollow ? frame.colour : c.guide;
  ctx.globalAlpha = frame.hollow ? 0.5 : 1;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let col = whole; col < cols; col++) column(col);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Knitted, and the stitch on the needle.
  ctx.strokeStyle = frame.colour;
  ctx.lineWidth = Math.max(2, sw * 0.2);
  ctx.beginPath();
  for (let col = 0; col < whole; col++) column(col);
  ctx.stroke();
  if (part > 0 && whole < cols) {
    ctx.globalAlpha = part;
    ctx.beginPath();
    column(whole);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // The gap between where the row is and where it has to be.
  const paceX = Math.max(1, Math.min(w - 2, frame.pace * w));
  const frontX = frame.progress * w;
  if (frame.behind && paceX - frontX > 6) {
    ctx.strokeStyle = frame.colour;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(frontX + 4, h / 2);
    ctx.lineTo(paceX - 3, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // The ship date, then the pace line.
  ctx.fillStyle = c.ink;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(w - 2, 0, 2, h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = c.yarn;
  ctx.fillRect(paceX - 1, 0, 2, h);
}
