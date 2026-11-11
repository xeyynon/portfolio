"use client";

import { useEffect, useRef, useState } from "react";
import { STAGES, STILL_TIME, WORD } from "./beam";
import { drawBench, type BenchColours } from "./draw";
import styles from "./lifi.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the Li-Fi bench. A laser on the left keys a word onto its beam,
 * the bits cross the picture as stretches of light, and a solar panel on the
 * right hands them to the decoder. Two traces underneath show what was keyed
 * and what came out. The picture is decoration for the words: the four steps
 * of the link are real text under it.
 *
 * It runs while it is on screen and the tab is in front, and can be paused.
 * With reduced motion nothing moves: one still frame with every part full.
 */
export default function LifiBench() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  // What the drawing loop reads. Kept in a ref so a frame never waits on a render.
  const live = useRef({ paused: false });
  const bench = useRef<{ wake(): void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: BenchColours = {
      bench: token(canvas, "--bench"),
      line: token(canvas, "--bench-line"),
      ink: token(canvas, "--ink-hi"),
      muted: token(canvas, "--glass-muted"),
      beam: token(canvas, "--beam"),
      recovered: token(canvas, "--recovered"),
    };

    let raf = 0;
    let last = 0;
    // It opens part-way through the word, so the first thing seen is not an empty beam.
    let time = STILL_TIME;
    let inView = false;
    let width = 0;
    let height = 0;

    const paint = () => drawBench(ctx, { width, height, time: reduced ? STILL_TIME : time, colours });

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
    bench.current = { wake };

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
      bench.current = null;
    };
  }, []);

  const toggle = () => {
    live.current.paused = !live.current.paused;
    setPaused(live.current.paused);
    bench.current?.wake();
  };

  return (
    <figure className={styles.figure}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <figcaption className={styles.caption}>
        <p className={styles.schematic}>
          A drawing of on-off keying, slowed down until single bits can be seen. It is not a recording of the link, and
          the real timing is not shown.
        </p>

        <p className={styles.controls}>
          <button type="button" className={styles.toggle} onClick={toggle}>
            {paused ? "Play" : "Pause"}
          </button>
        </p>

        <ul className={styles.legend}>
          <li>
            <span className={styles.key} data-key="beam" aria-hidden="true" />
            <span>
              Red, on the beam and in the upper trace: the laser is on, which is a 1. A gap is the laser off, a 0. The
              bits spell “{WORD}”, eight to a character, on repeat.
            </span>
          </li>
          <li>
            <span className={styles.key} data-key="recovered" aria-hidden="true" />
            <span>
              Green, in the lower trace: what the solar panel and its amplifier hand on. Under it is one mark for each
              bit read: filled for a 1, hollow for a 0.
            </span>
          </li>
        </ul>

        <ol className={styles.steps}>
          {STAGES.map((s, i) => (
            <li key={s.key} className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true">
                {i + 1}
              </span>
              <div className={styles.stepBody}>
                <span className={styles.stepName}>{s.label}</span>
                <p className={styles.stepText}>{s.caption}</p>
              </div>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
