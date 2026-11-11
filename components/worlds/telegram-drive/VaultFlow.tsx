"use client";

import { useEffect, useRef, useState } from "react";
import { drawScene, type SceneColours } from "./draw";
import { HOLD_SECONDS, LAST_STAGE, STAGES, STAGE_SECONDS } from "./scene";
import styles from "./telegramDrive.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the Telegram Drive scene. A file on the device is cut into
 * chunks, each chunk is locked, each leaves for Telegram, the index is pinned
 * there, and for playback the chunks come back and open. It plays through
 * once by itself, and the steps below it are buttons that jump to any one.
 * The picture is decoration for the words: each step's sentence is real text
 * under the scene, and the two sides are named in text above it.
 *
 * With reduced motion nothing plays: the scene shows the chosen step complete.
 */
export default function VaultFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(LAST_STAGE);
  const [playing, setPlaying] = useState(false);
  // What the drawing loop reads. Kept in a ref so a frame never waits on a render.
  const live = useRef({ stage: LAST_STAGE, progress: 1, held: 0, playing: false });
  // The drawing loop's handles, for the buttons.
  const scene = useRef<{ paint(): void; wake(): void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: SceneColours = {
      vault: token(canvas, "--vault"),
      line: token(canvas, "--vault-line"),
      ink: token(canvas, "--ink-hi"),
      plain: token(canvas, "--plain"),
      locked: token(canvas, "--locked"),
    };

    let raf = 0;
    let last = 0;
    let inView = true;
    let width = 0;
    let height = 0;

    const paint = () => {
      const s = live.current;
      drawScene(ctx, { width, height, stage: s.stage, progress: s.progress, colours });
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
      const s = live.current;
      if (s.progress < 1) {
        s.progress = Math.min(1, s.progress + dt / STAGE_SECONDS);
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
    // Nothing here moves between steps, so the loop rests once a step is drawn and the run is over.
    const schedule = () => {
      const s = live.current;
      if (raf || reduced || !inView || document.hidden || (s.progress >= 1 && !s.playing)) return;
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
    scene.current = { paint, wake };

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
      scene.current = null;
    };
  }, []);

  const reducedNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const show = (next: number, play: boolean) => {
    live.current = { stage: next, progress: reducedNow() ? 1 : 0, held: 0, playing: play && !reducedNow() };
    setStage(next);
    setPlaying(live.current.playing);
    scene.current?.paint();
    scene.current?.wake(); // the loop will have gone idle
  };

  return (
    <figure className={styles.figure}>
      <div className={styles.sides}>
        <span>On the device</span>
        <span>In Telegram</span>
      </div>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <figcaption className={styles.caption}>
        <p className={styles.note}>A schematic of the method. The file and its six chunks are made up for the drawing.</p>

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
          <li className={styles.motionOnly}>
            <button type="button" className={styles.replay} onClick={() => show(0, true)} disabled={playing}>
              {playing ? "Playing" : "Play all"}
            </button>
          </li>
        </ol>

        <p className={styles.stepText} aria-live="polite">
          {STAGES[stage].caption}
        </p>

        <ul className={styles.legend}>
          <li>
            <span className={styles.swatch} data-kind="plain" aria-hidden="true" />
            Outline with two lines: plain data
          </li>
          <li>
            <span className={styles.swatch} data-kind="locked" aria-hidden="true" />
            Padlock: encrypted
          </li>
          <li>
            <span className={styles.swatch} data-kind="iv" aria-hidden="true" />
            Three small squares: a chunk&apos;s own IV, different on every chunk
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
