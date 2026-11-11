/**
 * The cut of the six stones, seen from above: a round brilliant, the cut the
 * stones in the gauntlet are given. An octagonal table in the middle, eight
 * star facets round it, eight bezel (kite) facets, and sixteen upper girdle
 * facets out to the rim. Pure: computed once, in a unit circle (radius 1),
 * with every number rounded so the server and the browser print the same.
 *
 * Each facet carries a `shade` from 0 (turned away from the light, toward the
 * stone's dark) to 1 (facing it, toward white). Light comes from the upper
 * left, as everywhere else on the site; neighbouring facets alternate a
 * little, which is what makes a cut stone sparkle rather than look smooth.
 */

export type Facet = { points: string; shade: number };

const r2 = (n: number) => Math.round(n * 1000) / 1000;
const at = (radius: number, angle: number) => ({ x: r2(radius * Math.cos(angle)), y: r2(radius * Math.sin(angle)) });
const pts = (...ps: { x: number; y: number }[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");

const TABLE = 0.46;
const STAR = 0.74;
const LIGHT = { x: -0.6, y: -0.8 }; // toward the light, upper left

function shadeOf(ps: { x: number; y: number }[], tilt: number, k: number): number {
  const cx = ps.reduce((s, p) => s + p.x, 0) / ps.length;
  const cy = ps.reduce((s, p) => s + p.y, 0) / ps.length;
  const len = Math.hypot(cx, cy) || 1;
  // A facet out at the rim leans outward; how much it faces the light depends on which way.
  const facing = (cx / len) * LIGHT.x + (cy / len) * LIGHT.y;
  const sparkle = k % 2 ? 0.1 : -0.06;
  return Math.round(Math.min(1, Math.max(0, 0.5 + facing * tilt + sparkle)) * 100) / 100;
}

function cut(): { table: string; facets: Facet[]; rim: string } {
  const n = 8;
  const step = (Math.PI * 2) / n;
  const a0 = -Math.PI / 2 + step / 2;
  const T = Array.from({ length: n }, (_, k) => at(TABLE, a0 + k * step));
  const S = Array.from({ length: n }, (_, k) => at(STAR, a0 + (k + 0.5) * step));
  const G = Array.from({ length: n }, (_, k) => at(1, a0 + k * step));
  const H = Array.from({ length: n }, (_, k) => at(1, a0 + (k + 0.5) * step));
  const facets: Facet[] = [];
  for (let k = 0; k < n; k++) {
    const next = (k + 1) % n;
    const prev = (k + n - 1) % n;
    const star = [T[k], T[next], S[k]];
    facets.push({ points: pts(...star), shade: shadeOf(star, 0.35, k) });
    const kite = [T[k], S[prev], G[k], S[k]];
    facets.push({ points: pts(...kite), shade: shadeOf(kite, 0.5, k + 1) });
    const upperA = [S[k], G[k], H[k]];
    const upperB = [S[k], H[k], G[next]];
    facets.push({ points: pts(...upperA), shade: shadeOf(upperA, 0.62, k) });
    facets.push({ points: pts(...upperB), shade: shadeOf(upperB, 0.62, k + 1) });
  }
  const rim = pts(...G.flatMap((g, k) => [g, H[k]]));
  return { table: pts(...T), facets, rim };
}

export const GEM_CUT = cut();

/**
 * The colour of a facet at `shade`, from the stone's own colour (in
 * `--gem-color`): toward white above the middle, toward the page's dark below.
 */
export function facetFill(shade: number): string {
  if (shade >= 0.5) {
    const toWhite = Math.round((shade - 0.5) * 2 * 42);
    return `color-mix(in srgb, var(--gem-color) ${100 - toWhite}%, var(--ink-hi))`;
  }
  const toDark = Math.round((0.5 - shade) * 2 * 62);
  return `color-mix(in srgb, var(--gem-color) ${100 - toDark}%, var(--bg-dark))`;
}
