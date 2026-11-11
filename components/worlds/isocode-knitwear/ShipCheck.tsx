"use client";

import { useId, useState } from "react";
import { EXAMPLE, RATE_MAX, STATUS_WORD, UPDATES, share, verdict, type Updates } from "./ontime";
import styles from "./knitwear.module.css";

/**
 * Organism: will it ship on time? The visitor sets how many pieces an order
 * needs a day and how many are being made, and reads the status with the sum
 * behind it. It opens on the project's own example. This is arithmetic the
 * visitor drives, an illustration of the idea and not the product's engine;
 * the first line under the heading says so.
 */
export default function ShipCheck() {
  const id = useId();
  const [need, setNeed] = useState<number>(EXAMPLE.need);
  const [made, setMade] = useState<number>(EXAMPLE.made);
  const [updates, setUpdates] = useState<Updates>("plenty");

  const result = verdict(need, made, updates);
  const silent = updates === "none";

  return (
    <div className={styles.check}>
      <p className={styles.schematic}>
        An illustration of the idea, with numbers you set. It is not the product&apos;s own engine.
      </p>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={`${id}-need`}>
            Pieces needed per day
          </label>
          <span className={styles.fieldValue}>{need}</span>
          <input
            className={styles.slider}
            id={`${id}-need`}
            type="range"
            min={1}
            max={RATE_MAX}
            step={1}
            value={need}
            onChange={(e) => setNeed(Number(e.target.value))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={`${id}-made`}>
            Pieces made per day
          </label>
          <span className={styles.fieldValue}>{silent ? "not known" : made}</span>
          <input
            className={styles.slider}
            id={`${id}-made`}
            type="range"
            min={0}
            max={RATE_MAX}
            step={1}
            value={made}
            disabled={silent}
            onChange={(e) => setMade(Number(e.target.value))}
          />
        </div>

        <fieldset className={styles.updates}>
          <legend className={styles.fieldLabel}>Daily counts in from the floor</legend>
          <div className={styles.choices}>
            {UPDATES.map((u) => (
              <label key={u.key} className={styles.choice}>
                <input
                  type="radio"
                  name={`${id}-updates`}
                  value={u.key}
                  checked={updates === u.key}
                  onChange={() => setUpdates(u.key)}
                />
                {u.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* The two rates as two knitted rows. The numbers are in the text below. */}
      <div className={styles.bars} aria-hidden="true">
        <span className={styles.barName}>Needed</span>
        <span className={styles.track}>
          <span className={styles.fill} style={{ width: `${share(need) * 100}%` }} />
        </span>
        <span className={styles.barName}>Made</span>
        <span className={styles.track} data-status={result.status}>
          <span className={styles.fill} style={{ width: `${silent ? 0 : share(made) * 100}%` }} />
        </span>
      </div>

      <output className={styles.verdict} data-status={result.status} htmlFor={`${id}-need ${id}-made`}>
        <span className={styles.verdictWord}>
          {STATUS_WORD[result.status]}
          {result.estimate && <span className={styles.estimate}> · estimate</span>}
        </span>
        {result.sum && <span className={styles.verdictSum}>{result.sum}</span>}
        <span className={styles.verdictDetail}>
          {result.detail}
          {result.estimate && " The rate rests on little data, so it is labelled an estimate."}
        </span>
      </output>
    </div>
  );
}
