"use client";

import { useId, useState } from "react";
import {
  HEIGHT,
  MAX_DEGREES,
  PRESETS,
  WIDTH,
  formatDegrees,
  formatValue,
  radians,
  reading,
  sinePath,
  tangentPath,
  toX,
  toY,
} from "./plot";
import styles from "./QuotePlot.module.css";

// The two curves never change, so they are worked out once.
const SINE = sinePath();
const TANGENT = tangentPath();

/**
 * Organism: the proof you can move. One angle, three readings. Sine stays
 * between -1 and +1 while tangent, the same sine divided by a cosine that is
 * running out, leaves the frame. The angle stops at 89.99 degrees because the
 * tangent is undefined at 90: the page never shows infinity as a value.
 */
export default function QuotePlot() {
  const [degrees, setDegrees] = useState(45);
  const id = useId();
  const sine = SINE;
  const tangent = TANGENT;
  const r = reading(degrees);
  const x = toX(radians(degrees));

  return (
    <div className={styles.plot}>
      <svg className={styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>Sine and tangent of the same angle</title>
        <desc id={`${id}-desc`}>
          The sine curve stays between minus one and plus one. The tangent curve rises without bound as the angle
          approaches ninety degrees, where a dashed line marks the asymptote.
        </desc>

        <line className={styles.axis} x1="0" x2={WIDTH} y1={toY(0)} y2={toY(0)} />
        <line className={styles.axis} x1={toX(0)} x2={toX(0)} y1="0" y2={HEIGHT} />
        <line className={styles.bound} x1="0" x2={WIDTH} y1={toY(1)} y2={toY(1)} />
        <line className={styles.bound} x1="0" x2={WIDTH} y1={toY(-1)} y2={toY(-1)} />
        <line className={styles.asymptote} x1={toX(Math.PI / 2)} x2={toX(Math.PI / 2)} y1="0" y2={HEIGHT} />

        <path className={styles.sine} d={sine} />
        <path className={styles.tangent} d={tangent} />

        <line className={styles.cursor} x1={x} x2={x} y1="0" y2={HEIGHT} />
        <circle className={styles.onSine} cx={x} cy={toY(r.sin)} r="6" />
        {r.inFrame ? (
          <circle className={styles.onTangent} cx={x} cy={toY(r.tan)} r="6" />
        ) : (
          <path className={styles.onTangent} d={`M${x - 7} 16 L${x} 3 L${x + 7} 16 Z`} />
        )}

        <text className={styles.label} x="8" y={toY(1) - 6}>+1</text>
        <text className={styles.label} x="8" y={toY(-1) + 14}>{"−1"}</text>
        <text className={styles.label} x={toX(Math.PI / 2) - 6} y={HEIGHT - 8} textAnchor="end">90°</text>
      </svg>

      <div className={styles.controls}>
        <label className={styles.sliderLabel} htmlFor={`${id}-angle`}>
          Angle θ
        </label>
        <input
          id={`${id}-angle`}
          className={styles.slider}
          type="range"
          min="0"
          max={MAX_DEGREES}
          step="0.01"
          value={degrees}
          onChange={(e) => setDegrees(Number(e.target.value))}
          aria-valuetext={`${formatDegrees(degrees)}, tangent ${formatValue(r.tan)}`}
        />
        <div className={styles.presets} role="group" aria-label="Set the angle">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={styles.preset}
              aria-pressed={degrees === p}
              onClick={() => setDegrees(p)}
            >
              {formatDegrees(p)}
            </button>
          ))}
        </div>
      </div>

      <dl className={styles.readings}>
        <div className={styles.reading}>
          <dt>θ</dt>
          <dd>{formatDegrees(degrees)}</dd>
        </div>
        <div className={styles.reading} data-curve="sine">
          <dt>sin θ</dt>
          <dd>{formatValue(r.sin)}</dd>
        </div>
        <div className={styles.reading}>
          <dt>cos θ</dt>
          <dd>{formatValue(r.cos)}</dd>
        </div>
        <div className={styles.reading} data-curve="tangent">
          <dt>tan θ</dt>
          <dd>{formatValue(r.tan)}</dd>
        </div>
      </dl>
    </div>
  );
}
