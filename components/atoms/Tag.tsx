import type { ReactNode } from "react";
import styles from "./atoms.module.css";

/** Atom: a short status or kind, as a word in an outlined box. */
export default function Tag({ children }: { children: ReactNode }) {
  return <span className={styles.tag}>{children}</span>;
}
