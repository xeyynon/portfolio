"use client";

import { useEffect, useRef, useState } from "react";
import { DUST_END, discGrains, drawDust, textGrains, toGrains, type Grain } from "./dust";
import styles from "./WorkWeb.module.css";

/** When each part of the snap happens, in milliseconds from the press. */
const AT = { snap: 600, dust: 860, gone: 2900, back: 4300, home: 6200 };
/** How long the dust takes to gather back. */
const RETURN_MS = 1600;

/**
 * The snap. One press: the six stones flare, the thumb flicks against the
 * middle finger, a flash and a ring break from the hand, and half the
 * projects, chosen at random, crumble to dust from one end and drift off.
 * A beat later the same dust runs backward and every name comes back. Nothing
 * is removed: the links are only hidden while they are dust.
 *
 * It drives the web by attributes: `data-phase` on the stage for the hand and
 * stones (WorkWeb.module.css), `data-gone` on the projects that crumble. With
 * reduced motion there is no dust, no flick and no flash: the stones light,
 * half the names fade, and fade back.
 */
export default function Snap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timers = useRef<number[]>([]);
  const frame = useRef(0);
  const busy = useRef(false);
  const [status, setStatus] = useState("");

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  const snap = () => {
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    const svg = stage?.querySelector("svg");
    if (busy.current || !canvas || !stage || !svg) return;
    busy.current = true;
    setStatus("");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const phase = (p: string) => (stage.dataset.phase = p);

    // Half of them, at random.
    const all = [...svg.querySelectorAll<SVGGElement>("[data-project]")];
    const gone = all
      .map((g) => ({ g, k: Math.random() }))
      .sort((a, b) => a.k - b.k)
      .slice(0, Math.floor(all.length / 2))
      .map((x) => x.g);

    // The canvas over the web, sharp on this screen.
    const box = stage.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);
    const ctx = canvas.getContext("2d");
    const ink = getComputedStyle(stage).getPropertyValue("--ink-hi").trim();

    let grains: Grain[] = [];
    const run = (from: number, to: number, ms: number, done: () => void) => {
      if (!ctx) return done();
      const start = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - start) / ms);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, box.width, box.height);
        drawDust(ctx, grains, from + (to - from) * k, ink);
        if (k < 1) frame.current = requestAnimationFrame(tick);
        else done();
      };
      frame.current = requestAnimationFrame(tick);
    };
    const clear = () => ctx?.clearRect(0, 0, canvas.width, canvas.height);

    phase("charge");
    later(AT.snap, () => phase("snap"));
    later(AT.dust, () => {
      phase("dust");
      if (!reduced) {
        // Read the names off the page before they are hidden.
        const points = gone.flatMap((g) => {
          const text = g.querySelector("text");
          const dot = g.querySelector("circle");
          const out: { x: number; y: number }[] = [];
          if (text) {
            const r = text.getBoundingClientRect();
            const cs = getComputedStyle(text);
            const font = `${cs.fontWeight} ${r.height * 0.78}px ${cs.fontFamily}`;
            out.push(
              ...textGrains(
                text.textContent ?? "",
                font,
                { left: r.left - box.left, top: r.top - box.top, width: r.width, height: r.height },
                ink,
              ),
            );
          }
          if (dot) {
            const r = dot.getBoundingClientRect();
            out.push(...discGrains(r.left - box.left + r.width / 2, r.top - box.top + r.height / 2, r.width / 2));
          }
          return out;
        });
        grains = toGrains(points);
        run(0, DUST_END, DUST_END * 1000, clear);
      }
      gone.forEach((g) => (g.dataset.gone = "true"));
    });
    later(AT.gone, () => {
      phase("gone");
      setStatus(`${gone.length} of ${all.length}, gone.`);
    });
    later(AT.back, () => {
      phase("return");
      const home = () => {
        gone.forEach((g) => delete g.dataset.gone);
        later(300, clear);
      };
      if (reduced || !grains.length) home();
      else run(DUST_END, 0, RETURN_MS, home);
    });
    later(AT.home, () => {
      phase("idle");
      setStatus("And back, every one.");
      busy.current = false;
    });
  };

  return (
    <>
      <canvas ref={canvasRef} className={styles.dust} aria-hidden="true" />
      <div className={styles.snapBar}>
        <p className={styles.snapStatus} role="status">
          {status}
        </p>
        <button type="button" className={styles.snapButton} onClick={snap} title="Half of them go, then come back">
          Snap
        </button>
      </div>
    </>
  );
}
