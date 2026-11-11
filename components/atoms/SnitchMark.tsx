import { useId } from "react";
import styles from "./SnitchMark.module.css";

/**
 * Atom: the Snitch as a small flat drawing, for where the 3D one would be too
 * heavy: the companion that flies down the page and the one that opens at
 * Contact. Same parts as the big one: a gold body with a rib across it, two
 * ball joints, and two curved wings of ribbed glass. `open` lifts the upper
 * half like a lid and lets the light inside show.
 *
 * Decorative: it carries no name of its own. Whatever it sits in names it.
 */

const JOINT = { x: 72, y: 30 };
const TIP = { x: 116, y: 7 };
const BEND = { x: 96, y: 29 };

/** A point on the wing's spine, a curve from the joint out and up to the tip. */
function spine(t: number) {
  const u = 1 - t;
  return {
    x: u * u * JOINT.x + 2 * u * t * BEND.x + t * t * TIP.x,
    y: u * u * JOINT.y + 2 * u * t * BEND.y + t * t * TIP.y,
  };
}

/** Ribs hanging from the spine: short at the joint, longest a third along, nothing at the tip. */
const RIBS = Array.from({ length: 11 }, (_, i) => {
  const t = (i + 1) / 12;
  const from = spine(t);
  const reach = 10 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.6)), 0.8);
  // Rounded: the server and the browser print long floats differently, and
  // an attribute that differs by its last digit is a hydration mismatch.
  const r = (n: number) => Math.round(n * 100) / 100;
  return { x1: r(from.x), y1: r(from.y), x2: r(from.x - 2.5), y2: r(from.y + reach) };
});

const SAIL = `M${JOINT.x} ${JOINT.y} Q${BEND.x} ${BEND.y} ${TIP.x} ${TIP.y} Q${RIBS[6].x2 + 6} ${RIBS[6].y2 + 3} ${RIBS[3].x2} ${RIBS[3].y2} Q${RIBS[1].x2} ${RIBS[1].y2 + 1} ${JOINT.x} ${JOINT.y} Z`;

function Wing() {
  return (
    <g className={styles.wing}>
      <path className={styles.sail} d={SAIL} />
      {RIBS.map((r) => (
        <line key={r.x1} className={styles.rib} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
      ))}
      <path className={styles.spine} d={`M${JOINT.x} ${JOINT.y} Q${BEND.x} ${BEND.y} ${TIP.x} ${TIP.y}`} />
    </g>
  );
}

export default function SnitchMark({ open = false, className }: { open?: boolean; className?: string }) {
  const gold = useId();
  const cls = className ? `${styles.mark} ${className}` : styles.mark;
  return (
    <svg className={cls} viewBox="0 0 120 60" data-open={open} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={gold} cx="38%" cy="30%" r="75%">
          <stop className={styles.stopLight} offset="0%" />
          <stop className={styles.stopGold} offset="45%" />
          <stop className={styles.stopShade} offset="100%" />
        </radialGradient>
      </defs>

      <Wing />
      <g transform="translate(120 0) scale(-1 1)">
        <Wing />
      </g>

      {/* What is inside, seen once the lid lifts. */}
      <ellipse className={styles.hollow} cx="60" cy="34" rx="13" ry="4.5" />
      <circle className={styles.light} cx="60" cy="31" r="8" />

      <g className={styles.lower}>
        <path d="M47 34 A13 13 0 0 0 73 34 Z" fill={`url(#${gold})`} />
        <path className={styles.relief} d="M49 39 Q60 44 71 38" />
      </g>
      <g className={styles.lid}>
        <path d="M47 34 A13 13 0 0 1 73 34 Z" fill={`url(#${gold})`} />
        <path className={styles.relief} d="M50 30 Q58 22 70 29" />
      </g>

      <circle className={styles.joint} cx={JOINT.x} cy={JOINT.y} r="1.8" />
      <circle className={styles.joint} cx={120 - JOINT.x} cy={JOINT.y} r="1.8" />
    </svg>
  );
}
