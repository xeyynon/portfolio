import { FLATTEN, GLINTS, NODE, READINGS, RING_GAP, pulse, ripples } from "./pond";

/** The pond's colours, read from the world's tokens by the component. */
export type PondColours = {
  water: string;
  line: string;
  ink: string;
  signal: string;
  node: string;
};

type Frame = {
  width: number;
  height: number;
  /** Seconds on the ripples' clock. */
  time: number;
  /** True when nothing may move: the buoy sits level and the glints hold. */
  still: boolean;
  colours: PondColours;
};

/**
 * Draws one frame of the pond: still water, the node as a buoy, and the
 * ripples that have left it so far. Each ripple is three rings, one for each
 * reading, told apart by their line and not by colour.
 */
export function drawPond(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, time, still, colours: c } = frame;
  const unit = Math.min(w, h);
  const cx = NODE[0] * w;
  const cy = NODE[1] * h;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.water;
  ctx.fillRect(0, 0, w, h);

  // Glints: short level strokes that come and go, so the water reads as water.
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  for (const glint of GLINTS) {
    const x = glint.at[0] * w;
    const y = glint.at[1] * h;
    ctx.globalAlpha = still ? 0.7 : 0.45 + 0.4 * Math.sin(time * 0.6 + glint.phase);
    ctx.beginPath();
    ctx.moveTo(x - glint.length * w, y);
    ctx.lineTo(x + glint.length * w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // The ripples, oldest first so the newest is drawn over them.
  ctx.strokeStyle = c.signal;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "butt";
  for (const ripple of ripples(time).reverse()) {
    READINGS.forEach((reading, i) => {
      const reach = ripple.reach - i * RING_GAP;
      if (reach <= 0.03) return;
      ctx.globalAlpha = ripple.strength;
      ctx.setLineDash([...reading.dash]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, reach * w, reach * w * FLATTEN, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // The node, drawn as a buoy. It rides the water a little unless nothing may move.
  const u = Math.max(14, unit * 0.055);
  const y = cy + (still ? 0 : Math.sin(time * 1.3) * u * 0.06);

  // its reflection
  ctx.fillStyle = c.node;
  ctx.globalAlpha = 0.14;
  ctx.fillRect(cx - u * 0.3, y, u * 0.6, u * 1.9);
  ctx.globalAlpha = 1;

  // the float: a tapered body on a wide base
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.8, y);
  ctx.lineTo(cx - u * 0.48, y - u * 0.95);
  ctx.lineTo(cx + u * 0.48, y - u * 0.95);
  ctx.lineTo(cx + u * 0.8, y);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, y, u * 0.8, u * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  // a band round it
  ctx.fillStyle = c.water;
  ctx.beginPath();
  ctx.moveTo(cx - u * 0.61, y - u * 0.58);
  ctx.lineTo(cx + u * 0.61, y - u * 0.58);
  ctx.lineTo(cx + u * 0.66, y - u * 0.42);
  ctx.lineTo(cx - u * 0.66, y - u * 0.42);
  ctx.closePath();
  ctx.fill();

  // the mast and the antenna at its top, which lights as a ripple leaves
  const top = y - u * 2.1;
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, y - u * 0.95);
  ctx.lineTo(cx, top);
  ctx.stroke();
  const lit = still ? 0 : pulse(time);
  if (lit > 0) {
    ctx.strokeStyle = c.signal;
    ctx.globalAlpha = lit;
    ctx.beginPath();
    ctx.arc(cx, top, u * (0.22 + 0.5 * (1 - lit)), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = c.signal;
  ctx.beginPath();
  ctx.arc(cx, top, u * 0.13, 0, Math.PI * 2);
  ctx.fill();
}
