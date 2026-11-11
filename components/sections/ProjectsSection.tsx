import { capabilityColor, projects } from "@/data/portfolioData";
import { AreaGem } from "@/components/molecules/AreaGems";
import Tag from "@/components/atoms/Tag";
import SectionHead from "@/components/molecules/SectionHead";
import Tile from "@/components/molecules/Tile";
import { projectHref } from "@/components/worlds/designed";
import WorkWeb from "@/components/organisms/WorkWeb/WorkWeb";
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
              <Tile href={projectHref(p.slug)}>
                <span className={styles.projectTop}>
                  <span className={styles.projectNum}>{p.num}</span>
                  <Tag>{p.tag}</Tag>
                </span>
                <h3 className={styles.projectName}>{p.title}</h3>
                {p.subtitle && <p className={styles.projectSub}>{p.subtitle}</p>}
                <span className={styles.projectCap}>
                  {/* a stone for every area it uses; the main one is named */}
                  <span className={styles.projectStones}>
                    {p.skills.map((label) => (
                      <AreaGem key={label} area={{ label, color: capabilityColor(label) }} />
                    ))}
                  </span>
                  {p.skills[0]}
                  <span className={styles.projectGo} aria-hidden="true">→</span>
                </span>
              </Tile>
            </li>
          ))}
        </ul>

        <WorkWeb />
      </div>
    </section>
  );
}
