import Link from "next/link";
import Image from "next/image";
import { personalInfo, experience, projects, achievements, skills, projectLabel } from "@/data/portfolioData";
import ScrollSceneProvider from "@/components/ScrollSceneProvider";
import PrismScene from "@/components/PrismScene";
import LeadershipTimeline from "@/components/LeadershipTimeline";

// Homepage project groups, by kind of work (TARANG: group by kind of claim).
const PROJECT_GROUPS = [
  { key: "software", label: "SOFTWARE" },
  { key: "embedded", label: "EMBEDDED" },
] as const;

const SPECTRUM = [
  { token: "--v400", nm: 400 },
  { token: "--v450", nm: 450 },
  { token: "--v500", nm: 500 },
  { token: "--v560", nm: 560 },
  { token: "--v600", nm: 600 },
  { token: "--v680", nm: 680 },
];

export default function Home() {
  return (
    <>
      <ScrollSceneProvider>
        <div className="scene-pin">
          <PrismScene />
        </div>

        <div className="scene-content">
          <div className="wrap hero scene-overlay">
            <div className="chipbar">
              {SPECTRUM.map((s) => (
                <span key={s.token} className="chip" style={{ background: `var(${s.token})` }}>{s.nm}nm</span>
              ))}
              <span className="quote">&quot;Learn something new every day.&quot;</span>
            </div>
            <h1>{personalInfo.name.toUpperCase()}</h1>
          </div>

          {/* No gap here: the hero already ends at the prism's base. */}

          {/* Positioned right after Hero, before Projects: the credential
              that makes every project below read as "already working the
              job," not just student work. Accent
              is --vwhite (all wavelengths combined), not a 7th spectrum
              hue — this is the light source the six capabilities disperse
              from, not another band in the spectrum. .scene-panel (not just
              .wrap) matches Projects' own glass-panel treatment directly
              below it — the first version skipped the panel background,
              which read as a design mismatch next to Selected Work. */}
          <div className="scene-panel scene-overlay">
            <div className="wrap" id="experience">
              <div className="section-head">
                <h2 className="eyebrow">EXPERIENCE</h2>
                {experience.status === "current" && (
                  <span className="count">CURRENT</span>
                )}
              </div>
              <div>
                <div>
                  <div className="exp-role">
                    {experience.role} <span className="exp-at">at</span>{" "}
                    {experience.companyUrl ? (
                      <a
                        href={experience.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="exp-company"
                      >
                        {experience.company}
                      </a>
                    ) : (
                      <span className="exp-company">{experience.company}</span>
                    )}
                  </div>
                  <div className="exp-period">{experience.period}</div>
                  {/* One result line per product; the full description stays
                      one click away (relocate, don't delete). Native
                      <details> is keyboard-operable with no script. */}
                  <ul className="exp-grid">
                    {experience.highlights.map((h) => (
                      <li key={h.lead} className="exp-card">
                        <h3 className="exp-lead">{h.lead}</h3>
                        <p className="exp-summary">{h.summary}</p>
                        <details className="exp-more">
                          <summary>Details</summary>
                          <p>{h.text}</p>
                        </details>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="scene-gap" aria-hidden="true" />

          {/* ABOUT as a bento (Bento Grid + dark OLED + Swiss type, chosen by
              the owner 2026-10-11): one fact per solid tile, tiles of
              different sizes, the spectrum only as small marks. */}
          <div className="scene-panel scene-overlay">
            <div className="wrap" id="about">
              <div className="section-head">
                <h2 className="eyebrow">ABOUT</h2>
              </div>
              <div className="bento">
                <div className="tile tile-photo span-3 md-6 sm-12">
                  <Image
                    src="/sources/myImage.jpg"
                    alt="Surya Pratik speaking at a lectern"
                    fill
                    sizes="(max-width: 560px) 90vw, (max-width: 900px) 45vw, 25vw"
                    className="object-cover"
                  />
                </div>

                <div className="tile tile-statement span-9 md-6 sm-12">
                  <p className="bento-headline">{personalInfo.headline}</p>
                  <p className="bento-focus">{personalInfo.focus}</p>
                  <p className="bento-belief">{personalInfo.belief}</p>
                  <div className="bento-sign">
                    <p className="bento-motto">
                      {personalInfo.title.split(".").filter(Boolean).map((word, i) => (
                        <span key={i} className={`animate-pulse-${i % 3} mr-1.5 inline-block`}>
                          {word.trim()}.
                        </span>
                      ))}
                    </p>
                    <div className="swatches" aria-hidden="true">
                      {SPECTRUM.map((s) => (
                        <span key={s.token} className="sw" style={{ background: `var(${s.token})` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tile tile-fact span-3 md-6 sm-6">
                  <span className="tile-label">Study</span>
                  <span className="tile-value">{personalInfo.education.degree}</span>
                  <span className="tile-note">
                    {personalInfo.education.school} · {personalInfo.education.years}
                  </span>
                </div>

                <div className="tile tile-fact span-3 md-6 sm-6">
                  <span className="tile-label">CGPA</span>
                  <span className="tile-value tile-number">
                    {personalInfo.education.cgpa}
                    <span className="tile-unit">/10</span>
                  </span>
                </div>

                <div className="tile tile-fact span-3 md-6 sm-6">
                  <span className="tile-label">From</span>
                  <span className="tile-value">{personalInfo.hometown.city}</span>
                  <span className="tile-note">{personalInfo.hometown.region}</span>
                </div>

                <div className="tile tile-fact span-3 md-6 sm-6">
                  <span className="tile-label">Status</span>
                  <span className="tile-value tile-status">
                    <span className="status-dot" aria-hidden="true" />
                    {personalInfo.availability.headline}
                  </span>
                  <span className="tile-note">{personalInfo.availability.detail}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="scene-gap" aria-hidden="true" />

          <div className="scene-panel scene-overlay">
            <div className="wrap" id="projects">
              <div className="section-head">
                <h2 className="eyebrow">SELECTED WORK</h2>
                <span className="count">{String(projects.length).padStart(2, '0')} TOTAL</span>
              </div>

              {PROJECT_GROUPS.map((group) => {
                const list = projects.filter((p) => p.category === group.key);
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
                            {/* Dot plus word: the dot names its colour (the
                                project's main capability); the tag is plain text. */}
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
          </div>

          {/* Achievements, Leadership and Skills are glass bands riding the
              same persistent scene as Hero/Projects/About. .scene-gap is empty
              space (not padding) between each, so the prism is genuinely
              visible in the gap, not just tinted through glass. */}
          <div className="scene-gap" aria-hidden="true" />

          <div className="scene-panel scene-overlay" id="achievements">
            <div className="wrap">
              <div className="section-head">
                <h2 className="eyebrow">ACHIEVEMENTS</h2>
              </div>
              {/* Bento: the two featured wins as half-width tiles, the rest
                  as quarter tiles. An award with a project page is a link
                  tile; the event is the label, the result is the value. */}
              <ul className="bento">
                {achievements.map((ach) => {
                  const project = ach.slug ? projects.find((p) => p.slug === ach.slug) : undefined;
                  const body = (
                    <>
                      <span className="tile-label">{ach.event}</span>
                      <span className="ach-value">{ach.title}</span>
                      <span className="tile-note">{project ? projectLabel(project) : ach.sub}</span>
                      {ach.achievement && <span className="ach-detail">{ach.achievement}</span>}
                      {project && <span className="ach-go" aria-hidden="true">View project →</span>}
                    </>
                  );
                  return (
                    <li
                      key={`${ach.title}-${ach.event}`}
                      className={ach.featured ? "span-6 md-6 sm-12" : "span-3 md-6 sm-12"}
                    >
                      {project ? (
                        <Link
                          href={`/projects/${project.slug}`}
                          className={`tile ach-tile tile-link${ach.featured ? " is-featured" : ""}`}
                        >
                          {body}
                        </Link>
                      ) : (
                        <div className={`tile ach-tile${ach.featured ? " is-featured" : ""}`}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="scene-gap" aria-hidden="true" />

          <div className="scene-panel scene-overlay">
            <LeadershipTimeline />
          </div>

          <div className="scene-gap" aria-hidden="true" />

          <div className="scene-panel scene-overlay" id="skills">
            <div className="wrap">
              <div className="section-head">
                <h2 className="eyebrow">SKILLS</h2>
              </div>
              {/* Bento: wide tiles alternate sides (AI / ML first, Hardware
                  last) so the two rows don't read as one uniform grid. No
                  "used in" list: each project card already names its
                  capability (one home per fact). */}
              <ul className="bento">
                {skills.map((s, i) => {
                  const wide = i === 0 || i === skills.length - 1;
                  return (
                    <li key={s.label} className={wide ? "span-6 md-6 sm-12" : "span-3 md-6 sm-12"}>
                      <div className="tile skill-tile" style={{ "--skill-color": s.color } as React.CSSProperties}>
                        <h3 className="skill-label">{s.label}</h3>
                        <ul className="skill-items">
                          {s.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="scene-gap" aria-hidden="true" />

          <div className="scene-panel scene-overlay" id="contact">
            <div className="wrap contact">
              <h2>Let&apos;s build something together.</h2>
              <p className="lede">Open to AI/ML, software and Flutter internships. Available to join immediately.</p>
              {/* Each way to reach out is a link tile that shows the actual
                  detail (address, handle), not a bare "EMAIL" button. */}
              <ul className="bento contact-bento">
                <li className="span-4 md-6 sm-12">
                  <a className="tile tile-link contact-tile" href="mailto:pratiksurya1207@gmail.com">
                    <span className="tile-label">Email</span>
                    <span className="contact-value">pratiksurya1207@gmail.com</span>
                  </a>
                </li>
                <li className="span-4 md-6 sm-12">
                  <a
                    className="tile tile-link contact-tile"
                    href="https://drive.google.com/drive/folders/1VjUdrDwPhYxG0RvFJxR1G3ilHIyyd9AT?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="tile-label">Resume</span>
                    <span className="contact-value">View resume ↗</span>
                  </a>
                </li>
                <li className="span-2 md-6 sm-6">
                  <a className="tile tile-link contact-tile" href="https://github.com/xeyynon" target="_blank" rel="noopener noreferrer">
                    <span className="tile-label">GitHub</span>
                    <span className="contact-value">xeyynon ↗</span>
                  </a>
                </li>
                <li className="span-2 md-6 sm-6">
                  <a className="tile tile-link contact-tile" href="https://www.linkedin.com/in/suryapratik/" target="_blank" rel="noopener noreferrer">
                    <span className="tile-label">LinkedIn</span>
                    <span className="contact-value">suryapratik ↗</span>
                  </a>
                </li>
              </ul>
              <footer>
                <span>© 2026 {personalInfo.name.toUpperCase()}</span>
                <span>400 → 680 nm</span>
              </footer>
            </div>
          </div>

          {/* No spacer after this: the scene span is the whole page, so at the
              bottom the pinned prism already fills the screen. The old 100dvh
              spacer only added empty scroll past the footer. */}
        </div>
      </ScrollSceneProvider>
    </>
  );
}
