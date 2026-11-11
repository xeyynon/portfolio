import { TILE_COUNT, arrived, corner, fit, kindOf, level } from "./tiles";

/** The mosaic's colours, read from the world's tokens by the component. */
export type MosaicColours = {
  tile: string;
  line: string;
  on: string;
  off: string;
};

type Frame = {
  width: number;
  height: number;
  /** Seconds, for the controls switching. 0 holds them still. */
  time: number;
  /** How far the tiles' arrival has got, 0 to 1. */
  intro: number;
  colours: MosaicColours;
};

const pill = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(w, h) / 2);
};

/**
 * Draws one frame of the mosaic: 134 small tiles, each holding a tiny control
 * (a button, a toggle, a slider, tabs, a field or a card) that switches by
 * itself now and then. Switched on is the accent; off is the muted grey.
 */
export function drawMosaic(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, time, intro, colours: c } = frame;
  const grid = fit(w, h, TILE_COUNT);
  const gap = Math.max(2, grid.size * 0.1);
  const s = grid.size - gap;

  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1;

  for (let i = 0; i < TILE_COUNT; i++) {
    const shown = arrived(i, intro, TILE_COUNT);
    if (shown <= 0) continue;
    const [cx, cy] = corner(grid, i);
    const x = cx + gap / 2;
    const y = cy + gap / 2 + (1 - shown) * s * 0.3;
    const on = level(i, time);
    ctx.globalAlpha = shown;

    ctx.fillStyle = c.tile;
    ctx.strokeStyle = c.line;
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, s * 0.14);
    ctx.fill();
    ctx.stroke();

    const my = y + s / 2;
    switch (kindOf(i)) {
      case "button": {
        pill(ctx, x + s * 0.18, my - s * 0.13, s * 0.64, s * 0.26);
        ctx.fillStyle = c.off;
        ctx.globalAlpha = shown * 0.35;
        ctx.fill();
        ctx.fillStyle = c.on;
        ctx.globalAlpha = shown * on;
        ctx.fill();
        break;
      }
      case "toggle": {
        pill(ctx, x + s * 0.22, my - s * 0.12, s * 0.56, s * 0.24);
        ctx.strokeStyle = on > 0.5 ? c.on : c.off;
        ctx.stroke();
        ctx.fillStyle = on > 0.5 ? c.on : c.off;
        ctx.beginPath();
        ctx.arc(x + s * (0.34 + 0.32 * on), my, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "slider": {
        const from = x + s * 0.18;
        const span = s * 0.64;
        const at = from + span * (0.15 + 0.7 * on);
        ctx.fillStyle = c.off;
        ctx.fillRect(from, my - 1, span, 2);
        ctx.fillStyle = c.on;
        ctx.fillRect(from, my - 1, at - from, 2);
        ctx.beginPath();
        ctx.arc(at, my, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "tabs": {
        const tab = s * 0.2;
        const pick = on > 0.5 ? 2 : 0;
        for (let k = 0; k < 3; k++) {
          ctx.fillStyle = k === pick ? c.on : c.off;
          ctx.fillRect(x + s * 0.17 + k * (tab + s * 0.03), my - s * 0.04, tab, s * 0.08);
        }
        break;
      }
      case "field": {
        ctx.strokeStyle = c.off;
        ctx.strokeRect(x + s * 0.16, my - s * 0.12, s * 0.68, s * 0.24);
        ctx.fillStyle = c.on;
        ctx.fillRect(x + s * 0.24, my - s * 0.06, Math.max(1.5, s * 0.5 * on), s * 0.12);
        break;
      }
      case "card": {
        ctx.fillStyle = c.on;
        ctx.globalAlpha = shown * (0.3 + 0.7 * on);
        ctx.fillRect(x + s * 0.2, y + s * 0.22, s * 0.6, s * 0.16);
        ctx.globalAlpha = shown;
        ctx.fillStyle = c.off;
        ctx.fillRect(x + s * 0.2, y + s * 0.5, s * 0.6, s * 0.07);
        ctx.fillRect(x + s * 0.2, y + s * 0.64, s * 0.4, s * 0.07);
        break;
      }
    }
  }
  ctx.globalAlpha = 1;
}
