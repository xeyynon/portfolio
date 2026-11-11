import type { ReactNode } from "react";
import Eyebrow from "@/components/atoms/Eyebrow";
import Tile from "./Tile";
import styles from "./molecules.module.css";

/** Molecule: one fact per tile. A small label over a large value, with an optional note. */
export default function FactTile({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <Tile className={styles.fact}>
      <Eyebrow as="span">{label}</Eyebrow>
      <span>
        <span className={styles.factValue}>{value}</span>
        {note && <span className={styles.factNote}>{note}</span>}
      </span>
    </Tile>
  );
}
