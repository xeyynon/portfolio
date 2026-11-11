import type { CSSProperties } from "react";
import styles from "./atoms.module.css";

/**
 * Atom: a capability's colour as a small mark. Colour is never the only cue,
 * so it is decorative here and always sits beside the capability's name.
 */
export default function CapDot({ color }: { color: string }) {
  return <span className={styles.dot} style={{ "--dot-color": color } as CSSProperties} aria-hidden="true" />;
}
