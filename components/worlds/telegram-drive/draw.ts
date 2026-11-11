import { CHUNKS, CLOUD_X, DEVICE_X, INDEX, SLAB, ease, flight, ivMarks, shown, slabTop, turn } from "./scene";

/** The scene's colours, read from the world's tokens by the component. */
export type SceneColours = {
  vault: string;
  line: string;
  ink: string;
  plain: string;
  locked: string;
};

type Frame = {
  width: number;
  height: number;
  stage: number;
  progress: number;
  colours: SceneColours;
};

/** A padlock, centred on (cx, cy), `size` wide. */
function padlock(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.5, size * 0.16);
  ctx.fillRect(cx - size / 2, cy - size * 0.1, size, size * 0.6);
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.1, size * 0.28, Math.PI, 0);
  ctx.stroke();
}

/**
 * One chunk. `locked` 0 is plain data: an outline with two lines of content.
 * `locked` 1 is encrypted: the other colour, a padlock, and the three marks
 * that stand for the chunk's own IV.
 */
function slab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  locked: number,
  k: number,
  c: SceneColours,
): void {
  // Whatever is behind it (the place it left, a chunk it passes) does not show through.
  ctx.fillStyle = c.vault;
  ctx.fillRect(x, y, w, h);

  if (locked < 1) {
    const open = 1 - locked;
    ctx.fillStyle = c.plain;
    ctx.globalAlpha = 0.16 * open;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 0.55 * open;
    ctx.fillRect(x + h * 0.4, y + h * 0.3, w * 0.5, h * 0.12);
    ctx.fillRect(x + h * 0.4, y + h * 0.58, w * 0.32, h * 0.12);
    ctx.globalAlpha = open;
    ctx.strokeStyle = c.plain;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
  }

  if (locked > 0) {
    ctx.fillStyle = c.locked;
    ctx.globalAlpha = 0.2 * locked;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = locked;
    ctx.strokeStyle = c.locked;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
    padlock(ctx, x + h * 0.62, y + h / 2, h * 0.4, c.locked);

    const mark = h * 0.2;
    ctx.lineWidth = 1;
    ivMarks(k).forEach((on, i) => {
      const mx = x + w - h * 0.35 - (3 - i) * mark * 1.5 + mark * 0.5;
      const my = y + (h - mark) / 2;
      if (on) ctx.fillRect(mx, my, mark, mark);
      else ctx.strokeRect(mx, my, mark, mark);
    });
  }
  ctx.globalAlpha = 1;
}

/**
 * Draws one frame of the scene. Everything a step adds stays once it is
 * there, so the last step shows the whole story: the encrypted chunks and the
 * pinned index at rest in Telegram, and the file open again on the device.
 */
export function drawScene(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, stage, progress, colours: c } = frame;
  const sw = SLAB.width * w;
  const sh = SLAB.height * h;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.vault;
  ctx.fillRect(0, 0, w, h);

  // The line between the device and Telegram.
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, 0);
  ctx.lineTo(w * 0.5, h);
  ctx.stroke();

  const split = ease(shown(0, stage, progress));
  const encrypt = shown(1, stage, progress);
  const send = shown(2, stage, progress);
  const index = ease(shown(3, stage, progress));
  const stream = shown(4, stage, progress);

  // 3. Where each chunk stood on the device, once it has left.
  if (send > 0) {
    for (let k = 0; k < CHUNKS; k++) {
      if (turn(send, k) > 0) ctx.strokeRect(DEVICE_X * w, slabTop(k, split) * h, sw, sh);
    }
  }
  ctx.setLineDash([]);

  // 1 to 3. The chunks: cut apart, locked one by one, then sent across one by one.
  for (let k = 0; k < CHUNKS; k++) {
    const [x, y] = flight(DEVICE_X, CLOUD_X, slabTop(k, split), turn(send, k));
    slab(ctx, x * w, y * h, sw, sh, ease(turn(encrypt, k)), k, c);
  }

  // 4. The index: an encrypted message, pinned above the chunks.
  if (index > 0) {
    const ix = INDEX.x * w;
    const iy = INDEX.y * h - (1 - index) * sh * 0.4;
    const iw = INDEX.width * w;
    const ih = INDEX.height * h;
    ctx.fillStyle = c.locked;
    ctx.globalAlpha = 0.14 * index;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.globalAlpha = index;
    ctx.strokeStyle = c.locked;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ix, iy, iw, ih);
    padlock(ctx, ix + ih * 0.55, iy + ih / 2, ih * 0.34, c.locked);
    // the entries it lists
    [1, 0.65, 0.82].forEach((length, i) => {
      ctx.fillRect(ix + ih * 1.05, iy + ih * (0.24 + i * 0.22), (iw - ih * 1.9) * length, ih * 0.09);
    });
    // the pin
    const px = ix + iw - ih * 0.3;
    ctx.strokeStyle = c.ink;
    ctx.fillStyle = c.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, iy - ih * 0.12);
    ctx.lineTo(px - ih * 0.2, iy + ih * 0.32);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, iy - ih * 0.12, Math.max(3, ih * 0.14), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // 5. Playback: a copy of each chunk comes back in turn and opens as it lands.
  if (stream > 0) {
    let playing = -1;
    for (let k = 0; k < CHUNKS; k++) {
      const back = turn(stream, k);
      if (back <= 0) continue;
      const top = slabTop(k, split);
      const [x, y] = flight(CLOUD_X, DEVICE_X, top, back);
      slab(ctx, x * w, y * h, sw, sh, 1 - ease((back - 0.6) / 0.4), k, c);
      if (back >= 1) playing = k;
    }
    // The play mark stands beside the chunk that has just opened.
    if (playing >= 0) {
      const cy = (slabTop(playing, split) + SLAB.height / 2) * h;
      const right = DEVICE_X * w - sh * 0.45;
      const half = sh * 0.3;
      ctx.fillStyle = c.ink;
      ctx.beginPath();
      ctx.moveTo(right, cy);
      ctx.lineTo(right - half * 1.5, cy - half);
      ctx.lineTo(right - half * 1.5, cy + half);
      ctx.closePath();
      ctx.fill();
    }
  }
}
