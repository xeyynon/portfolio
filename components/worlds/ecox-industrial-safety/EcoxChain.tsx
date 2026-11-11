"use client";

import { useEffect, useState } from "react";
import { CHAIN, ROLE_LABEL, STEP_MS } from "./chain";
import styles from "./ecox.module.css";

/**
 * Organism: the alarm chain, from the sensor to the dashboard, in the
 * project's own order. "Raise an alarm" walks it one link at a time; each
 * link that has been reached stays marked, in words as well as in colour.
 * Who built each link is said beside it.
 *
 * With reduced motion the whole chain is marked at once.
 */
export default function EcoxChain() {
  // How many links the alarm has reached; 0 is quiet.
  const [reached, setReached] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Under way until the last link is reached.
  const running = playing && reached < CHAIN.length;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setReached((n) => n + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [running, reached]);

  const raise = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReached(CHAIN.length);
      setPlaying(false);
      return;
    }
    setReached(1);
    setPlaying(true);
  };

  const done = reached >= CHAIN.length;

  return (
    <div className={styles.chainWrap}>
      <p className={styles.chainNote}>A team build. Every link says who built it.</p>

      <div className={styles.chainControls}>
        <button type="button" className={styles.raise} onClick={raise} disabled={running}>
          {running ? "Alarm under way" : done ? "Raise it again" : "Raise an alarm"}
        </button>
        {reached > 0 && !running && (
          <button type="button" className={styles.toggle} onClick={() => {
              setReached(0);
              setPlaying(false);
            }}>
            Reset
          </button>
        )}
      </div>

      <ol className={styles.chain}>
        {CHAIN.map((link, i) => {
          const hit = i < reached;
          return (
            <li key={link.key} className={styles.link} data-role={link.role} data-hit={hit}>
              <span className={styles.linkNum} aria-hidden="true">
                {i + 1}
              </span>
              <div className={styles.linkBody}>
                <p className={styles.linkHead}>
                  <span className={styles.linkName}>{link.name}</span>
                  {hit && <span className={styles.hit}>Alarm reached</span>}
                </p>
                <p className={styles.linkText}>{link.text}</p>
                <p className={styles.role}>{ROLE_LABEL[link.role]}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className={styles.status} aria-live="polite">
        {done
          ? "The alarm has gone the whole way: sounded on the spot, and sent over 4G with a GPS position to the dashboard."
          : reached > 0
            ? `The alarm has reached: ${CHAIN[reached - 1].name}.`
            : "Quiet. Press “Raise an alarm” to follow one from the sensor to the dashboard."}
      </p>
    </div>
  );
}
