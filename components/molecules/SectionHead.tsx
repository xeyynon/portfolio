import type { ReactNode } from "react";
import Eyebrow from "@/components/atoms/Eyebrow";
import styles from "./molecules.module.css";

type Props = {
  /** The small label above the title, e.g. "02". */
  eyebrow: string;
  title: string;
  /** Id of the heading, so the section can be labelled by it. */
  id: string;
  aside?: ReactNode;
};

/** Molecule: a section's heading row. The title is the section's h2. */
export default function SectionHead({ eyebrow, title, id, aside }: Props) {
  return (
    <div className={styles.head}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className={styles.headTitle} id={id}>
          {title}
        </h2>
      </div>
      {aside && <span className={styles.headAside}>{aside}</span>}
    </div>
  );
}
