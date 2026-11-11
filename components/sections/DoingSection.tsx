import { experience } from "@/data/portfolioData";
import SectionHead from "@/components/molecules/SectionHead";
import Tile from "@/components/molecules/Tile";
import styles from "./sections.module.css";

/** Section: what he is doing now. One tile per product, the result first, the detail one press away. */
export default function DoingSection() {
  return (
    <section className={styles.section} id="doing" aria-labelledby="doing-title">
      <div className={styles.wrap}>
        <SectionHead
          eyebrow="02"
          title="What I am doing"
          id="doing-title"
          aside={experience.status === "current" ? "Current" : undefined}
        />

        <p className={styles.role}>
          {experience.role} <span className={styles.roleAt}>at</span>{" "}
          {experience.companyUrl ? (
            <a className={styles.roleLink} href={experience.companyUrl} target="_blank" rel="noopener noreferrer">
              {experience.company}
            </a>
          ) : (
            experience.company
          )}
        </p>
        <p className={styles.period}>{experience.period}</p>

        <ul className={styles.grid}>
          {experience.highlights.map((h) => (
            <li key={h.lead} className={styles.c6}>
              <Tile>
                <h3 className={styles.workTitle}>{h.lead}</h3>
                <p className={styles.workText}>{h.summary}</p>
                <details className={styles.more}>
                  <summary>Details</summary>
                  <p>{h.text}</p>
                </details>
              </Tile>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
