import Link from "next/link";
import type { Project } from "@/data/portfolioData";
import Eyebrow from "@/components/atoms/Eyebrow";
import Tag from "@/components/atoms/Tag";
import { AreaCollector, AreaGem } from "@/components/molecules/AreaGems";
import { projectHref } from "@/components/worlds/designed";
import type { World } from "@/components/worlds/types";
import { capabilityColor, projects } from "@/data/portfolioData";
import CommandPalette from "@/components/organisms/CommandPalette/CommandPalette";
import { buildCommands } from "@/lib/commands";
import LevelEscape from "./LevelEscape";
import styles from "./ProjectPage.module.css";

type Props = {
  project: Project;
  world: World;
  /** Where the page was opened from, and where Esc and the back link return to. */
  backHref: string;
  prev?: Project;
  next?: Project;
};

/**
 * Organism: a designed project page. What is the same on every one lives
 * here: the way back, the title, and the facts in one fixed order (the
 * problem, what he built, the result, what it does not do, the stack), so a
 * reader always knows where to look. What is the project's own comes from its
 * world: the backdrop, the hero and the exhibits.
 */
export default function ProjectPage({ project, world, backHref, prev, next }: Props) {
  const Hero = world.hero.Component;
  return (
    <article className={`${styles.page} ${world.className}`} data-redesign>
      <LevelEscape href={backHref} />
      <AreaCollector labels={project.skills} />

      <header className={styles.bar}>
        <Link className={styles.back} href={backHref} title="Back to all projects (Esc)">
          <span aria-hidden="true">←</span> All projects
        </Link>
        <span className={styles.level}>
          {project.num} of {String(projects.length).padStart(2, "0")} · {project.short}
        </span>
        <CommandPalette commands={buildCommands("/lab/home")} />
      </header>

      <div className={styles.wrap}>
        <div className={styles.title}>
          <div className={styles.titleTop}>
            <span className={styles.num}>{project.num}</span>
            <Tag>{project.tag}</Tag>
          </div>
          <h1 className={styles.name}>{project.title}</h1>
          {project.subtitle && <p className={styles.subtitle}>{project.subtitle}</p>}

          <ul className={styles.meta}>
            {project.skills.map((label) => (
              <li key={label}>
                <AreaGem area={{ label, color: capabilityColor(label) }} />
                {label}
              </li>
            ))}
          </ul>

          {project.links && (project.links.live || project.links.github) && (
            <p className={styles.links}>
              {project.links.live && (
                <a className={styles.link} href={project.links.live} target="_blank" rel="noopener noreferrer">
                  Live demo <span aria-hidden="true">↗</span>
                </a>
              )}
              {project.links.github && (
                <a className={styles.link} href={project.links.github} target="_blank" rel="noopener noreferrer">
                  Code <span aria-hidden="true">↗</span>
                </a>
              )}
            </p>
          )}
        </div>

        <section className={styles.block} aria-labelledby="pp-hero">
          <Eyebrow as="h2" id="pp-hero">{world.hero.title}</Eyebrow>
          <Hero />
        </section>

        <section className={styles.block} aria-labelledby="pp-problem">
          <Eyebrow as="h2" id="pp-problem">The problem and the idea</Eyebrow>
          <p className={styles.lede}>{project.description}</p>
        </section>

        <section className={styles.block} aria-labelledby="pp-built">
          <Eyebrow as="h2" id="pp-built">What I built</Eyebrow>
          <ul className={styles.list}>
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>

        {project.metrics && project.metrics.length > 0 && (
          <section className={styles.block} aria-labelledby="pp-result">
            <Eyebrow as="h2" id="pp-result">The result</Eyebrow>
            <ul className={styles.metrics}>
              {project.metrics.map((m) => (
                <li key={m.label} className={styles.metric}>
                  <span className={styles.metricValue}>{m.value}</span>
                  <span className={styles.metricLabel}>{m.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {world.exhibits.map(({ title, Component }, i) => (
          <section key={title} className={styles.block} aria-labelledby={`pp-exhibit-${i}`}>
            <Eyebrow as="h2" id={`pp-exhibit-${i}`}>{title}</Eyebrow>
            <Component />
          </section>
        ))}

        {project.limits && project.limits.length > 0 && (
          <section className={styles.block} aria-labelledby="pp-limits">
            <Eyebrow as="h2" id="pp-limits">What it does not do</Eyebrow>
            <ul className={styles.list}>
              {project.limits.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>
        )}

        {project.nextTime && (
          <section className={styles.block} aria-labelledby="pp-next">
            <Eyebrow as="h2" id="pp-next">What I would do differently</Eyebrow>
            <p className={styles.lede}>{project.nextTime}</p>
          </section>
        )}

        <section className={styles.block} aria-labelledby="pp-stack">
          <Eyebrow as="h2" id="pp-stack">Stack</Eyebrow>
          <ul className={styles.stack}>
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        <nav className={styles.around} aria-label="Other projects">
          {prev ? (
            <Link className={styles.neighbour} href={projectHref(prev.slug)}>
              <span className={styles.neighbourLabel}>Previous</span>
              <span className={styles.neighbourName}>{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className={`${styles.neighbour} ${styles.neighbourNext}`} href={projectHref(next.slug)}>
              <span className={styles.neighbourLabel}>Next</span>
              <span className={styles.neighbourName}>{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  );
}
