"use client";
import Link from "next/link";
import { useState } from "react";
import { projectGroups, projects, skills } from "@/data/portfolioData";

/**
 * Selected Work: skill filter chips above the two project groups. A chip
 * shows only the projects that use that skill group (Project.skills); groups
 * with nothing left are hidden. Plain buttons with aria-pressed.
 */
export default function ProjectsSection() {
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter ? projects.filter((p) => p.skills.includes(filter)) : projects;

  return (
    <div className="wrap" id="projects">
      <div className="section-head">
        <h2 className="eyebrow">SELECTED WORK</h2>
        <span className="count" aria-live="polite">
          {String(shown.length).padStart(2, "0")} {filter ? "SHOWN" : "TOTAL"}
        </span>
      </div>

      <div className="pfilter" role="group" aria-label="Filter projects by skill">
        <button type="button" className="pfilter-chip" aria-pressed={filter === null} onClick={() => setFilter(null)}>
          All
        </button>
        {skills.map((s) => (
          <button
            key={s.label}
            type="button"
            className="pfilter-chip"
            aria-pressed={filter === s.label}
            onClick={() => setFilter(filter === s.label ? null : s.label)}
            style={{ "--chip-color": s.color } as React.CSSProperties}
          >
            <span className="pfilter-dot" aria-hidden="true" />
            {s.label}
          </button>
        ))}
      </div>

      {projectGroups.map((group) => {
        const list = shown.filter((p) => p.category === group.key);
        if (list.length === 0) return null;
        return (
          <div key={group.key} className="pgroup">
            <h3 className="pgroup-head">
              <span>{group.label}</span>
              <span className="pgroup-count">{String(list.length).padStart(2, "0")}</span>
            </h3>
            <ul className="pgrid">
              {list.map((proj) => (
                <li key={proj.slug}>
                  <Link
                    href={`/projects/${proj.slug}`}
                    className="pcard"
                    id={`p${parseInt(proj.num)}`}
                    style={{ "--card-accent": proj.color } as React.CSSProperties}
                  >
                    <span className="pcard-name">{proj.title}</span>
                    {proj.subtitle && <span className="pcard-sub">{proj.subtitle}</span>}
                    <span className="pcard-meta">
                      <span className="pdot" aria-hidden="true" />
                      <span>{proj.skills[0]}</span>
                      <span className="pcard-tag">{proj.tag}</span>
                      <span className="pcard-go" aria-hidden="true">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
