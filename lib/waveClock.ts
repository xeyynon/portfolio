/**
 * One clock for the six waves, shared by the two things that draw them: the
 * opening's scene (scene/sphere) and the quiet waves behind the sections
 * after it (AmbientWaves). The scene publishes its time every frame; whoever
 * draws the waves next reads it, carried forward by the real time since, so
 * the waves on both sides of the hand-off are at the same phase. When the
 * scene starts again after a pause it reads the clock back, so the hand-off
 * works in both directions.
 */

let base = 0;
let at = 0;

export function publishWaveTime(t: number): void {
  base = t;
  at = performance.now();
}

export function waveTimeNow(): number {
  return at ? base + (performance.now() - at) / 1000 : performance.now() / 1000;
}
