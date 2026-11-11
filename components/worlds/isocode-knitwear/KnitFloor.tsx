"use client";

import { useEffect, useRef, useState } from "react";
import { drawStrip, type FloorColours } from "./draw";
import { LATE_ROW, ROWS, RUN_SECONDS, rowProgress, rowStatus } from "./floor";
import { EXAMPLE, STATUS_WORD, type Status } from "./ontime";
import styles from "./knitwear.module.css";

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * Organism: the knitting floor. Five rows are knitted stitch by stitch toward
 * the ship date at the right edge while a pace line crosses the floor. One row
 * slows, falls behind the line and turns amber, and its sum appears beside it.
 * It plays once when first seen; the button plays it again.
 *
 * Each row is its own strip so its status can sit beside it as real text.
 * With reduced motion nothing plays: the floor shows the last day complete.
 */
export default function KnitFloor() {
  const strips = useRef<(HTMLCanvasElement | null)[]>([]);
  const listRef = useRef<HTMLUListElement>(null);
  // The late row's status is the only one that changes while it plays.
  const [late, setLate] = useState(true);
  const [playing, setPlaying] = useState(false);
  // What the drawing loop reads. Kept in a ref so a frame never waits on a render.
  const live = useRef({ t: 1, playing: false, late: true });
  // The drawing loop's handles, for the button.
  const floor = useRef<{ paint(): void; wake(): void } | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colours: FloorColours = {
      floor: token(list, "--floor"),
      guide: token(list, "--floor-line"),
      yarn: token(list, "--yarn"),
      ink: token(list, "--ink-hi"),
    };
    const statusColour: Record<Status, string> = {
      "on-time": token(list, "--on-time"),
      behind: token(list, "--behind"),
      "no-updates": token(list, "--no-updates"),
    };

    let raf = 0;
    let last = 0;
    let inView = true;

    const paint = () => {
      const { t } = live.current;
      ROWS.forEach((row, i) => {
        const canvas = strips.current[i];
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const ratio = canvas.width / (canvas.clientWidth || 1);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const status = rowStatus(row, t);
        drawStrip(ctx, {
          width: canvas.clientWidth,
          height: canvas.clientHeight,
          progress: rowProgress(row, t),
          pace: t,
          colour: statusColour[status],
          behind: status === "behind",
          hollow: status === "no-updates",
          colours,
        });
      });
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      for (const canvas of strips.current) {
        if (!canvas) continue;
        canvas.width = Math.round(canvas.clientWidth * ratio);
        canvas.height = Math.round(canvas.clientHeight * ratio);
      }
      paint();
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const s = live.current;
      if (s.playing) {
        s.t = Math.min(1, s.t + dt / RUN_SECONDS);
        const lateNow = ROWS.some((row) => row.key === LATE_ROW && rowStatus(row, s.t) === "behind");
        if (lateNow !== s.late) {
          s.late = lateNow;
          setLate(lateNow);
        }
        if (s.t >= 1) {
          s.playing = false;
          setPlaying(false);
        }
      }
      paint();
      schedule();
    };
    const schedule = () => {
      if (raf || reduced || !inView || document.hidden || !live.current.playing) return;
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      last = 0;
      schedule();
    };

    const sizes = new ResizeObserver(resize);
    sizes.observe(list);
    // It starts its one run the first time it is seen.
    let started = false;
    const view = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView && !started && !reduced) {
          started = true;
          live.current = { t: 0, playing: true, late: false };
          setLate(false);
          setPlaying(true);
        }
        wake();
      },
      { threshold: 0.35 },
    );
    view.observe(list);
    document.addEventListener("visibilitychange", wake);
    floor.current = { paint, wake };

    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", wake);
      floor.current = null;
    };
  }, []);

  const replay = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    live.current = { t: 0, playing: true, late: false };
    setLate(false);
    setPlaying(true);
    floor.current?.paint();
    floor.current?.wake(); // the loop goes idle when a run ends
  };

  return (
    <figure className={styles.floor}>
      <ul className={styles.rows} ref={listRef}>
        {ROWS.map((row, i) => {
          const status: Status = row.key === LATE_ROW ? (late ? "behind" : "on-time") : rowStatus(row, 1);
          return (
            <li key={row.key} className={styles.row} data-status={status}>
              <canvas
                className={styles.strip}
                ref={(el) => {
                  strips.current[i] = el;
                }}
                aria-hidden="true"
              />
              <p className={styles.rowLabel}>
                <span className={styles.statusWord}>{STATUS_WORD[status]}</span>
                {row.key === LATE_ROW && (
                  <span className={styles.rowSum} data-shown={late}>
                    need {EXAMPLE.need} a day, making {EXAMPLE.made} a day
                  </span>
                )}
                {status === "no-updates" && <span className={styles.rowSum}>grey, never green</span>}
              </p>
            </li>
          );
        })}
      </ul>

      <figcaption className={styles.caption}>
        <p className={styles.schematic}>
          A picture of the idea. The rows are made up; the sum is the project&apos;s own example.
        </p>
        <p className={styles.captionText}>
          Each row is an order being knitted toward its ship date at the right edge. The upright line is where a row
          has to be today. One order slows, falls behind the line and turns amber well before the date, with the sum
          that says why. An order with no updates stays grey, never green.
        </p>
        <button type="button" className={styles.replay} onClick={replay} disabled={playing}>
          {playing ? "Knitting" : "Play again"}
        </button>
      </figcaption>
    </figure>
  );
}
