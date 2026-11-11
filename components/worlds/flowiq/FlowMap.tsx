"use client";

import { useEffect, useRef, useState } from "react";
import { drawMap, type MapColours } from "./draw";
import { HOLD_SECONDS, LAST_STAGE, STAGES, STAGE_SECONDS, shown } from "./map";
import styles from "./flowiq.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the FlowIQ map. A made-up street grid at night with traffic on
 * it: a route is drawn, a road on it is blocked, and the route is drawn again
 * round the block. It plays through once by itself; the steps below it are
 * buttons that jump to any one, and the traffic can be paused. The picture is
 * decoration for the words: each step's sentence is real text under the map.
 *
 * With reduced motion nothing plays: the map shows the chosen step complete,
 * with the traffic standing where it is.
 */
export default function FlowMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(LAST_STAGE);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  // What the drawing loop reads. Kept in a ref so a frame never waits on a render.
  const live = useRef({ stage: LAST_STAGE, progress: 1, held: 0, playing: false, paused: false });
  // The drawing loop's handles, for the buttons.
  const map = useRef<{ paint(): void; wake(): void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: MapColours = {
      night: token(canvas, "--night"),
      street: token(canvas, "--street"),
      car: token(canvas, "--car"),
      route: token(canvas, "--route"),
      blocked: token(canvas, "--blocked"),
      ink: token(canvas, "--ink-hi"),
    };

    let raf = 0;
    let last = 0;
    let time = 0;
    let jamTime = 0;
    let inView = true;
    let width = 0;
    let height = 0;

    const paint = () => {
      const s = live.current;
      drawMap(ctx, {
        width,
        height,
        stage: s.stage,
        progress: s.progress,
        time: reduced ? 0 : time,
        jamTime: reduced ? 0 : jamTime,
        colours,
      });
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
      time += dt;
      // The blocked road's traffic slows to a stop as the block appears.
      jamTime += dt * (1 - shown(1, s.stage, s.progress));
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
    // It starts its one run through the first time it is seen.
    let started = false;
    const view = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView && !started && !reduced) {
          started = true;
          live.current = { stage: 0, progress: 0, held: 0, playing: true, paused: false };
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
    map.current = { paint, wake };

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
      map.current = null;
    };
  }, []);

  const reducedNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Jump to a step. While paused, or with reduced motion, it is shown complete instead of drawing in. */
  const show = (next: number, play: boolean) => {
    const still = reducedNow() || (live.current.paused && !play);
    live.current = {
      stage: next,
      progress: still ? 1 : 0,
      held: 0,
      playing: play && !reducedNow(),
      paused: live.current.paused && !play,
    };
    setStage(next);
    setPlaying(live.current.playing);
    setPaused(live.current.paused);
    map.current?.paint();
    map.current?.wake(); // the loop may have gone idle
  };

  const togglePause = () => {
    live.current.paused = !live.current.paused;
    setPaused(live.current.paused);
    map.current?.wake();
  };

  return (
    <figure className={styles.figure}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <figcaption className={styles.caption}>
        <p className={styles.note}>
          A drawing on a made-up street grid: not a real city and not a screen from the app. The blocked road is made
          up too.
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
          <li className={styles.motionOnly}>
            <button type="button" className={styles.replay} onClick={() => show(0, true)} disabled={playing}>
              {playing ? "Playing" : "Play all"}
            </button>
          </li>
          <li className={styles.motionOnly}>
            <button type="button" className={styles.replay} onClick={togglePause}>
              {paused ? "Resume traffic" : "Pause traffic"}
            </button>
          </li>
        </ol>

        <p className={styles.stepText} aria-live="polite">
          {STAGES[stage].caption}
        </p>

        <ul className={styles.legend}>
          <li>
            <span className={styles.swatch} data-kind="route" aria-hidden="true" />
            Solid line: the route
          </li>
          <li>
            <span className={styles.swatch} data-kind="blocked" aria-hidden="true" />
            Crossed sign: the blocked road
          </li>
          <li>
            <span className={styles.swatch} data-kind="car" aria-hidden="true" />
            Small dots: traffic
          </li>
          <li>
            <span className={styles.swatch} data-kind="ends" aria-hidden="true" />
            Ring to diamond: start to destination
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
