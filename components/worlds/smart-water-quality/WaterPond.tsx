"use client";

import { useEffect, useRef, useState } from "react";
import { drawPond, type PondColours } from "./draw";
import { INTERVAL_SECONDS, READINGS, STILL_TIME } from "./pond";
import styles from "./water.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the water node's pond. Still water and one buoy; a ripple leaves
 * it every 3 s, in real time, which is the interval the node reports at. Each
 * ripple is three rings, one for each reading. The picture is decoration for
 * the words: what the rings are is real text under it, and the ripples can be
 * paused.
 *
 * With reduced motion nothing moves: the pond shows one moment, with three
 * ripples already on the water.
 */
export default function WaterPond() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  // Read by the drawing loop. Kept in a ref so a frame never waits on a render.
  const live = useRef({ paused: false });
  const pond = useRef<{ wake(): void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: PondColours = {
      water: token(canvas, "--water"),
      line: token(canvas, "--water-line"),
      ink: token(canvas, "--ink-hi"),
      signal: token(canvas, "--signal"),
      node: token(canvas, "--node"),
    };

    let raf = 0;
    let last = 0;
    // The clock starts part-way in, so there are ripples on the water from the first frame.
    let time = STILL_TIME;
    let inView = true;
    let width = 0;
    let height = 0;

    const paint = () => drawPond(ctx, { width, height, time, still: reduced, colours });

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
      time += last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
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
    pond.current = { wake };

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
      pond.current = null;
    };
  }, []);

  const togglePause = () => {
    live.current.paused = !live.current.paused;
    setPaused(live.current.paused);
    pond.current?.wake();
  };

  return (
    <figure className={styles.figure}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <figcaption className={styles.caption}>
        <p className={styles.note}>
          A drawing, not the device: the node is shown as a buoy for the picture. No reading values are shown.
        </p>

        <p className={styles.lead}>
          A ripple leaves the node every {INTERVAL_SECONDS} s, the interval at which it sends its readings over 433 MHz
          LoRa. Each ripple is three rings, one for each reading.
        </p>

        <ul className={styles.legend}>
          {READINGS.map((reading) => (
            <li key={reading.key}>
              <svg className={styles.ring} viewBox="0 0 36 8" aria-hidden="true" focusable="false">
                <line x1="1" y1="4" x2="35" y2="4" data-reading={reading.key} />
              </svg>
              {reading.line}: {reading.label}
            </li>
          ))}
        </ul>

        <p className={styles.motionOnly}>
          <button type="button" className={styles.button} onClick={togglePause}>
            {paused ? "Resume ripples" : "Pause ripples"}
          </button>
        </p>
      </figcaption>
    </figure>
  );
}
