"use client";

import { useEffect, useRef } from "react";
import { drawMosaic, type MosaicColours } from "./draw";
import { COUNTS, INTRO_SECONDS, TILE_COUNT } from "./tiles";
import styles from "./kindofui.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the mosaic. One tiny tile for each of the library's live examples,
 * arriving one after another, each holding a little control that switches by
 * itself now and then. The picture is decoration for the words: what the
 * library holds is real text under it.
 *
 * With reduced motion nothing moves: every tile is there, held still.
 */
export default function Mosaic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: MosaicColours = {
      tile: token(canvas, "--tile"),
      line: token(canvas, "--tile-line"),
      on: token(canvas, "--switched"),
      off: token(canvas, "--glass-muted"),
    };

    let raf = 0;
    let last = 0;
    let time = 0;
    // The tiles arrive the first time the mosaic is seen.
    let intro = reduced ? 1 : 0;
    let started = reduced;
    let inView = true;
    let width = 0;
    let height = 0;

    const paint = () => drawMosaic(ctx, { width, height, time: reduced ? 0 : time, intro, colours });

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
      if (started) intro = Math.min(1, intro + dt / INTRO_SECONDS);
      paint();
      schedule();
    };
    const schedule = () => {
      if (raf || reduced || !inView || document.hidden) return;
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
        if (inView) started = true;
        wake();
      },
      { threshold: 0.35 },
    );
    view.observe(canvas);
    document.addEventListener("visibilitychange", wake);

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
    };
  }, []);

  return (
    <figure className={styles.mosaic}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <figcaption className={styles.caption}>
        <p className={styles.schematic}>
          {`${TILE_COUNT} tiles`}, one for each live example on the library&apos;s page. The tiles are drawn for this page:
          stand-ins, not the examples themselves.
        </p>
        <p className={styles.captionText}>
          Every entry is alive: hover it, click it, drag it, type into it. All {TILE_COUNT} sit on one page, and each
          has the same shape, so ten styles can be compared in the time one article takes.
        </p>
        <ul className={styles.counts}>
          {COUNTS.map((c) => (
            <li key={c.label}>
              <span className={styles.count}>{c.count}</span>
              <span className={styles.countLabel}>{c.label}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
