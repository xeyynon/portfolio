"use client";

import { useState } from "react";
import { CHALLAN_CARDS, SCREENS, type ScreenKey } from "./screens";
import styles from "./flowiq.module.css";

/** One fine on a sketch: a marked card with blank lines where the details would be. */
function FineCard({ y }: { y: number }) {
  return (
    <g>
      <rect className={styles.sketchCard} x="14" y={y} width="152" height="68" rx="8" />
      <rect className={styles.sketchFine} x="24" y={y + 12} width="14" height="14" rx="3" />
      <rect className={styles.sketchBar} x="46" y={y + 13} width="70" height="6" rx="3" />
      <rect className={styles.sketchBarDim} x="46" y={y + 25} width="44" height="5" rx="2.5" />
      <rect className={styles.sketchBarDim} x="24" y={y + 47} width="96" height="5" rx="2.5" />
    </g>
  );
}

/** The phone, with one of the four screens sketched on it. No words and no numbers: there are none to show. */
function Sketch({ screen }: { screen: ScreenKey }) {
  return (
    <svg className={styles.phone} viewBox="0 0 180 320" aria-hidden="true" focusable="false">
      <rect className={styles.phoneFrame} x="1" y="1" width="178" height="318" rx="20" />
      <rect className={styles.sketchBarDim} x="70" y="12" width="40" height="5" rx="2.5" />

      {screen === "signin" && (
        <g>
          <circle className={styles.sketchLine} cx="90" cy="92" r="20" />
          <rect className={styles.sketchCard} x="28" y="140" width="124" height="28" rx="6" />
          <rect className={styles.sketchBar} x="38" y="151" width="58" height="6" rx="3" />
          <rect className={styles.sketchCard} x="28" y="178" width="124" height="28" rx="6" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} className={styles.sketchBar} cx={42 + i * 10} cy="192" r="2.5" />
          ))}
          <rect className={styles.sketchButton} x="28" y="224" width="124" height="30" rx="8" />
        </g>
      )}

      {screen === "route" && (
        <g>
          <path className={styles.sketchStreet} d="M10 70H170M10 120H170M10 175H170M45 28V228M95 28V228M140 28V228" />
          <polyline className={styles.sketchRoute} points="45,200 45,120 140,120 140,60" />
          <circle className={styles.sketchStart} cx="45" cy="200" r="5" />
          <path className={styles.sketchButton} d="M140 52l8 8-8 8-8-8z" />
          <rect className={styles.sketchCard} x="10" y="238" width="160" height="68" rx="10" />
          <rect className={styles.sketchBar} x="22" y="254" width="80" height="7" rx="3.5" />
          <rect className={styles.sketchBarDim} x="22" y="270" width="50" height="6" rx="3" />
        </g>
      )}

      {screen === "challan" && (
        <g>
          <rect className={styles.sketchBar} x="18" y="36" width="64" height="8" rx="4" />
          {CHALLAN_CARDS.map((y) => (
            <FineCard key={y} y={y} />
          ))}
        </g>
      )}

      {screen === "payment" && (
        <g>
          <rect className={styles.sketchBar} x="18" y="36" width="64" height="8" rx="4" />
          <FineCard y={CHALLAN_CARDS[0]} />
          <rect className={styles.sketchBarDim} x="18" y="150" width="60" height="6" rx="3" />
          <rect className={styles.sketchBar} x="126" y="150" width="36" height="6" rx="3" />
          <path className={styles.sketchStreet} d="M18 176H162" />
          <rect className={styles.sketchButton} x="18" y="262" width="144" height="34" rx="8" />
        </g>
      )}
    </svg>
  );
}

/**
 * Organism: what the user app does, one screen at a time. The four steps are
 * the project's own pipeline; each is a button, and its sentence is real text
 * beside the phone. The phone is a sketch, not a screenshot, and says so.
 */
export default function FlowScreens() {
  const [current, setCurrent] = useState(0);
  const screen = SCREENS[current];

  return (
    <div className={styles.screens}>
      <Sketch screen={screen.key} />

      <div className={styles.screensText}>
        <ol className={styles.steps}>
          {SCREENS.map((s, i) => (
            <li key={s.key}>
              <button type="button" className={styles.step} aria-pressed={current === i} onClick={() => setCurrent(i)}>
                <span className={styles.stepNum}>{i + 1}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>

        <p className={styles.stepText} aria-live="polite">
          {screen.caption}
        </p>

        <p className={styles.note}>
          Sketches of the four screens, not screenshots. A card with a square mark stands for one challan. No fines,
          amounts or places are shown, because none here would be real.
        </p>
      </div>
    </div>
  );
}
