"use client";

import { useState } from "react";
import { PATH, PLOT, plotX, plotY, sampleSet } from "./reading";
import styles from "./water.module.css";

/**
 * Organism: the path of one reading, from sensor to radio. The three stages
 * are named in order, and under them the middle one is shown: ten samples
 * (dots) and their average (a line), which is the one reading that is sent.
 * A button takes ten more. The samples are made up and carry no scale, and
 * the page says so.
 */
export default function ReadingPath() {
  const [set, setSet] = useState(0);
  const { samples, mean } = sampleSet(set);

  return (
    <div className={styles.path}>
      <ol className={styles.stages}>
        {PATH.map((stage, i) => (
          <li key={stage.key} className={styles.stage}>
            <span className={styles.stageNum}>{i + 1}</span>
            <span className={styles.stageName}>{stage.name}</span>
            <span className={styles.stageDoes}>{stage.does}</span>
          </li>
        ))}
      </ol>

      <figure className={styles.figure}>
        <svg
          className={styles.plot}
          viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
          aria-hidden="true"
          focusable="false"
        >
          <line className={styles.plotAxis} x1="16" y1={PLOT.bottom + 8} x2={PLOT.width - 16} y2={PLOT.bottom + 8} />
          {/* A new set is a new group, so its dots and its line draw in again. The first set is simply there. */}
          <g key={set} className={set > 0 ? styles.fresh : undefined}>
            {samples.map((value, i) => (
              <circle key={i} className={styles.sample} cx={plotX(i)} cy={plotY(value)} r="5" />
            ))}
            <line className={styles.mean} x1="16" y1={plotY(mean)} x2={PLOT.width - 16} y2={plotY(mean)} />
          </g>
        </svg>

        <figcaption className={styles.caption}>
          <p className={styles.lead} aria-live="polite">
            Set {set + 1}: ten samples, the dots, averaged into one reading, the line.
          </p>
          <p>
            <button type="button" className={styles.button} onClick={() => setSet((n) => n + 1)}>
              Take ten more samples
            </button>
          </p>
          <p className={styles.note}>
            Example samples, made up for the drawing. There is no scale and no real reading here.
          </p>
        </figcaption>
      </figure>
    </div>
  );
}
