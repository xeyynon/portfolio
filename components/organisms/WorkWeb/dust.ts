/**
 * The dust a name turns into in the snap. Pure, apart from reading the glyphs
 * off a scratch canvas: every particle's place at any moment is a function of
 * time, so the same dust can be played forward to scatter it and backward to
 * bring the name back, grain for grain.
 */

export type Grain = {
  /** Where it starts, in CSS pixels of the canvas it is drawn on. */
  x: number;
  y: number;
  /** When it lets go, in seconds after the snap. */
  delay: number;
  /** How far it travels over its life. */
  dx: number;
  dy: number;
  /** A sideways waver as it drifts. */
  wave: number;
  phase: number;
  size: number;
};

export const LIFE = 1.3;
const SWEEP = 0.65;

/** The last moment any grain is still visible. */
export const DUST_END = SWEEP + 0.25 + LIFE;

/**
 * Reads the ink of one line of text into grains: draws it on a scratch
 * canvas in the font it is set in, and keeps one grain for every few pixels
 * that came out solid.
 */
export function textGrains(
  text: string,
  font: string,
  /** The text's box, in canvas CSS pixels. */
  box: { left: number; top: number; width: number; height: number },
  ink: string,
): { x: number; y: number }[] {
  const pad = 4;
  const w = Math.ceil(box.width + pad * 2);
  const h = Math.ceil(box.height + pad * 2);
  const scratch = document.createElement("canvas");
  scratch.width = w;
  scratch.height = h;
  const c = scratch.getContext("2d", { willReadFrequently: true });
  if (!c) return [];
  c.font = font;
  c.fillStyle = ink;
  c.textBaseline = "alphabetic";
  const m = c.measureText(text);
  const ascent = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent;
  const descent = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent;
  c.fillText(text, pad, pad + (box.height - (ascent + descent)) / 2 + ascent);
  const { data } = c.getImageData(0, 0, w, h);
  const out: { x: number; y: number }[] = [];
  const STEP = 2;
  for (let y = 0; y < h; y += STEP) {
    for (let x = 0; x < w; x += STEP) {
      if (data[(y * w + x) * 4 + 3] > 110) out.push({ x: box.left - pad + x, y: box.top - pad + y });
    }
  }
  return out;
}

/** Points filling a small disc, for a project's dot. */
export function discGrains(cx: number, cy: number, r: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let y = -r; y <= r; y += 1.5) for (let x = -r; x <= r; x += 1.5) if (x * x + y * y <= r * r) out.push({ x: cx + x, y: cy + y });
  return out;
}

/** Gives each point its own way of going: the left of a name lets go first, so it crumbles from one end. */
export function toGrains(points: { x: number; y: number }[], random: () => number = Math.random): Grain[] {
  if (!points.length) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const p of points) {
    min = Math.min(min, p.x);
    max = Math.max(max, p.x);
  }
  const span = Math.max(1, max - min);
  return points.map((p) => ({
    x: p.x,
    y: p.y,
    delay: ((p.x - min) / span) * SWEEP + random() * 0.25,
    dx: 40 + random() * 100,
    dy: -(16 + random() * 56),
    wave: 3 + random() * 9,
    phase: random() * Math.PI * 2,
    size: 1 + random() * 1.3,
  }));
}

/** Draws every grain as it is `t` seconds after the snap. A grain not yet let go sits where its ink was. */
export function drawDust(ctx: CanvasRenderingContext2D, grains: Grain[], t: number, ink: string): void {
  ctx.fillStyle = ink;
  for (const g of grains) {
    const k = Math.min(1, Math.max(0, (t - g.delay) / LIFE));
    if (k >= 1) continue;
    const e = k * k;
    ctx.globalAlpha = Math.pow(1 - k, 1.3);
    ctx.fillRect(g.x + g.dx * e + Math.sin(k * 5 + g.phase) * g.wave * k, g.y + g.dy * e, g.size, g.size);
  }
  ctx.globalAlpha = 1;
}
