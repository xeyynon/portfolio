"use client";

import { useEffect, useRef, useState } from "react";
import { GLOSS, HOLD_SECONDS, LAST_STAGE, STAGES, STAGE_SECONDS, WORDS, WORD_GAP_MS } from "./call";
import { drawWave, type WaveColours } from "./draw";
import { EXAMPLE_NOTE, priceOrder, quantityText, rupees, sentences } from "./order";
import styles from "./dukaan.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

// The example order, priced once: it never changes in the hero.
const ORDER = priceOrder(EXAMPLE_NOTE);
const REPLY = sentences(ORDER);

/**
 * Organism: one phone call. A voice on the line becomes words, the words
 * become an order note, and code turns the note into an order slip with a
 * total that the agent reads back. It plays through once by itself, and the
 * steps are buttons that jump to any one. The waveform is decoration: the
 * caller's words, the slip and each step's sentence are real text under it.
 *
 * With reduced motion nothing plays: the call shows the chosen step complete.
 */
export default function DukaanCall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(LAST_STAGE);
  const [playing, setPlaying] = useState(false);
  // What the drawing loop reads. Kept in a ref so a frame never waits on a render.
  const live = useRef({ stage: LAST_STAGE, progress: 1, held: 0, playing: false });
  // The drawing loop's handles, for the buttons.
  const wave = useRef<{ paint(): void; wake(): void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: WaveColours = {
      line: token(canvas, "--call-line"),
      caller: token(canvas, "--voice"),
      agent: token(canvas, "--ink-hi"),
      quiet: token(canvas, "--glass-muted"),
    };

    let raf = 0;
    let last = 0;
    let time = 0;
    let inView = true;
    let width = 0;
    let height = 0;

    const paint = () => {
      const s = live.current;
      drawWave(ctx, { width, height, stage: s.stage, progress: s.progress, time: reduced ? 0 : time, colours });
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
    wave.current = { paint, wake };

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
      wave.current = null;
    };
  }, []);

  const reducedNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const show = (next: number, play: boolean) => {
    live.current = { stage: next, progress: reducedNow() ? 1 : 0, held: 0, playing: play && !reducedNow() };
    setStage(next);
    setPlaying(live.current.playing);
    wave.current?.paint();
    wave.current?.wake(); // the loop may have gone idle
  };

  return (
    <figure className={styles.call}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />

      <figcaption className={styles.caption}>
        <p className={styles.schematic}>
          An example call. The words, items and prices are invented for this page, and the waveform is not a
          recording. In the project itself, all voices, shops and orders are synthetic.
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

        {/* What the call has produced so far. Each part keeps its place before it appears, so nothing jumps. */}
        <div className={styles.produced}>
          <div className={styles.heard} data-on={stage >= 1} data-noted={stage >= 2}>
            <p className={styles.speaker}>Caller, in Hinglish</p>
            <p className={styles.words} lang="hi-Latn">
              {WORDS.map((word, i) => (
                <span
                  key={i}
                  className={styles.word}
                  data-item={word.item !== undefined}
                  style={{ animationDelay: `${i * WORD_GAP_MS}ms` }}
                >
                  {word.text}{" "}
                </span>
              ))}
            </p>
            <p className={styles.gloss}>In English: {GLOSS}</p>
          </div>

          <div className={styles.slip} data-on={stage >= 2}>
            <table className={styles.slipTable}>
              <caption className={styles.slipTitle}>Order slip · example</caption>
              <thead>
                <tr>
                  <th scope="colgroup" colSpan={2} className={styles.byModel}>
                    The model says
                  </th>
                  <th scope="colgroup" colSpan={2} className={styles.byCode} data-on={stage >= 3}>
                    Code works out
                  </th>
                </tr>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">How many</th>
                  <th scope="col" className={styles.money} data-on={stage >= 3}>
                    Price
                  </th>
                  <th scope="col" className={styles.money} data-on={stage >= 3}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {ORDER.lines.map((line) => (
                  <tr key={line.item.key}>
                    <th scope="row">{line.item.name}</th>
                    <td>{quantityText(line.item, line.quantity)}</td>
                    <td className={styles.money} data-on={stage >= 3}>
                      {rupees(line.item.price)} a {line.item.unit}
                    </td>
                    <td className={styles.money} data-on={stage >= 3}>
                      {rupees(line.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr data-on={stage >= 3}>
                  <th scope="row" colSpan={3}>
                    Total
                  </th>
                  <td className={styles.total}>{rupees(ORDER.total)}</td>
                </tr>
              </tfoot>
            </table>

            <p className={styles.reply} data-on={stage >= 4}>
              <span className={styles.speaker}>Agent</span>
              {REPLY.map((sentence, i) => (
                <span key={i}>
                  {sentence.map((part, j) =>
                    part.amount ? (
                      <strong key={j} className={styles.amount}>
                        {part.text}
                      </strong>
                    ) : (
                      part.text
                    ),
                  )}{" "}
                </span>
              ))}
            </p>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}
