"use client";

import { useEffect, useRef, useState } from "react";
import { drawBoard, type BoardColours } from "./draw";
import { HOLD_SECONDS, LAST_STAGE, STAGES } from "./board";
import styles from "./surrag.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the SURRAG evidence board. Report cards are pinned up, the
 * people named in them marked, the same person tied across reports, the
 * cases strung into a graph, and one lead drawn out. It plays through once
 * by itself, and the steps below it are buttons that jump to any one. The
 * picture is decoration for the words: each step's sentence is real text
 * under the figure.
 *
 * With reduced motion nothing plays: the board shows the chosen step complete.
 */
export default function SurragBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(LAST_STAGE);
  const [playing, setPlaying] = useState(false);
  // What the drawing loop reads. Kept in a ref so a frame never waits on a render.
  const live = useRef({ stage: LAST_STAGE, progress: 1, held: 0, playing: false });
  // The drawing loop's handles, for the buttons.
  const figure = useRef<{ paint(): void; wake(): void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: BoardColours = {
      board: token(canvas, "--board"),
      line: token(canvas, "--board-line"),
      paper: token(canvas, "--paper"),
      ink: token(canvas, "--ink-hi"),
      muted: token(canvas, "--glass-muted"),
      link: token(canvas, "--string"),
    };
    const font = getComputedStyle(canvas).fontFamily;

    let raf = 0;
    let last = 0;
    let time = 0;
    let inView = true;
    let width = 0;
    let height = 0;

    const paint = () => {
      const s = live.current;
      drawBoard(ctx, { width, height, stage: s.stage, progress: s.progress, time: reduced ? 0 : time, colours, font });
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
      const s = live.current;
      if (s.progress < 1) {
        s.progress = Math.min(1, s.progress + dt / STAGES[s.stage].seconds);
      } else if (s.playing) {
        s.held += dt;
        if (s.held >= HOLD_SECONDS) {
          if (s.stage < LAST_STAGE) {
            s.stage += 1;
            s.progress = 0;
            s.held = 0;
            setStage(s.stage);
          } else {
            s.playing = false;
            setPlaying(false);
          }
        }
      }
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
    // It starts its one run through the first time it is seen.
    let started = false;
    const view = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView && !started && !reduced) {
          started = true;
          live.current = { stage: 0, progress: 0, held: 0, playing: true };
          setStage(0);
          setPlaying(true);
        }
        wake();
      },
      { threshold: 0.35 },
    );
    view.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    // A step chosen by its button redraws at once, also when nothing is animating.
    figure.current = { paint, wake };

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
      figure.current = null;
    };
  }, []);

  const reducedNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const show = (next: number, play: boolean) => {
    live.current = { stage: next, progress: reducedNow() ? 1 : 0, held: 0, playing: play && !reducedNow() };
    setStage(next);
    setPlaying(live.current.playing);
    figure.current?.paint();
    figure.current?.wake(); // the loop may have gone idle
  };

  return (
    <figure className={styles.figure}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <figcaption className={styles.caption}>
        <p className={styles.schematic}>
          A schematic of the method. The five reports and the links between them are made up; the live demo itself
          runs on synthetic reports, not real ones.
        </p>

        <ol className={styles.steps}>
          {STAGES.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                className={styles.step}
                aria-pressed={stage === i}
                data-done={i < stage}
                onClick={() => show(i, false)}
              >
                <span className={styles.stepNum}>{i + 1}</span>
                {s.label}
              </button>
            </li>
          ))}
          <li>
            <button type="button" className={styles.replay} onClick={() => show(0, true)} disabled={playing}>
              {playing ? "Playing" : "Play all"}
            </button>
          </li>
        </ol>

        <p className={styles.stepText} aria-live="polite">
          {STAGES[stage].caption}
        </p>

        <ul className={styles.key}>
          <li>
            <span className={styles.keyMention} aria-hidden="true" />
            A ringed dot on a card is a person named in that report. A dashed line ties names found to be the same
            person.
          </li>
          <li>
            <span className={styles.keyString} aria-hidden="true" />
            Red string is a link in the case graph: one person, strung to every report that names them. The lead is the
            heavier string, and the reports it cites are outlined.
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
