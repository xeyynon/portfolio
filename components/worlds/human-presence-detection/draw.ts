import {
  EMPTY,
  FLOOR,
  PERSON_TALL,
  RECEIVERS,
  ROUTER,
  STRIP_COLS,
  STRIP_ROWS,
  WAVE_GAP,
  WAVE_SECONDS,
  personSwing,
  personX,
  wavefront,
  type Body,
  type Point,
} from "./room";

/** The room's colours, read from the world's tokens by the component. */
export type RoomColours = {
  room: string;
  line: string;
  ink: string;
  muted: string;
  wave: string;
  stir: string;
};

type Frame = {
  width: number;
  height: number;
  /** Index into MODES: who is in the room. */
  mode: number;
  /** Seconds. Held at one value for a still picture. */
  time: number;
  /** The strip so far, oldest column first; at most STRIP_COLS columns. */
  strip: number[][];
  colours: RoomColours;
};

const ROOM_SHARE = 0.72; // of the picture's height; the strip has the rest

/**
 * Draws one frame. Above: the room from the side, a router on the left wall,
 * four receivers on the right, wavefronts crossing between them and bending
 * round whoever is there. Below: the strip, one column per moment, filling
 * from the left and then rolling on.
 */
export function drawRoom(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, mode, time, strip, colours: c } = frame;
  const roomH = h * ROOM_SHARE;
  const px = (p: Point): Point => [p[0] * w, p[1] * roomH];

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.room;
  ctx.fillRect(0, 0, w, h);
  ctx.lineJoin = "round";

  const floorY = FLOOR * roomH;
  const source = px(ROUTER);
  const body: Body | null =
    mode === EMPTY ? null : { x: personX(mode, time) * w, top: floorY - PERSON_TALL * roomH, bottom: floorY };

  // The waves, kept inside the room.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, floorY);
  ctx.clip();

  const gap = WAVE_GAP * w;
  const furthest = Math.hypot(w, roomH);
  const first = ((time / WAVE_SECONDS) % 1) * gap;
  ctx.lineCap = "round";

  // What the person sends back out: fainter rings from where they stand.
  if (body) {
    const centre: Point = [body.x, (body.top + body.bottom) / 2];
    const toCentre = Math.hypot(centre[0] - source[0], centre[1] - source[1]);
    ctx.strokeStyle = c.stir;
    ctx.lineWidth = 1;
    for (let radius = first; radius < furthest; radius += gap) {
      const out = radius - toCentre;
      if (out <= 0) continue;
      ctx.globalAlpha = 0.5 * Math.exp(-out / (0.28 * w));
      ctx.beginPath();
      ctx.arc(centre[0], centre[1], out, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // The signal itself: wavefronts leaving the router.
  ctx.strokeStyle = c.wave;
  ctx.lineWidth = 1.5;
  for (let radius = first; radius < furthest; radius += gap) {
    const fade = (0.22 + 0.6 * (1 - radius / furthest)) * Math.min(1, radius / (gap * 0.5));
    const points = wavefront(source, radius, body, 0.14 * w, gap * 0.6);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      ctx.globalAlpha = fade * Math.min(a.strength, b.strength);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // The floor.
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, floorY + 0.5);
  ctx.lineTo(w, floorY + 0.5);
  ctx.stroke();

  // The router: a box on the left wall, one antenna, the point the waves leave from.
  const boxW = 0.045 * w;
  const boxH = 0.07 * roomH;
  ctx.fillStyle = c.room;
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 1.5;
  ctx.fillRect(source[0] - boxW - 4, source[1] - boxH / 2, boxW, boxH);
  ctx.strokeRect(source[0] - boxW - 4, source[1] - boxH / 2, boxW, boxH);
  ctx.beginPath();
  ctx.moveTo(source[0] - boxW * 0.5 - 4, source[1] - boxH / 2);
  ctx.lineTo(source[0] - boxW * 0.5 - 4, source[1] - boxH * 1.4);
  ctx.stroke();
  ctx.fillStyle = c.wave;
  ctx.beginPath();
  ctx.arc(source[0], source[1], 3, 0, Math.PI * 2);
  ctx.fill();

  // The four receivers on the far wall, each with its antenna toward the room.
  const size = Math.max(6, 0.022 * w);
  ctx.fillStyle = c.room;
  ctx.strokeStyle = c.ink;
  for (const receiver of RECEIVERS) {
    const [x, y] = px(receiver);
    ctx.beginPath();
    ctx.moveTo(x - size * 1.4, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillRect(x, y - size / 2, size, size);
    ctx.strokeRect(x, y - size / 2, size, size);
  }

  // The person, drawn over the waves.
  if (body) {
    const tall = body.bottom - body.top;
    const headR = tall * 0.085;
    const neckY = body.top + headR * 2;
    const shoulderY = neckY + tall * 0.05;
    const hipY = body.bottom - tall * 0.42;
    const stride = tall * 0.15 * personSwing(mode, time);
    ctx.strokeStyle = c.stir;
    ctx.lineWidth = Math.max(2, tall * 0.035);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(body.x, neckY);
    ctx.lineTo(body.x, hipY);
    ctx.moveTo(body.x, hipY);
    ctx.lineTo(body.x + stride, body.bottom - 1);
    ctx.moveTo(body.x, hipY);
    ctx.lineTo(body.x - stride, body.bottom - 1);
    ctx.moveTo(body.x, shoulderY);
    ctx.lineTo(body.x - stride * 0.8, shoulderY + tall * 0.27);
    ctx.moveTo(body.x, shoulderY);
    ctx.lineTo(body.x + stride * 0.8, shoulderY + tall * 0.27);
    ctx.stroke();
    ctx.fillStyle = c.room;
    ctx.beginPath();
    ctx.arc(body.x, body.top + headR, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  // The strip. Every cell carries a little of the signal's colour; the more a
  // person stirs the signal at that moment, the more of theirs is laid over it.
  const left = 0.04 * w;
  const top = roomH + 0.05 * h;
  const stripW = 0.92 * w;
  const stripH = h * (1 - ROOM_SHARE) - 0.1 * h;
  const cellW = stripW / STRIP_COLS;
  const cellH = stripH / STRIP_ROWS;

  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(left - 3.5, top - 3.5, stripW + 7, stripH + 7);

  strip.forEach((column, i) => {
    const x = left + i * cellW;
    for (let row = 0; row < STRIP_ROWS; row++) {
      const y = top + row * cellH;
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = c.wave;
      ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
      if (column[row] > 0.02) {
        ctx.globalAlpha = Math.min(1, column[row]);
        ctx.fillStyle = c.stir;
        ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
      }
    }
  });
  ctx.globalAlpha = 1;
}
