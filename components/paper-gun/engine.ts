import { createSlipEl, SLIP_SIZE, type SlipKind } from "./slips";

/** One spot in the tray, owned by the first slip of its kind. */
type Place = {
  kind: SlipKind;
  el: HTMLButtonElement;
  placed: boolean;
  /** Centre and scale in stage coordinates, refreshed by layout(). */
  x: number;
  y: number;
  s: number;
};

type Slip = {
  el: HTMLButtonElement;
  kind: SlipKind;
  place: Place;
  /** A repeat of a kind already in the tray: lands on its twin and fades. */
  twin: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  rx: number;
  s: number;
  age: number;
  flight: number;
  phase: number;
  state: "fly" | "glide" | "done";
  g?: { x: number; y: number; rot: number; rx: number; s: number; t: number };
};

export type EngineOptions = {
  stage: HTMLElement;
  layer: HTMLElement;
  tray: HTMLElement;
  slot: Element;
  recoil: HTMLElement;
  bigs: SlipKind[];
  tags: SlipKind[];
  reduced: boolean;
  /** The lit stripe (scaled 0..1 by charge) and the glow behind the gun. */
  charge: SVGGElement;
  glow: HTMLElement;
  /** Called once, the first time the gun reaches full charge. */
  onFullCharge: () => void;
  /** Called on every shot (the prism flares). */
  onShot: () => void;
  onCount: (n: number) => void;
  onSelect: (kind: SlipKind | null, el: HTMLButtonElement | null) => void;
};

const GAP = 10;

// CHARGE — owner, 2026-11-09: the prism's light charges the gun, then it
// fires. While the section is in view (the prism faces the gun) the stripe
// fills over CHARGE_MS; each shot draws SHOT_COST from it and the prism
// refills it, so a long hold visibly drains the meter. Never blocks a shot.
const CHARGE_MS = 1400;
const DRAIN_MS = 700;
const SHOT_COST = 0.06;
const CHARGE_FLOOR = 0.12;

/**
 * The paper-gun physics, kept out of React. Slips are moved with transforms
 * only (rules.md, CSS), one rAF loop that stops when nothing is moving.
 * Numbers follow the brief: gravity 0.28, drag 0.975, fall capped at 5,
 * a 1.4px flutter, a ±55° rotateX flip, 0.7 to 1.1 s of flight, then a
 * 0.7 s ease-out glide into the tray.
 */
export class PaperGunEngine {
  private o: EngineOptions;
  private places: Place[] = [];
  private slips: Slip[] = [];
  private raf = 0;
  private last = 0;
  private shots = 0;
  private holdTimer: number | null = null;
  private holdEl: HTMLElement | null = null;
  private timers: number[] = [];
  private active: HTMLButtonElement | null = null;
  private aimed = false;
  private charge = 0;
  private charged = false;

  constructor(o: EngineOptions) {
    this.o = o;
    this.paintCharge();
  }

  /** The prism is facing the gun (section in view) or not. */
  setAimed(on: boolean) {
    this.aimed = on;
    if (this.o.reduced) {
      this.charge = on ? 1 : 0;
      this.paintCharge();
      if (on) this.fullCharge();
      return;
    }
    this.ensureLoop();
  }

  private fullCharge() {
    if (this.charged) return;
    this.charged = true;
    this.o.onFullCharge();
  }

  private paintCharge() {
    this.o.charge.style.transform = `scaleX(${this.charge.toFixed(3)})`;
    this.o.glow.style.opacity = (this.charge * 0.6).toFixed(3);
  }

  private get charging() {
    return this.aimed ? this.charge < 1 : this.charge > 0;
  }

  private get rate() {
    return this.o.reduced ? 260 : 85;
  }

  private get narrow() {
    return this.o.stage.clientWidth < 700;
  }

  /* ---------- firing ---------- */

  private pick(): SlipKind {
    // Every fourth shot is a tag. Kinds not yet in the tray come first, so
    // one burst shows the whole body of work; after that, repeats.
    const pool = this.shots % 4 === 0 ? this.o.tags : this.o.bigs;
    const unseen = pool.find((k) => !this.places.some((p) => p.kind.id === k.id));
    return unseen ?? pool[Math.floor(Math.random() * pool.length)];
  }

  private slotPoint() {
    const sr = this.o.stage.getBoundingClientRect();
    const r = this.o.slot.getBoundingClientRect();
    return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top };
  }

  fire(kind?: SlipKind) {
    this.shots += 1;
    const k = kind ?? this.pick();
    this.o.onCount(this.shots);

    let place = this.places.find((p) => p.kind.id === k.id);
    const twin = Boolean(place);
    const el = createSlipEl(k);
    if (!place) {
      place = { kind: k, el, placed: false, x: 0, y: 0, s: 1 };
      this.places.push(place);
      el.addEventListener("click", () => {
        if (!place!.placed) return;
        this.setActive(el);
        this.o.onSelect(k, el);
      });
      this.layout();
    } else {
      el.classList.add("is-twin");
    }
    this.o.layer.appendChild(el);

    const o = this.slotPoint();
    const reduced = this.o.reduced;
    // Left and slightly down from the slot (150° to 190°, y pointing down).
    // On a phone the gun sits above the tray, so the arc turns downward.
    const deg = this.narrow ? 105 + Math.random() * 45 : 150 + Math.random() * 40;
    const a = (deg * Math.PI) / 180;
    const speed = reduced ? 4 : 9 + Math.random() * 7;
    const slip: Slip = {
      el,
      kind: k,
      place,
      twin,
      x: o.x,
      y: o.y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      rot: -16 + (Math.random() - 0.5) * 30,
      vr: reduced ? 0 : (Math.random() - 0.5) * 9,
      rx: 0,
      s: this.narrow ? 0.72 : 1,
      age: 0,
      flight: reduced ? 140 : 700 + Math.random() * 400,
      phase: Math.random() * Math.PI * 2,
      state: "fly",
    };
    this.slips.push(slip);
    this.draw(slip);
    this.kick();
    // Under reduced motion nothing animates the refill, so the meter just
    // stays where the aim left it.
    if (!reduced) {
      this.charge = Math.max(CHARGE_FLOOR, this.charge - SHOT_COST);
      this.paintCharge();
    }
    this.o.onShot();
    this.ensureLoop();
  }

  /** Fire a list of shots `gap` ms apart; undefined entries auto-pick. */
  burst(list: (SlipKind | undefined)[], gap: number, delay = 0) {
    const step = this.o.reduced ? Math.max(gap, 220) : gap;
    list.forEach((k, i) => {
      this.timers.push(window.setTimeout(() => this.fire(k), delay + i * step));
    });
  }

  /** One shot, unless a hold is already firing. For assistive-tech clicks. */
  fireOnce() {
    if (this.holdTimer === null) this.fire();
  }

  startHold(el: HTMLElement) {
    if (this.holdTimer !== null) return;
    this.holdEl = el;
    el.classList.add("is-pressed");
    this.o.stage.classList.add("is-firing");
    this.fire();
    this.holdTimer = window.setInterval(() => this.fire(), this.rate);
  }

  stopHold() {
    if (this.holdTimer !== null) window.clearInterval(this.holdTimer);
    this.holdTimer = null;
    this.holdEl?.classList.remove("is-pressed");
    this.holdEl = null;
    this.o.stage.classList.remove("is-firing");
  }

  /** Recoil: the gun kicks back along its barrel and springs forward. */
  private kick() {
    const d = this.o.reduced ? 4 : 14;
    this.o.recoil.animate(
      [{ transform: `translateX(${d}px)` }, { transform: "translateX(0)" }],
      { duration: 260, easing: "cubic-bezier(.25,1.7,.5,1)" }
    );
    if (this.holdTimer === null) {
      // A single shot still pulls the trigger, briefly.
      const stage = this.o.stage;
      stage.classList.add("is-firing");
      this.timers.push(window.setTimeout(() => {
        if (this.holdTimer === null) stage.classList.remove("is-firing");
      }, 140));
    }
  }

  /* ---------- the loop ---------- */

  private ensureLoop() {
    if (this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    const dt = Math.min(now - this.last, 50);
    this.last = now;
    const f = dt / 16.667;
    const reduced = this.o.reduced;
    const glideMs = reduced ? 320 : 700;

    if (this.charging) {
      this.charge = this.aimed
        ? Math.min(1, this.charge + dt / CHARGE_MS)
        : Math.max(0, this.charge - dt / DRAIN_MS);
      this.paintCharge();
      if (this.charge >= 1) this.fullCharge();
    }

    for (const s of this.slips) {
      s.age += dt;
      if (s.state === "fly") {
        s.vy = Math.min(s.vy + 0.28 * f, 5);
        s.vx *= Math.pow(0.975, f);
        s.x += s.vx * f;
        s.y += s.vy * f;
        if (!reduced) {
          s.x += Math.sin(s.age / 90 + s.phase) * 1.4 * f;
          s.rot += s.vr * f * 0.5;
          s.rx = Math.sin(s.age / 110 + s.phase) * 55;
        }
        if (s.age >= s.flight) {
          const rot = ((((s.rot + 180) % 360) + 360) % 360) - 180;
          s.state = "glide";
          s.g = { x: s.x, y: s.y, rot, rx: s.rx, s: s.s, t: 0 };
        }
      } else if (s.state === "glide" && s.g) {
        s.g.t += dt;
        const t = Math.min(s.g.t / glideMs, 1);
        const e = 1 - Math.pow(1 - t, 3);
        const p = s.place;
        s.x = s.g.x + (p.x - s.g.x) * e;
        s.y = s.g.y + (p.y - s.g.y) * e;
        s.rot = s.g.rot * (1 - e);
        s.rx = s.g.rx * (1 - e);
        s.s = s.g.s + (p.s - s.g.s) * e;
        if (t >= 1) this.land(s);
      }
      if (s.state !== "done") this.draw(s);
    }
    this.slips = this.slips.filter((s) => s.state !== "done");
    this.raf = this.slips.length || this.charging ? requestAnimationFrame(this.tick) : 0;
  };

  private land(s: Slip) {
    s.state = "done";
    if (s.twin) {
      const fade = s.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease-out", fill: "forwards" });
      fade.onfinish = () => s.el.remove();
      const home = s.place;
      if (home.placed && !this.o.reduced) {
        home.el.animate(
          [{ translate: "0 0" }, { translate: "0 -8px" }, { translate: "0 0" }],
          { duration: 320, easing: "cubic-bezier(.3,1.6,.5,1)" }
        );
      }
      return;
    }
    s.place.placed = true;
    s.el.classList.add("is-placed");
    s.el.tabIndex = 0;
    s.el.removeAttribute("aria-hidden");
    this.put(s.el, s.kind, s.place.x, s.place.y, 0, 0, s.place.s);
  }

  private draw(s: Slip) {
    this.put(s.el, s.kind, s.x, s.y, s.rot, s.rx, s.s);
  }

  private put(el: HTMLElement, k: SlipKind, x: number, y: number, rot: number, rx: number, sc: number) {
    const { w, h } = SLIP_SIZE[k.size];
    el.style.transform =
      `translate3d(${(x - w / 2).toFixed(1)}px,${(y - h / 2).toFixed(1)}px,0) ` +
      `perspective(700px) rotate(${rot.toFixed(1)}deg) rotateX(${rx.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
  }

  /* ---------- the tray ---------- */

  /**
   * Flows the tray left to right in arrival order, one row height for all,
   * and reserves the height the whole set will need so the page below does
   * not jump as slips arrive. Called on every new kind and on resize.
   */
  layout() {
    const { stage, tray } = this.o;
    const sr = stage.getBoundingClientRect();
    const tr = tray.getBoundingClientRect();
    const width = tr.width;
    // Sized so whole project slips fit a row (3 on desktop, 2 on phones),
    // capped at 66px: taller than the brief's 58px so a slip's small print
    // stays near 9px or above once scaled (rules.md, readable sizes).
    const perRow = width >= 480 ? 3 : 2;
    const fitH = ((width - (perRow - 1) * GAP) / perRow) * (SLIP_SIZE.big.h / SLIP_SIZE.big.w);
    const rowH = Math.min(66, Math.floor(fitH * 10) / 10);

    const flow = (kinds: SlipKind[], each?: (i: number, cx: number, cy: number, s: number) => void) => {
      let x = 0;
      let y = 0;
      kinds.forEach((k, i) => {
        const d = SLIP_SIZE[k.size];
        const s = rowH / d.h;
        const w = d.w * s;
        if (x > 0 && x + w > width) {
          x = 0;
          y += rowH + GAP;
        }
        each?.(i, x + w / 2, y + rowH / 2, s);
        x += w + GAP;
      });
      return kinds.length ? y + rowH : 0;
    };

    const reserve = flow([...this.o.bigs, ...this.o.tags]);
    const used = flow(this.places.map((p) => p.kind), (i, cx, cy, s) => {
      const p = this.places[i];
      p.x = tr.left - sr.left + cx;
      p.y = tr.top - sr.top + cy;
      p.s = s;
    });
    tray.style.height = `${Math.max(reserve, used)}px`;

    for (const p of this.places) {
      if (p.placed) this.put(p.el, p.kind, p.x, p.y, 0, 0, p.s);
    }
  }

  setActive(el: HTMLButtonElement | null) {
    this.active?.classList.remove("is-active");
    this.active = el;
    el?.classList.add("is-active");
  }

  /** Fade every slip out and empty the tray. */
  cleanup() {
    this.stopHold();
    this.clearTimers();
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    const els = new Set<HTMLElement>([...this.places.map((p) => p.el), ...this.slips.map((s) => s.el)]);
    els.forEach((el) => {
      el.classList.remove("is-placed");
      el.tabIndex = -1;
      el.setAttribute("aria-hidden", "true");
      const a = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "ease-out", fill: "forwards" });
      a.onfinish = () => el.remove();
    });
    this.places = [];
    this.slips = [];
    this.shots = 0;
    this.active = null;
    this.o.onCount(0);
    this.o.onSelect(null, null);
    this.layout();
    if (this.charging) this.ensureLoop();
  }

  private clearTimers() {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
  }

  destroy() {
    this.stopHold();
    this.clearTimers();
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.o.layer.replaceChildren();
    this.places = [];
    this.slips = [];
  }
}
