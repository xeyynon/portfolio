import Link from "next/link";
import { projects, skills } from "@/data/portfolioData";
import { AreaGem } from "@/components/molecules/AreaGems";
import { projectHref } from "@/components/worlds/designed";
import Gauntlet from "./Gauntlet";
import GauntletStones from "./GauntletStones";
import { SNAP_POINT } from "./hand";
import Snap from "./Snap";
import { HEIGHT, WIDTH, areaSpot, projectSpot, thread } from "./web";
import styles from "./WorkWeb.module.css";

/**
 * Organism: the web. Every project hangs on the outer ring, and a thread runs
 * from it to the stone of each area of work it uses. The six stones are set
 * in a gauntlet at the centre: everything built draws on the same six.
 * Pointing at a project, or reaching it with the keyboard, brightens its
 * threads and its stones and dims the rest; each project is a link to its
 * page, and says its areas in words.
 *
 * On a phone it is shown close up, the gauntlet and its threads without the
 * names round it; the list of projects above carries the same links.
 */
export default function WorkWeb() {
  const stones = skills.map((s, i) => ({
    label: s.label,
    color: s.color,
    ...areaSpot(i),
  }));
  return (
    <figure className={styles.web}>
      <div className={styles.stage} data-phase="idle">
        <svg
          className={styles.svg}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="group"
          aria-label="Projects joined to the areas of work they use"
        >
          {projects.map((p, i) => {
            const spot = projectSpot(i, projects.length);
            const uses = p.skills
              .map((label) => stones.findIndex((s) => s.label === label))
              .filter((n) => n >= 0);
            return (
              <g
                key={p.slug}
                className={styles.project}
                data-a={uses.join(" ")}
                data-project
              >
                {uses.map((n) => (
                  <path
                    key={n}
                    className={styles.thread}
                    d={thread(spot, stones[n])}
                    style={{ stroke: stones[n].color }}
                  />
                ))}
                <Link
                  href={projectHref(p.slug)}
                  className={styles.node}
                  aria-label={`${p.title}: ${p.skills.join(", ")}`}
                >
                  <circle
                    className={styles.dot}
                    cx={spot.x}
                    cy={spot.y}
                    r="5"
                  />
                  <text
                    className={styles.name}
                    x={spot.labelX}
                    y={spot.labelY}
                    textAnchor={spot.anchor}
                  >
                    {p.short}
                  </text>
                </Link>
              </g>
            );
          })}
          <g className={styles.hand}>
            <Gauntlet />
            <GauntletStones stones={stones} />
          </g>
          {/* the snap: a flash where the fingers meet, and a ring that breaks outward */}
          <circle
            className={styles.flash}
            cx={SNAP_POINT.x}
            cy={SNAP_POINT.y}
            r="40"
          />
          <circle
            className={styles.shock}
            cx={SNAP_POINT.x}
            cy={SNAP_POINT.y}
            r="30"
          />
        </svg>
        <Snap />
      </div>
      <figcaption className={styles.caption}>
        <ul className={styles.key}>
          {skills.map((s) => (
            <li key={s.label}>
              <AreaGem area={{ label: s.label, color: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
        <p>
          Each thread joins a project to the stone of an area it uses, in that
          area&apos;s colour. A stone burns once you have opened a project that
          uses it. Point at a project to follow its threads, or snap.
        </p>
      </figcaption>
    </figure>
  );
}
