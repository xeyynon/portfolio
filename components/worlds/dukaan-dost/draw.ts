import { barAt, barCount } from "./call";

/** The waveform's colours, read from the world's tokens by the component. */
export type WaveColours = {
  line: string;
  caller: string;
  agent: string;
  quiet: string;
};

type Frame = {
  width: number;
  height: number;
  stage: number;
  progress: number;
  /** Seconds, for the voice's own movement. 0 holds it still. */
  time: number;
  colours: WaveColours;
};

const PITCH = 7; // px from one bar to the next
const BAR = 4;

/**
 * Draws one frame of the call's waveform: a row of bars, tall where someone is
 * speaking and a dot where the line is quiet. Who is speaking is the bar's
 * colour here and a word in the caption under it.
 */
export function drawWave(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, stage, progress, time, colours: c } = frame;
  const n = barCount(w, PITCH);
  const left = (w - n * PITCH + (PITCH - BAR)) / 2;
  const mid = h / 2;

  ctx.clearRect(0, 0, w, h);

  // The line itself.
  ctx.fillStyle = c.line;
  ctx.fillRect(0, mid - 0.5, w, 1);

  for (let i = 0; i < n; i++) {
    const bar = barAt(i, n, stage, progress, time);
    const tall = Math.max(BAR, bar.level * h * 0.84);
    ctx.fillStyle = bar.voice === "caller" ? c.caller : bar.voice === "agent" ? c.agent : c.quiet;
    ctx.globalAlpha = bar.level > 0 ? 1 : bar.voice === "quiet" ? 1 : 0.55;
    ctx.beginPath();
    ctx.roundRect(left + i * PITCH, mid - tall / 2, BAR, tall, BAR / 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Speech to text: the reading head.
  if (stage === 1 && progress > 0 && progress < 1) {
    ctx.fillStyle = c.agent;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(left + progress * n * PITCH - 1, h * 0.08, 1.5, h * 0.84);
    ctx.globalAlpha = 1;
  }
}
