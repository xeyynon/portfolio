"use client";

import { useEffect, useRef, useState } from "react";
import { COL_SECONDS, MODES, MOVING, STILL_TIME, STRIP_COLS, fullStrip, stripColumn } from "./room";
import { drawRoom, type RoomColours } from "./draw";
import styles from "./csi.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the CSI-Sense room. Wi-Fi wavefronts cross a room from a router
 * to four receivers, bending round whoever stands in the way, and a strip
 * under the room builds up a column at a time. Three buttons choose who is in
 * the room. The picture is decoration for the words: what each choice shows
 * is real text under it.
 *
 * It runs while it is on screen and the tab is in front, and can be paused.
 * With reduced motion nothing moves: the room is still and the strip is full.
 */
export default function CsiRoom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<number>(MOVING);
  const [paused, setPaused] = useState(false);
  // What the drawing loop reads. Kept in a ref so a frame never waits on a render.
  const live = useRef<{ mode: number; paused: boolean; strip: number[][] }>({ mode: MOVING, paused: false, strip: [] });
  // The drawing loop's handles, for the buttons.
  const room = useRef<{ paint(): void; wake(): void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: RoomColours = {
      room: token(canvas, "--room"),
      line: token(canvas, "--room-line"),
      ink: token(canvas, "--ink-hi"),
      muted: token(canvas, "--glass-muted"),
      wave: token(canvas, "--wave"),
      stir: token(canvas, "--stir"),
    };
    if (reduced) live.current.strip = fullStrip(live.current.mode);

    let raf = 0;
    let last = 0;
    let time = 0;
    let column = 0; // how many strip columns have been laid down
    let inView = false;
    let width = 0;
    let height = 0;

    const paint = () => {
      const s = live.current;
      drawRoom(ctx, { width, height, mode: s.mode, time: reduced ? STILL_TIME : time, strip: s.strip, colours });
    };

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
      // The strip gains a column every COL_SECONDS, and rolls on once it is full.
      const s = live.current;
      while (column < Math.floor(time / COL_SECONDS)) {
        column += 1;
        s.strip.push(stripColumn(s.mode, column * COL_SECONDS, column));
        if (s.strip.length > STRIP_COLS) s.strip.shift();
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
    // A choice made by its button redraws at once, also when nothing is animating.
    room.current = { paint, wake };

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
      room.current = null;
    };
  }, []);

  const choose = (next: number) => {
    live.current.mode = next;
    // With reduced motion there is no building up: the strip for this choice is shown whole.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) live.current.strip = fullStrip(next);
    setMode(next);
    room.current?.paint();
    room.current?.wake();
  };

  const toggle = () => {
    live.current.paused = !live.current.paused;
    setPaused(live.current.paused);
    room.current?.wake();
  };

  return (
    <figure className={styles.figure}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <figcaption className={styles.caption}>
        <p className={styles.schematic}>
          A drawing of the idea. The waves and the strip are made up, not recorded CSI, and the three choices below are
          not the classes the model was trained on.
        </p>

        <ul className={styles.modes}>
          {MODES.map((m, i) => (
            <li key={m.key}>
              <button type="button" className={styles.mode} aria-pressed={mode === i} onClick={() => choose(i)}>
                {m.label}
              </button>
            </li>
          ))}
          <li className={styles.pause}>
            <button type="button" className={styles.toggle} onClick={toggle}>
              {paused ? "Play" : "Pause"}
            </button>
          </li>
        </ul>

        <p className={styles.modeText} aria-live="polite">
          {MODES[mode].caption}
        </p>

        <ul className={styles.legend}>
          <li>
            <span className={styles.key} data-key="wave" aria-hidden="true" />
            <span>Teal: the Wi-Fi signal, leaving the router on the left for the four receivers on the right.</span>
          </li>
          <li>
            <span className={styles.key} data-key="stir" aria-hidden="true" />
            <span>
              Amber: the person, and what they change in the signal. In the strip under the room, time runs left to
              right, and the more amber a cell is, the more the signal is changing then.
            </span>
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
