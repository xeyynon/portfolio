import { MOTES, THRESHOLD, alarmOn, gasLevel, motePlace, rings } from "./plume";

/** The floor's colours, read from the world's tokens by the component. */
export type FloorColours = {
  floor: string;
  line: string;
  ink: string;
  muted: string;
  gas: string;
  alarm: string;
};

type Frame = {
  width: number;
  height: number;
  /** Seconds. Held at one value for a still picture. */
  time: number;
  colours: FloorColours;
};

/**
 * Draws one frame of the floor at night. A sawtooth roof, machines along the
 * floor with gas rising off them, the alarm line across the room, and the
 * device on the right with its speaker, ringing while the gas is over the
 * line. A gauge on the device's mast shows the level against the line.
 */
export function drawFloor(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, time, colours: c } = frame;
  const unit = Math.min(w, h);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.floor;
  ctx.fillRect(0, 0, w, h);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const floorY = 0.88 * h;
  const roofY = 0.1 * h;
  const span = floorY - roofY;
  const yAt = (share: number) => floorY - share * span;

  // The roof: a factory's sawtooth, and its columns.
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const teeth = 6;
  for (let i = 0; i < teeth; i++) {
    const x0 = (i / teeth) * w;
    const x1 = ((i + 1) / teeth) * w;
    ctx.moveTo(x0, roofY);
    ctx.lineTo(x0 + (x1 - x0) * 0.8, roofY - 0.07 * h);
    ctx.lineTo(x1, roofY);
  }
  ctx.moveTo(0, roofY);
  ctx.lineTo(w, roofY);
  for (let i = 1; i < teeth; i++) {
    ctx.moveTo((i / teeth) * w, roofY);
    ctx.lineTo((i / teeth) * w, floorY);
  }
  ctx.stroke();

  // The machines: blocks along the floor, a stack on one of them.
  ctx.fillStyle = c.floor;
  ctx.strokeStyle = c.muted;
  ctx.lineWidth = 1.25;
  const machines: [number, number, number][] = [
    [0.05, 0.16, 0.1],
    [0.24, 0.12, 0.16],
    [0.42, 0.18, 0.08],
  ];
  for (const [x, wide, tall] of machines) {
    ctx.fillRect(x * w, floorY - tall * h, wide * w, tall * h);
    ctx.strokeRect(x * w, floorY - tall * h, wide * w, tall * h);
  }
  ctx.strokeRect(0.29 * w, floorY - 0.27 * h, 0.03 * w, 0.11 * h);

  // The gas: motes rising off the floor as far as the level has reached.
  ctx.fillStyle = c.gas;
  for (const mote of MOTES) {
    const { x, height, fade } = motePlace(mote, time);
    if (fade <= 0) continue;
    ctx.globalAlpha = 0.75 * fade;
    ctx.beginPath();
    ctx.arc(x * w, yAt(height), mote.size * Math.max(1, unit / 400), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // The alarm line, across the room.
  const lineY = yAt(THRESHOLD);
  const on = alarmOn(time);
  ctx.strokeStyle = c.alarm;
  ctx.lineWidth = on ? 2 : 1.25;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0.03 * w, lineY);
  ctx.lineTo(0.97 * w, lineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // The device on the right: a box on a mast, its speaker on the front.
  const devX = 0.83 * w;
  const devW = 0.08 * w;
  const devH = 0.12 * h;
  const devTop = floorY - 0.32 * h;
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(devX, devTop + devH);
  ctx.lineTo(devX, floorY);
  ctx.moveTo(devX - devW * 0.4, floorY);
  ctx.lineTo(devX + devW * 0.4, floorY);
  ctx.stroke();
  ctx.fillStyle = c.floor;
  ctx.fillRect(devX - devW / 2, devTop, devW, devH);
  ctx.strokeRect(devX - devW / 2, devTop, devW, devH);
  // its antenna, for the 4G and GPS alert
  ctx.beginPath();
  ctx.moveTo(devX + devW * 0.3, devTop);
  ctx.lineTo(devX + devW * 0.3, devTop - 0.06 * h);
  ctx.stroke();
  const speaker: [number, number] = [devX, devTop + devH / 2];
  const speakerR = Math.min(devW, devH) * 0.22;
  ctx.beginPath();
  ctx.arc(speaker[0], speaker[1], speakerR, 0, Math.PI * 2);
  ctx.stroke();

  // The gauge on the mast's side: the level against the line.
  const gaugeX = devX + devW * 0.75;
  const gaugeW = Math.max(6, 0.012 * w);
  ctx.strokeStyle = c.muted;
  ctx.lineWidth = 1;
  ctx.strokeRect(gaugeX, yAt(1), gaugeW, span);
  const level = gasLevel(time);
  ctx.fillStyle = c.gas;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(gaugeX + 1.5, yAt(level), gaugeW - 3, level * span - 1.5);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = c.alarm;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gaugeX - 4, lineY);
  ctx.lineTo(gaugeX + gaugeW + 4, lineY);
  ctx.stroke();

  // The alarm: rings spreading slowly from the speaker while the gas is over the line.
  ctx.strokeStyle = c.alarm;
  for (const grown of rings(time)) {
    ctx.globalAlpha = 0.85 * (1 - grown);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(speaker[0], speaker[1], speakerR + grown * unit * 0.32, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (on) {
    ctx.fillStyle = c.alarm;
    ctx.beginPath();
    ctx.arc(speaker[0], speaker[1], speakerR * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
}
