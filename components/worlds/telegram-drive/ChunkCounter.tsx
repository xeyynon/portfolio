"use client";

import { useId, useState } from "react";
import { CHUNK_MB, MAX_MB, MIN_MB, START_MB, chunkPlan, ivSentence, planHeadline, planSentence } from "./chunks";
import styles from "./telegramDrive.module.css";

/**
 * Organism: how many chunks a file becomes. The visitor picks a file size and
 * the page divides it by the 48 MB chunk size: the count, the size of the
 * last chunk, and one IV for each. It is arithmetic on one stated number and
 * is labelled as that.
 */
export default function ChunkCounter() {
  const id = useId();
  const [size, setSize] = useState(START_MB);
  const plan = chunkPlan(size);

  return (
    <div className={styles.counter}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={id}>
          File size
        </label>
        <span className={styles.value}>{plan.sizeMb} MB</span>
        <input
          id={id}
          className={styles.range}
          type="range"
          min={MIN_MB}
          max={MAX_MB}
          step={1}
          value={plan.sizeMb}
          aria-valuetext={planHeadline(plan)}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </div>

      <p className={styles.headline}>{planHeadline(plan)}</p>

      {/* One box for each chunk. The last is filled only as far as it is full. */}
      <div className={styles.row} aria-hidden="true">
        {Array.from({ length: plan.count }, (_, k) => (
          <span key={k} className={styles.box}>
            <span
              className={styles.boxFill}
              style={k === plan.count - 1 ? { width: `${(plan.lastMb / CHUNK_MB) * 100}%` } : undefined}
            />
          </span>
        ))}
      </div>

      <div className={styles.sums}>
        <p>{planSentence(plan)}</p>
        <p>{ivSentence(plan)}</p>
      </div>

      <p className={styles.note}>
        A calculation, not a measurement from the app: the file size divided by the {CHUNK_MB} MB chunk size, rounded
        up, taking the last chunk to hold whatever is left over. The sizes on the slider are examples.
      </p>
    </div>
  );
}
