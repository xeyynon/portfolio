import {
  BLOCK,
  BLOCKED_STREET,
  CARS,
  END,
  FIRST_ROUTE,
  NEW_ROUTE,
  START,
  STREETS,
  along,
  carAt,
  partial,
  shown,
  type Point,
} from "./map";

/** The map's colours, read from the world's tokens by the component. */
export type MapColours = {
  night: string;
  street: string;
  car: string;
  route: string;
  blocked: string;
  ink: string;
};

type Frame = {
  width: number;
  height: number;
  stage: number;
  progress: number;
  /** Seconds the traffic has been moving. 0 holds everything still. */
  time: number;
  /** The same clock for the blocked road, which stops running while the block is there. */
  jamTime: number;
  colours: MapColours;
};

/**
 * Draws one frame of the map. Everything a step adds stays once it is there,
 * so the last step shows the whole story: the first route faded to dashes,
 * the block across it, and the new route round the block.
 */
export function drawMap(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, stage, progress, time, jamTime, colours: c } = frame;
  const px = (p: Point): [number, number] => [p[0] * w, p[1] * h];
  const unit = Math.min(w, h);
  const road = Math.max(6, unit * 0.032);
  const trace = (path: Point[]) => {
    ctx.beginPath();
    path.forEach((p, i) => (i ? ctx.lineTo(...px(p)) : ctx.moveTo(...px(p))));
    ctx.stroke();
  };
  const disc = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
  };

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.night;
  ctx.fillRect(0, 0, w, h);

  // The streets: the ones that carry traffic as bands, the lanes as hairlines.
  ctx.strokeStyle = c.street;
  ctx.lineCap = "butt";
  for (const street of STREETS) {
    ctx.lineWidth = street.minor ? 1.5 : road;
    trace([street.from, street.to]);
  }

  const first = shown(0, stage, progress);
  const block = shown(1, stage, progress);
  const redraw = shown(2, stage, progress);

  // 2. The blocked stretch, tinted under the traffic.
  if (block > 0) {
    ctx.strokeStyle = c.blocked;
    ctx.lineWidth = road;
    ctx.globalAlpha = 0.35 * block;
    trace(BLOCK);
    ctx.globalAlpha = 1;
  }

  // Traffic: each car keeps to its side of the street. The blocked road runs on its own stopped clock.
  ctx.fillStyle = c.car;
  ctx.globalAlpha = 0.85;
  for (const car of CARS) {
    const street = STREETS[car.street];
    const [x, y] = px(carAt(car, car.street === BLOCKED_STREET ? jamTime : time));
    const [fx, fy] = px(street.from);
    const [tx, ty] = px(street.to);
    const length = Math.hypot(tx - fx, ty - fy) || 1;
    const side = (car.speed > 0 ? 1 : -1) * road * 0.22;
    disc(x - ((ty - fy) / length) * side, y + ((tx - fx) / length) * side, Math.max(1.5, road * 0.14));
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 1. The first route. Once the new one is drawn it thins to a dashed trace of where it ran.
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const routeWidth = Math.max(3, unit * 0.014);
  if (first > 0) {
    ctx.strokeStyle = c.route;
    ctx.lineWidth = routeWidth - (routeWidth - 1.5) * redraw;
    ctx.globalAlpha = 1 - 0.45 * redraw;
    if (redraw > 0) ctx.setLineDash([5, 7]);
    trace(partial(FIRST_ROUTE, first));
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // 3. The new route, round the block.
  if (redraw > 0) {
    ctx.strokeStyle = c.route;
    ctx.lineWidth = routeWidth;
    trace(partial(NEW_ROUTE, redraw));
  }

  // 2 again, on top: a barrier at each end of the stretch and a crossed sign in the middle.
  if (block > 0) {
    const [ax, ay] = px(BLOCK[0]);
    const [bx] = px(BLOCK[1]);
    const mx = (ax + bx) / 2;
    const reach = road * 0.95 * block;
    const sign = road * 1.15 * block;
    const arm = sign * 0.5;
    ctx.globalAlpha = block;
    ctx.strokeStyle = c.blocked;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay - reach);
    ctx.lineTo(ax, ay + reach);
    ctx.moveTo(bx, ay - reach);
    ctx.lineTo(bx, ay + reach);
    ctx.stroke();
    ctx.fillStyle = c.night;
    disc(mx, ay, sign);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mx - arm, ay - arm);
    ctx.lineTo(mx + arm, ay + arm);
    ctx.moveTo(mx + arm, ay - arm);
    ctx.lineTo(mx - arm, ay + arm);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // The two ends of the trip: a ring where it starts, a diamond where it ends.
  const [sx, sy] = px(START);
  const [ex, ey] = px(END);
  const mark = Math.max(5, unit * 0.022);
  ctx.fillStyle = c.night;
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 2;
  disc(sx, sy, mark);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c.ink;
  ctx.beginPath();
  ctx.moveTo(ex, ey - mark * 1.3);
  ctx.lineTo(ex + mark * 1.3, ey);
  ctx.lineTo(ex, ey + mark * 1.3);
  ctx.lineTo(ex - mark * 1.3, ey);
  ctx.closePath();
  ctx.fill();

  // Someone following the new route, once it is whole. Left out when nothing moves.
  if (redraw >= 1 && time > 0) {
    const [x, y] = px(along(NEW_ROUTE, (time * 0.07) % 1));
    ctx.fillStyle = c.route;
    ctx.strokeStyle = c.night;
    ctx.lineWidth = 2;
    disc(x, y, routeWidth * 1.5);
    ctx.fill();
    ctx.stroke();
  }
}
