import type { ReactNode } from "react";
import styles from "./atoms.module.css";

/** Atom: the small uppercase tracked label above a value or a section. */
export default function Eyebrow({ children, as: Tag = "p", id }: { children: ReactNode; as?: "p" | "span" | "h2" | "h3"; id?: string }) {
  return (
    <Tag className={styles.eyebrow} id={id}>
      {children}
    </Tag>
  );
}
