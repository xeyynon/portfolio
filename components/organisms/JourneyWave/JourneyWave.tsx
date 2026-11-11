"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { JourneyPoint } from "@/data/portfolioData";
import { ROW, wavePath, xFor } from "./wave";
import styles from "./JourneyWave.module.css";

const KIND_LABEL: Record<NonNullable<JourneyPoint["kind"]>, string> = {
  start: "Start",
  role: "Role",
  award: "Award",
  build: "Built",
};

/**
 * Organism: the journey as a wave running down the page. Highs swing right,
 * lows swing left. A point with no label is curve only: the lows shape the
 * line and are never written out (owner, 2026-11-11). The order can be
 * reversed, which is the one control the section has.
 */
export default function JourneyWave({ points }: { points: JourneyPoint[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(220);
  const [latestFirst, setLatestFirst] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setWidth(track.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const ordered = useMemo(() => (latestFirst ? [...points].reverse() : points), [points, latestFirst]);
  const path = useMemo(() => wavePath(ordered.map((p) => p.level), width), [ordered, width]);
  const height = ordered.length * ROW;

  return (
    <div className={styles.journey}>
      <button
        type="button"
        className={styles.reverse}
        aria-pressed={latestFirst}
        onClick={() => setLatestFirst((v) => !v)}
      >
        <span aria-hidden="true">⇅</span> {latestFirst ? "Latest first" : "Earliest first"}
        <span className="sr-only">. Press to reverse the order of time.</span>
      </button>

      <div className={styles.grid} style={{ "--rows": ordered.length, "--row": `${ROW}px` } as CSSProperties}>
        <div className={styles.track} ref={trackRef} aria-hidden="true">
          {/* key: the line is redrawn from the top when the order flips */}
          <svg key={String(latestFirst)} className={styles.line} width={width} height={height}>
            <path d={path} pathLength={1} />
          </svg>
          {ordered.map((p, i) =>
            p.label ? (
              <span
                key={p.label}
                className={styles.node}
                data-kind={p.kind}
                style={{ left: xFor(p.level, width), top: i * ROW + ROW / 2 }}
              />
            ) : null,
          )}
        </div>

        <ol className={styles.list}>
          {ordered.map((p, i) =>
            p.label ? (
              <li key={p.label} className={styles.item} data-kind={p.kind}>
                <span className={styles.when}>
                  {p.when}
                  {p.kind && <span className={styles.kind}> · {KIND_LABEL[p.kind]}</span>}
                </span>
                <span className={styles.label}>{p.label}</span>
              </li>
            ) : (
              // A low: the row is kept so the curve has room to swing, and says nothing.
              <li key={`gap-${i}`} className={styles.gap} aria-hidden="true" />
            ),
          )}
        </ol>
      </div>
    </div>
  );
}
