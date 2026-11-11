import type { CSSProperties } from "react";
import GemCut from "./GemCut";
import styles from "./atoms.module.css";

/**
 * Atom: one of the six stones, the same cut stone wherever it appears (the
 * bar, About me, the opening's legend, the gauntlet): a round brilliant in a
 * thin gold setting. Unlit, the stone sits dim in its setting; while it is
 * elsewhere (`data-away`, set by StoneFlight) the setting shows as a dashed,
 * empty socket.
 *
 * Decorative: the area's name is always beside it, and whether it is lit is
 * also said in words where that matters.
 */
export default function Gem({ color, lit = true, className }: { color: string; lit?: boolean; className?: string }) {
  return (
    <span
      className={className ? `${styles.gem} ${className}` : styles.gem}
      data-gem
      data-lit={lit}
      style={{ "--gem-color": color } as CSSProperties}
      aria-hidden="true"
    >
      <svg className={styles.gemSvg} viewBox="-1.05 -1.05 2.1 2.1" focusable="false">
        <GemCut />
      </svg>
    </span>
  );
}
