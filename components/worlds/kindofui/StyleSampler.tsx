"use client";

import { useState } from "react";
import { LIBRARY_STYLES, SAMPLE_STYLES, type SampleStyle } from "./styles";
import styles from "./kindofui.module.css";

/**
 * Organism: one panel, four ways. The visitor picks a style and the same small
 * panel redraws itself in it, still working: its switch and its button can be
 * used in every style. This shows the idea of the library, side by side
 * styles you can touch; it is not the library's code, and the first line
 * says so.
 */
export default function StyleSampler() {
  const [style, setStyle] = useState<SampleStyle>("flat");
  const [alerts, setAlerts] = useState(true);
  const [saved, setSaved] = useState(false);
  const chosen = SAMPLE_STYLES.find((s) => s.key === style) ?? SAMPLE_STYLES[0];

  return (
    <div className={styles.sampler}>
      <p className={styles.schematic}>
        Four styles drawn for this page to show the idea. This is not the library&apos;s own code; the library has{" "}
        {LIBRARY_STYLES} visual styles.
      </p>

      <div className={styles.picker} role="group" aria-label="Style">
        {SAMPLE_STYLES.map((s) => (
          <button
            key={s.key}
            type="button"
            className={styles.pick}
            aria-pressed={style === s.key}
            onClick={() => setStyle(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={styles.stage} data-style={style}>
        <section className={styles.panel} aria-label={`Sample panel, ${chosen.label} style`}>
          <p className={styles.panelKicker}>Settings</p>
          <p className={styles.panelTitle}>Weekly digest</p>
          <p className={styles.panelText}>A short summary every Monday morning.</p>
          <div className={styles.panelRow}>
            <button
              type="button"
              className={styles.switch}
              aria-pressed={alerts}
              onClick={() => setAlerts((on) => !on)}
            >
              <span className={styles.switchTrack} aria-hidden="true">
                <span className={styles.switchKnob} />
              </span>
              Alerts {alerts ? "on" : "off"}
            </button>
            <button type="button" className={styles.primary} onClick={() => setSaved((done) => !done)}>
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </section>
      </div>

      <p className={styles.styleNote} aria-live="polite">
        <span className={styles.styleName}>{chosen.label}</span> {chosen.note}
      </p>
    </div>
  );
}
