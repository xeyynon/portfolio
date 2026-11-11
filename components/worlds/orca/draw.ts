import {
  CATALOG,
  PAIR_PATHS,
  distance,
  grid,
  hidden,
  nearPairs,
  pairAngle,
  pairPlace,
  place,
  shown,
  tierOf,
  type Vec,
} from "./orbit";

/** The sky's colours, read from the world's tokens by the component. */
export type SkyColours = {
  space: string;
  line: string;
  globe: string;
  ink: string;
  object: string;
  approach: string;
};

type Frame = {
  width: number;
  height: number;
  stage: number;
  progress: number;
  /** Seconds, for the orbits that never stop. 0 holds the sky still. */
  time: number;
  /** Seconds into the refinement step, which places the two objects the picture follows. */
  pairClock: number;
  colours: SkyColours;
};

/**
 * Draws one frame of the sky. Everything a step adds stays once it is there,
 * so the last step shows the whole screening: the catalog round the globe,
 * the candidate pairs linked, the two objects that are followed to their
 * closest approach, and the links weighted by tier.
 */
export function drawSky(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, stage, progress, time, pairClock, colours: c } = frame;
  const radius = Math.min(w, h) * 0.21;
  const cx = w / 2;
  const cy = h / 2;
  const px = (v: Vec): [number, number] => [cx + v[0] * radius, cy - v[1] * radius];

  const catalog = shown(0, stage, progress);
  const search = shown(1, stage, progress);
  const refine = shown(2, stage, progress);
  const tiers = shown(3, stage, progress);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.space;
  ctx.fillRect(0, 0, w, h);

  // The globe: a disc, the grid on its near side, and its rim.
  ctx.fillStyle = c.globe;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const line of grid(time * 0.05)) {
    let pen = false;
    for (const p of line) {
      if (p[2] < 0) {
        pen = false;
        continue;
      }
      const [x, y] = px(p);
      if (pen) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
      pen = true;
    }
  }
  ctx.stroke();
  ctx.strokeStyle = c.ink;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 1. The catalog: every object on its orbit.
  const count = Math.ceil(CATALOG.length * catalog);
  const places = CATALOG.slice(0, count).map((body) => place(body, time));

  // 2. The search: pairs that are close enough become candidates, and are linked.
  const pairs = search > 0 ? nearPairs(places) : [];
  const candidate = new Set<number>();
  for (const [i, j] of pairs) {
    candidate.add(i);
    candidate.add(j);
  }

  // 4. The tiers: a candidate's link is drawn heavier the higher its tier.
  ctx.strokeStyle = c.approach;
  for (const [i, j] of pairs) {
    const tier = tierOf(i, j);
    ctx.lineWidth = 1 + tier * 0.55 * tiers;
    ctx.globalAlpha = search * (0.75 - (0.4 - tier * 0.1) * tiers);
    ctx.beginPath();
    ctx.moveTo(...px(places[i]));
    ctx.lineTo(...px(places[j]));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = c.object;
  places.forEach((p, i) => {
    if (hidden(p)) return;
    const far = p[2] < 0 ? 0.55 : 1;
    ctx.globalAlpha = far * (candidate.has(i) ? 1 : 1 - 0.6 * search);
    const [x, y] = px(p);
    ctx.beginPath();
    ctx.arc(x, y, candidate.has(i) ? 1.9 : 1.4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // 3. The refinement: two objects followed along their orbits to their closest approach.
  if (refine > 0) {
    ctx.strokeStyle = c.approach;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45 * refine;
    for (const path of PAIR_PATHS) {
      ctx.beginPath();
      let pen = false;
      for (const p of path) {
        if (hidden(p)) {
          pen = false;
          continue;
        }
        const [x, y] = px(p);
        if (pen) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
        pen = true;
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const angle = pairAngle(pairClock);
    const a = pairPlace(0, angle);
    const b = pairPlace(1, angle);
    const seen = !hidden(a) && !hidden(b);
    const gap = distance(a, b);
    const [ax, ay] = px(a);
    const [bx, by] = px(b);

    // The gap between them: a line, and a ring that tightens as it shrinks.
    if (seen && gap < 2.2) {
      const near = 1 - gap / 2.2;
      ctx.globalAlpha = refine * (0.35 + 0.65 * near);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = c.approach;
      ctx.lineWidth = 1 + near;
      ctx.beginPath();
      ctx.arc((ax + bx) / 2, (ay + by) / 2, (gap * radius) / 2 + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = refine;
    for (const [x, y, v] of [
      [ax, ay, a],
      [bx, by, b],
    ] as const) {
      if (hidden(v)) continue;
      ctx.fillStyle = c.space;
      ctx.strokeStyle = c.approach;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.approach;
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
