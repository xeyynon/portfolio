import { CARD, CARDS, LEAD, LINKED, MENTIONS, mentionAt, personAt, shown, staggered } from "./board";

/** The board's colours, read from the world's tokens by the component. */
export type BoardColours = {
  board: string;
  line: string;
  paper: string;
  ink: string;
  muted: string;
  link: string;
};

type Frame = {
  width: number;
  height: number;
  stage: number;
  progress: number;
  /** Seconds, for the slow pulse on the lead that never stops. 0 holds it still. */
  time: number;
  colours: BoardColours;
  font: string;
};

/**
 * Draws one frame of the evidence board. Everything a step adds stays once it
 * is there, so the last step shows the whole case: the reports, the people
 * named in them, which names are the same person, the graph that joins the
 * cases, and one lead drawn out with the reports it cites.
 */
export function drawBoard(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const { width: w, height: h, stage, progress, time, colours: c, font } = frame;
  const unit = Math.min(w, h);
  const cardW = CARD.w * unit;
  const cardH = CARD.h * unit;

  const reports = shown(0, stage, progress);
  const extract = shown(1, stage, progress);
  const resolve = shown(2, stage, progress);
  const graph = shown(3, stage, progress);
  const lead = shown(4, stage, progress);
  const pulse = time ? 0.5 + 0.5 * Math.sin(time * 2.2) : 1;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = c.board;
  ctx.fillRect(0, 0, w, h);

  // 1. Reports: each card is pinned up in turn. Its text is shown as lines, not words.
  CARDS.forEach((card, k) => {
    const on = staggered(reports, k, CARDS.length);
    if (on <= 0) return;
    const cited = (LEAD.cards as readonly number[]).includes(k);
    ctx.save();
    ctx.globalAlpha = on * (graph > 0 && !cited ? 1 - 0.35 * lead : 1);
    ctx.translate(card.at[0] * w, card.at[1] * h - (1 - on) * unit * 0.04);
    ctx.rotate(card.angle);
    ctx.fillStyle = c.paper;
    ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(-cardW / 2, -cardH / 2, cardW, cardH);

    // the report's number, and its lines of text
    ctx.fillStyle = c.muted;
    ctx.font = `500 ${Math.max(9, unit * 0.028)}px ${font}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`FIR ${k + 1}`, -cardW / 2 + cardW * 0.08, -cardH / 2 + cardH * 0.1);
    ctx.globalAlpha *= 0.35;
    for (let line = 0; line < 4; line++) {
      const y = -cardH / 2 + cardH * (0.42 + line * 0.15);
      const length = cardW * (0.84 - ((k + line) % 3) * 0.14);
      ctx.fillRect(-cardW / 2 + cardW * 0.08, y, length, Math.max(1.5, unit * 0.005));
    }
    ctx.restore();

    // A cited report is outlined, once the lead is drawn.
    if (cited && lead > 0) {
      ctx.save();
      ctx.translate(card.at[0] * w, card.at[1] * h);
      ctx.rotate(card.angle);
      ctx.globalAlpha = lead;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.5;
      const pad = unit * 0.012;
      ctx.strokeRect(-cardW / 2 - pad, -cardH / 2 - pad, cardW + pad * 2, cardH + pad * 2);
      ctx.restore();
    }

    // The pin at the top of the card.
    ctx.globalAlpha = on;
    ctx.fillStyle = c.muted;
    ctx.beginPath();
    ctx.arc(card.at[0] * w, card.at[1] * h - cardH / 2 + 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // 3. Resolution: names that are the same person are tied by a dashed line.
  if (resolve > 0) {
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.globalAlpha = 0.6 * resolve * (1 - 0.7 * graph);
    for (const person of LINKED) {
      const at = MENTIONS.map((m, i) => (m.person === person ? mentionAt(i, w, h) : null)).filter(
        (p): p is [number, number] => p !== null,
      );
      ctx.beginPath();
      at.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // 4. The case graph: each person becomes one node, strung to every report that names them.
  // 5. The lead: the strings that make it are drawn heavier and pulse.
  if (graph > 0) {
    LINKED.forEach((person, k) => {
      const on = staggered(graph, k, LINKED.length);
      if (on <= 0) return;
      const [nx, ny] = personAt(person, w, h);
      const inLead = (LEAD.people as readonly number[]).includes(person);
      ctx.strokeStyle = c.link;
      ctx.lineWidth = inLead ? 1.5 + 1.5 * lead : 1.5;
      ctx.globalAlpha = inLead ? 0.85 + 0.15 * lead * pulse : 0.85 - 0.45 * lead;
      MENTIONS.forEach((m, i) => {
        if (m.person !== person) return;
        const [mx, my] = mentionAt(i, w, h);
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nx + (mx - nx) * on, ny + (my - ny) * on);
        ctx.stroke();
      });
      ctx.fillStyle = c.board;
      ctx.beginPath();
      ctx.arc(nx, ny, unit * 0.022, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.link;
      ctx.beginPath();
      ctx.arc(nx, ny, unit * 0.009, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  // 2. Extraction: a mark on each card where a person is named. Drawn last, so the strings end under them.
  if (extract > 0) {
    MENTIONS.forEach((_, i) => {
      const on = staggered(extract, i, MENTIONS.length);
      if (on <= 0) return;
      const [x, y] = mentionAt(i, w, h);
      ctx.globalAlpha = on;
      ctx.fillStyle = c.paper;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, unit * (0.011 + 0.01 * (1 - on)), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }
}
