"use client";

import { useEffect, useRef, useState } from "react";
import { STILL_TIME, alarmOn } from "./plume";
import { drawFloor, type FloorColours } from "./draw";
import styles from "./ecox.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the EcoX floor at night. Gas rises off the machines toward the
 * alarm line; once it is over the line the device's speaker rings, and when
 * it falls back the ringing stops. The picture is decoration for the words:
 * what is shown, and whether the alarm is sounding, is real text under it.
 *
 * It runs while it is on screen and the tab is in front, and can be paused.
 * With reduced motion nothing moves: one still frame, gas over the line, alarm on.
 */
export default function EcoxFloor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [ringing, setRinging] = useState(alarmOn(STILL_TIME));
  // What the drawing loop reads. Kept in a ref so a frame never waits on a render.
  const live = useRef({ paused: false });
  const floor = useRef<{ wake(): void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: FloorColours = {
      floor: token(canvas, "--floor"),
      line: token(canvas, "--floor-line"),
      ink: token(canvas, "--ink-hi"),
      muted: token(canvas, "--glass-muted"),
      gas: token(canvas, "--gas"),
      alarm: token(canvas, "--alarm"),
    };

    let raf = 0;
    let last = 0;
    let time = 0;
    let ringingNow = alarmOn(STILL_TIME);
    let inView = false;
    let width = 0;
    let height = 0;

    const paint = () => drawFloor(ctx, { width, height, time: reduced ? STILL_TIME : time, colours });

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint();
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      time += dt;
      // The words under the picture follow the alarm, and only re-render when it changes.
      const on = alarmOn(time);
      if (on !== ringingNow) {
        ringingNow = on;
        setRinging(on);
      }
      paint();
      schedule();
    };
    const schedule = () => {
      if (raf || reduced || !inView || document.hidden || live.current.paused) return;
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      last = 0;
      schedule();
    };

    const sizes = new ResizeObserver(resize);
    sizes.observe(canvas);
    const view = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        wake();
      },
      { threshold: 0.2 },
    );
    view.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    floor.current = { wake };

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
      floor.current = null;
    };
  }, []);

  const toggle = () => {
    live.current.paused = !live.current.paused;
    setPaused(live.current.paused);
    floor.current?.wake();
  };

  return (
    <figure className={styles.figure}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <figcaption className={styles.caption}>
        <p className={styles.schematic}>
          A drawing of the idea. The gas, its level and the alarm line are made up: no reading or alarm level is shown.
        </p>

        <div className={styles.readout}>
          <span className={styles.state} data-on={ringing}>
            {ringing ? "Over the line: alarm sounding" : "Under the line: quiet"}
          </span>
          <button type="button" className={styles.toggle} onClick={toggle}>
            {paused ? "Play" : "Pause"}
          </button>
        </div>

        <ul className={styles.legend}>
          <li>
            <span className={styles.key} data-key="gas" aria-hidden="true" />
            <span>
              Blue: carbon monoxide (CO) rising off the machines, and its level on the gauge beside the device.
            </span>
          </li>
          <li>
            <span className={styles.key} data-key="alarm" aria-hidden="true" />
            <span>
              Red, dashed: the alarm line. When the gas is over it, the device on the right sounds its speaker alarm,
              drawn as rings spreading from it.
            </span>
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
