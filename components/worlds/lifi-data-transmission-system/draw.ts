import {
  BIT_SECONDS,
  DECISION_LEVEL,
  FLIGHT_SECONDS,
  TRACE_SECONDS,
  bitAt,
  decidedBit,
  decisionTime,
  litStretches,
  receivedLevel,
} from "./beam";

/** The bench's colours, read from the world's tokens by the component. */
export type BenchColours = {
  bench: string;
  line: string;
  ink: string;
  muted: string;
  beam: string;
  recovered: string;
};

type Frame = {
  width: number;
  height: number;
  /** Seconds since the beam was switched on. */
  time: number;
  colours: BenchColours;
};

/**
 * Draws one frame of the bench. Upper half: the transmitter on the left, the
 * beam with its bits under way, the solar panel and amplifier on the right.
 * Lower half: two traces of the last few seconds, what was keyed and what the
 * receiver handed on, with a mark under each bit the decoder read.
 */
export function drawBench(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, time, colours: c } = frame;
  const unit = Math.min(w, h);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.bench;
  ctx.fillRect(0, 0, w, h);
  ctx.lineJoin = "round";
  ctx.lineCap = "butt";

  const beamY = 0.27 * h;
  const benchY = 0.5 * h;
  const fromX = 0.18 * w; // the laser's aperture
  const hitX = 0.845 * w; // where the beam lands on the panel

  // The bench top.
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, benchY);
  ctx.lineTo(w, benchY);
  ctx.stroke();

  // Transmitter: the board on the bench, a post, and the laser module on it.
  const boardL = 0.04 * w;
  const boardR = 0.16 * w;
  const boardT = benchY - 0.07 * h;
  ctx.strokeStyle = c.muted;
  ctx.lineWidth = 1.25;
  ctx.strokeRect(boardL, boardT, boardR - boardL, benchY - boardT - 1);
  ctx.beginPath();
  for (let i = 1; i < 8; i++) {
    const x = boardL + (i / 8) * (boardR - boardL);
    ctx.moveTo(x, boardT + 3);
    ctx.lineTo(x, boardT + 3 + 0.014 * h);
  }
  const postX = 0.1 * w;
  ctx.moveTo(postX, boardT);
  ctx.lineTo(postX, beamY + 0.035 * h);
  ctx.stroke();

  const barrelL = 0.06 * w;
  const barrelH = 0.07 * h;
  ctx.fillStyle = c.bench;
  ctx.strokeStyle = c.ink;
  ctx.fillRect(barrelL, beamY - barrelH / 2, fromX - barrelL, barrelH);
  ctx.strokeRect(barrelL, beamY - barrelH / 2, fromX - barrelL, barrelH);

  // Receiver: the solar panel turned a little toward us, on its post, and the
  // amplifier on the bench beside it (drawn as the amplifier symbol in a box).
  const half = 0.035 * w;
  const quad: [number, number][] = [
    [hitX - half, beamY - 0.13 * h],
    [hitX + half, beamY - 0.19 * h],
    [hitX + half, beamY + 0.13 * h],
    [hitX - half, beamY + 0.19 * h],
  ];
  const onPanel = (u: number, v: number): [number, number] => {
    const top = [quad[0][0] + (quad[1][0] - quad[0][0]) * u, quad[0][1] + (quad[1][1] - quad[0][1]) * u];
    const bottom = [quad[3][0] + (quad[2][0] - quad[3][0]) * u, quad[3][1] + (quad[2][1] - quad[3][1]) * u];
    return [top[0] + (bottom[0] - top[0]) * v, top[1] + (bottom[1] - top[1]) * v];
  };

  ctx.strokeStyle = c.muted;
  ctx.beginPath();
  ctx.moveTo(hitX, beamY + 0.16 * h);
  ctx.lineTo(hitX, benchY);
  ctx.stroke();

  ctx.beginPath();
  quad.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
  ctx.fillStyle = c.bench;
  ctx.fill();
  ctx.strokeStyle = c.ink;
  ctx.stroke();
  ctx.strokeStyle = c.muted;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  for (let i = 1; i < 3; i++) {
    ctx.moveTo(...onPanel(i / 3, 0));
    ctx.lineTo(...onPanel(i / 3, 1));
  }
  for (let i = 1; i < 5; i++) {
    ctx.moveTo(...onPanel(0, i / 5));
    ctx.lineTo(...onPanel(1, i / 5));
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  const ampL = 0.9 * w;
  const ampR = 0.97 * w;
  const ampT = benchY - 0.08 * h;
  const ampMid = (ampL + ampR) / 2;
  ctx.strokeStyle = c.muted;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(hitX + half, beamY + 0.08 * h);
  ctx.lineTo(ampMid, beamY + 0.08 * h);
  ctx.lineTo(ampMid, ampT);
  ctx.stroke();
  ctx.strokeRect(ampL, ampT, ampR - ampL, benchY - ampT - 1);
  const ampY = (ampT + benchY) / 2;
  const tri = Math.min(ampR - ampL, benchY - ampT) * 0.28;
  ctx.beginPath();
  ctx.moveTo(ampMid - tri, ampY - tri);
  ctx.lineTo(ampMid + tri, ampY);
  ctx.lineTo(ampMid - tri, ampY + tri);
  ctx.closePath();
  ctx.stroke();

  // The beam's path, faint, so a gap reads as "off" and not as nothing there.
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 5]);
  ctx.beginPath();
  ctx.moveTo(fromX, beamY);
  ctx.lineTo(hitX, beamY);
  ctx.stroke();
  ctx.setLineDash([]);

  // The light under way: each 1 is a lit stretch moving left to right.
  const stretches = litStretches(time);
  const span = hitX - fromX;
  ctx.strokeStyle = c.beam;
  for (const [from, to] of stretches) {
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = Math.max(6, unit * 0.022);
    ctx.beginPath();
    ctx.moveTo(fromX + from * span, beamY);
    ctx.lineTo(fromX + to * span, beamY);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(fromX + from * span, beamY);
    ctx.lineTo(fromX + to * span, beamY);
    ctx.stroke();
  }
  // Where it lands: a small spot on the panel while light is arriving.
  if (stretches.some(([, to]) => to >= 1)) {
    ctx.fillStyle = c.beam;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(hitX, beamY, unit * 0.028, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(hitX, beamY, Math.max(2.5, unit * 0.009), 0, Math.PI * 2);
    ctx.fill();
  }

  // The two traces. The right edge is now; the past runs off to the left.
  const left = 0.05 * w;
  const right = 0.95 * w;
  const at = (seconds: number) => right - ((time - seconds) / TRACE_SECONDS) * (right - left);
  const sentBase = 0.7 * h;
  const sentTall = 0.1 * h;
  const gotBase = 0.9 * h;
  const gotTall = 0.12 * h;
  const start = time - TRACE_SECONDS;

  // Bit boundaries, shared by both traces (the flight time is a whole number of bits).
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = Math.ceil(start / BIT_SECONDS); k * BIT_SECONDS <= time; k++) {
    const x = Math.round(at(k * BIT_SECONDS)) + 0.5;
    ctx.moveTo(x, sentBase - sentTall - 4);
    ctx.lineTo(x, gotBase + 4);
  }
  ctx.stroke();

  // Upper trace: what the transmitter keyed. Square, because a laser is on or off.
  ctx.strokeStyle = c.beam;
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  let first = true;
  for (let k = Math.floor(start / BIT_SECONDS); k * BIT_SECONDS < time; k++) {
    const from = Math.max(start, k * BIT_SECONDS);
    const to = Math.min(time, (k + 1) * BIT_SECONDS);
    const y = sentBase - bitAt(k) * sentTall;
    if (first) ctx.moveTo(at(from), y);
    else ctx.lineTo(at(from), y);
    ctx.lineTo(at(to), y);
    first = false;
  }
  ctx.stroke();

  // Lower trace: what the receiver handed on, with the level the decoder compares against.
  ctx.strokeStyle = c.muted;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(left, gotBase - DECISION_LEVEL * gotTall);
  ctx.lineTo(right, gotBase - DECISION_LEVEL * gotTall);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = c.recovered;
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  for (let x = left; x <= right; x += 2) {
    const seconds = time - ((right - x) / (right - left)) * TRACE_SECONDS;
    const y = gotBase - receivedLevel(seconds) * gotTall;
    if (x === left) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // One mark under each bit the decoder has read: filled for a 1, hollow for a 0.
  const markY = 0.955 * h;
  const markR = Math.max(2.5, unit * 0.011);
  ctx.fillStyle = c.recovered;
  ctx.lineWidth = 1.25;
  for (let k = Math.max(0, Math.ceil((start - FLIGHT_SECONDS) / BIT_SECONDS - 0.5)); decisionTime(k) <= time; k++) {
    const x = at(decisionTime(k));
    if (x < left) continue;
    ctx.beginPath();
    ctx.arc(x, markY, markR, 0, Math.PI * 2);
    if (decidedBit(k)) ctx.fill();
    else ctx.stroke();
  }
}
