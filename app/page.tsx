import Link from "next/link";
import Image from "next/image";
import { personalInfo, projects, achievements, skills } from "@/data/portfolioData";
import PrismHero from "@/components/PrismHero";
import LeadershipTimeline from "@/components/LeadershipTimeline";

const SPECTRUM = [
  { token: "--v400", nm: 400 },
  { token: "--v450", nm: 450 },
  { token: "--v500", nm: 500 },
  { token: "--v560", nm: 560 },
  { token: "--v600", nm: 600 },
  { token: "--v680", nm: 680 },
];

export default function Home() {
  // Explicit join on the `skills` field each project declares, rather than
  // substring-matching skill names against prose.
  const projectsUsing = (skillLabel: string) =>
    projects.filter((p) => p.skills.includes(skillLabel));

  return (
    <>
      <section className="dark-panel">
        <div className="wrap hero">
          <div className="chipbar">
            {SPECTRUM.map((s) => (
              <span key={s.token} className="chip" style={{ background: `var(${s.token})` }}>{s.nm}nm</span>
            ))}
            <span className="quote">&quot;Learn something new every day.&quot;</span>
          </div>
          <h1>{personalInfo.name.toUpperCase()}</h1>

          <PrismHero />
        </div>

        <div className="wrap" id="projects">
          <div className="section-head">
            <span className="eyebrow">SELECTED WORK</span>
            <span className="count">{String(projects.length).padStart(2, '0')} TOTAL</span>
          </div>

          {projects.map((proj) => (
            <Link href={`/projects/${proj.slug}`} key={proj.slug} className="project block" id={`p${parseInt(proj.num)}`}>
              <div className="prow">
                <span className="pbar" style={{ background: proj.color }}></span>
                <span className="pnum">{proj.num}</span>
                <span>
                  <div className="ptitle">{proj.title}</div>
                  <div className="ppipe">{proj.pipeline}</div>
                </span>
                <span className="ptag" style={{ color: proj.color, borderColor: proj.color }}>{proj.tag}</span>
                <span className="pchev">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="light-panel" id="about">
        <div className="wrap about">
          <div className="section-head">
            <span className="eyebrow">ABOUT</span>
          </div>
          <div className="about-grid">
            <div className="about-photo">
              <Image src="/sources/myImage.jpg" alt="Surya Pratik" fill className="object-cover" />
            </div>
            <div className="about-copy">
              <p style={{ fontWeight: '500', marginBottom: '12px', fontSize: '16px' }}>
                {personalInfo.title.split('.').filter(Boolean).map((word, i) => {
                  return (
                    <span 
                      key={i} 
                      className={`animate-pulse-${i % 3} mr-1.5 inline-block`}
                    >
                      {word.trim()}.
                    </span>
                  );
                })}
              </p>
              <p>{personalInfo.education}</p>
              <p style={{ marginTop: '12px' }}>{personalInfo.summary}</p>
              <div className="swatches" aria-hidden="true">
                {SPECTRUM.map((s) => (
                  <span key={s.token} className="sw" style={{ background: `var(${s.token})` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="light-panel">
        <LeadershipTimeline />
      </section>

      <section className="light-panel" id="achievements">
        <div className="wrap" style={{ paddingBottom: '30px' }}>
          <div className="section-head">
            <span className="eyebrow">ACHIEVEMENTS</span>
            <span className="count" style={{ color: 'var(--muted-light)' }}>{String(achievements.length).padStart(2, '0')} TOTAL</span>
          </div>
          <ul className="ach-list">
            {achievements.map((ach) => {
              const project = projects.find((p) => p.slug === ach.slug);
              return (
                <li key={`${ach.slug}-${ach.event}`} className="ach">
                  <span className="ach-year">{ach.year}</span>
                  <span>
                    {project ? (
                      <Link href={`/projects/${project.slug}`} className="ach-title ach-link">
                        {ach.title} — {ach.event}
                      </Link>
                    ) : (
                      <span className="ach-title">{ach.title} — {ach.event}</span>
                    )}
                    <span className="ach-sub">{project?.title ?? ach.slug}</span>
                    <span className="ach-sub ach-detail">{ach.achievement}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="light-panel" id="skills">
        <div className="wrap" style={{ paddingBottom: '56px' }}>
          <div className="section-head">
            <span className="eyebrow">TECHNICAL SKILLS</span>
          </div>
          <div className="skill-grid">
            {[...skills].sort((a, b) => b.level - a.level).map((s) => {
              const usedIn = projectsUsing(s.label);

              return (
                <div key={s.label} className="skill">
                  <span className="skill-bar" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
                  <h4 className="skill-label">{s.label}</h4>
                  <p className="skill-items">{s.items.join(" · ")}</p>

                  <div className="skill-meter" aria-label={`Proficiency ${s.level} of 4`}>
                    <span className="skill-segs" aria-hidden="true">
                      {[1, 2, 3, 4].map((n) => (
                        <span
                          key={n}
                          className="seg"
                          style={{ background: n <= s.level ? s.color : "var(--line-light)" }}
                        />
                      ))}
                    </span>
                    <span className="skill-level" aria-hidden="true">{s.level}/4</span>
                  </div>

                  {usedIn.length > 0 && (
                    <p className="skill-used">
                      <span className="skill-used-label">Used in</span>
                      {usedIn.map((p) => (
                        <Link key={p.slug} href={`/projects/${p.slug}`} className="skill-used-link">
                          {p.short}
                        </Link>
                      ))}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="dark-panel" id="contact">
        <div className="wrap contact">
          <h2>Let&apos;s build something together.</h2>
          <p className="lede mb-4">Open to internships, research collaborations, and exciting opportunities.</p>
          <span className="inline-flex items-center gap-2 text-xs font-mono text-[var(--muted-dark)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--v500)] animate-pulse shadow-[0_0_8px_var(--v500)]" />
            Currently open to opportunities
          </span>
          <div className="contact-row">
            <a className="btn" href="mailto:suryapratik12@gmail.com" target="_blank" rel="noopener noreferrer">EMAIL →</a>
            <a className="btn" href="https://github.com/xeyynon" target="_blank" rel="noopener noreferrer">GITHUB →</a>
            <a className="btn" href="https://www.linkedin.com/in/suryapratik/" target="_blank" rel="noopener noreferrer">LINKEDIN →</a>
            <a className="btn" href="https://drive.google.com/drive/folders/1VjUdrDwPhYxG0RvFJxR1G3ilHIyyd9AT?usp=sharing" target="_blank" rel="noopener noreferrer">RESUME →</a>
          </div>
        </div>
        <div className="wrap">
          <footer>
            <span>© 2026 {personalInfo.name.toUpperCase()}</span>
            <span>400–680nm</span>
          </footer>
        </div>
      </section>
    </>
  );
}
