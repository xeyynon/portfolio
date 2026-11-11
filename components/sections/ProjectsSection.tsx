import { projects } from "@/data/portfolioData";
import CapDot from "@/components/atoms/CapDot";
import Tag from "@/components/atoms/Tag";
import SectionHead from "@/components/molecules/SectionHead";
import Tile from "@/components/molecules/Tile";
import styles from "./sections.module.css";

/** Section: every project, each a way into its own page. */
export default function ProjectsSection() {
  return (
    <section className={styles.section} id="projects" aria-labelledby="projects-title">
      <div className={styles.wrap}>
        <SectionHead
          eyebrow="03"
          title="My projects"
          id="projects-title"
          aside={`${String(projects.length).padStart(2, "0")} in all`}
        />

        <ul className={styles.grid}>
          {projects.map((p, i) => (
            <li key={p.slug} className={i === 0 ? styles.c12 : styles.c4}>
              <Tile href={`/projects/${p.slug}`}>
                <span className={styles.projectTop}>
                  <span className={styles.projectNum}>{p.num}</span>
                  <Tag>{p.tag}</Tag>
                </span>
                <h3 className={styles.projectName}>{p.title}</h3>
                {p.subtitle && <p className={styles.projectSub}>{p.subtitle}</p>}
                <span className={styles.projectCap}>
                  <CapDot color={p.color} />
                  {p.skills[0]}
                  <span className={styles.projectGo} aria-hidden="true">→</span>
                </span>
              </Tile>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
