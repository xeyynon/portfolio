"use client";

import { useEffect, useRef, useState } from "react";
import { drawSky, type SkyColours } from "./draw";
import { CLOSEST, HOLD_SECONDS, LAST_STAGE, REFINE_STAGE, STAGES } from "./orbit";
import styles from "./orca.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the ORCA sky. A catalog of objects round a globe, the candidate
 * pairs linked, and two objects followed as the gap between them shrinks to
 * their closest approach. It plays through once by itself, and the steps
 * below it are buttons that jump to any one. The picture is decoration for
 * the words: each step's sentence is real text under the figure.
 *
 * With reduced motion nothing plays: the sky is held still on the chosen
 * step, with the two objects at their closest approach.
 */
export default function OrcaSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(LAST_STAGE);
  const [playing, setPlaying] = useState(false);
  // What the drawing loop reads. Kept in a ref so a frame never waits on a render.
  const live = useRef({ stage: LAST_STAGE, progress: 1, held: 0, playing: false, pairClock: CLOSEST });
  // The drawing loop's handles, for the buttons.
  const figure = useRef<{ paint(): void; wake(): void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: SkyColours = {
      space: token(canvas, "--space"),
      line: token(canvas, "--space-line"),
      globe: token(canvas, "--globe"),
      ink: token(canvas, "--ink-hi"),
      object: token(canvas, "--object"),
      approach: token(canvas, "--approach"),
    };

    let raf = 0;
    let last = 0;
    let time = 0;
    let inView = true;
    let width = 0;
    let height = 0;

    const paint = () => {
      const s = live.current;
      drawSky(ctx, {
        width,
        height,
        stage: s.stage,
        progress: s.progress,
        time: reduced ? 0 : time,
        pairClock: reduced ? CLOSEST : s.pairClock,
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
      time += dt;
      const s = live.current;
      if (s.stage >= REFINE_STAGE) s.pairClock += dt;
      if (s.progress < 1) {
        s.progress = Math.min(1, s.progress + dt / STAGES[s.stage].seconds);
      } else if (s.playing) {
        s.held += dt;
        if (s.held >= HOLD_SECONDS) {
          if (s.stage < LAST_STAGE) {
            s.stage += 1;
            s.progress = 0;
            s.held = 0;
            // the two objects start their approach as the refinement step begins
            if (s.stage === REFINE_STAGE) s.pairClock = 0;
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
          live.current = { stage: 0, progress: 0, held: 0, playing: true, pairClock: 0 };
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
    live.current = {
      stage: next,
      progress: reducedNow() ? 1 : 0,
      held: 0,
      playing: play && !reducedNow(),
      // a step past the refinement opens with the two objects already at their closest
      pairClock: next > REFINE_STAGE ? CLOSEST : 0,
    };
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
          A schematic. A few hundred made-up dots stand in for the 15,968 objects, the links and their weights are for
          show, and nothing is to scale.
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
            <span className={styles.keyObject} aria-hidden="true" />
            A pale dot is an object in the catalog.
          </li>
          <li>
            <span className={styles.keyApproach} aria-hidden="true" />
            Coral is a possible close approach: a link between two candidates, the two ringed objects being followed,
            and the circle round the gap between them. A heavier link is a higher tier.
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
