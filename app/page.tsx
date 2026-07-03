import Link from "next/link";
import { personalInfo, projects, achievements, technicalSkills } from "@/data/portfolioData";
import PrismHero from "@/components/PrismHero";
import LeadershipTimeline from "@/components/LeadershipTimeline";

export default function Home() {
  const spectrumColors = ['--v400', '--v450', '--v500', '--v560', '--v600', '--v680'];

  return (
    <>
      <section className="dark-panel">
        <div className="wrap hero">
          <div className="chipbar">
            {spectrumColors.map((c, i) => (
              <span key={c} className="chip" style={{ background: `var(${c})` }}>{400 + i * 50}nm</span>
            ))}
            <span className="quote">&quot;Learn something new every day.&quot;</span>
          </div>
          <h1>{personalInfo.name.toUpperCase()}</h1>
          <p className="tagline">{personalInfo.summary}</p>

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
            <div className="about-photo"></div>
            <div className="about-copy">
              <p style={{ fontWeight: '500', marginBottom: '12px' }}>{personalInfo.title}</p>
              <p>{personalInfo.education}</p>
              <p style={{ marginTop: '12px' }}>{personalInfo.summary}</p>
              <div className="swatches">
                {spectrumColors.map(c => (
                  <span key={c} className="sw" style={{ background: `var(${c})` }}></span>
                ))}
                <span className="stat">{String(projects.length).padStart(2, '0')} projects · {String(achievements.length).padStart(2, '0')} awards</span>
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
          <div className="ach-list">
            {achievements.map((ach, i) => {
              const yearMatch = ach.event.match(/\d{4}/);
              const year = yearMatch ? yearMatch[0] : "----";
              return (
                <div key={i} className="ach">
                  <span className="ach-year">{year}</span>
                  <span>
                    <span className="ach-title">{ach.title} — {ach.event}</span>
                    <div className="ach-sub">{ach.project}</div>
                    <div className="ach-sub" style={{ fontSize: '9px', marginTop: '2px' }}>{ach.achievement}</div>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="light-panel" id="skills">
        <div className="wrap" style={{ paddingBottom: '56px' }}>
          <div className="section-head">
            <span className="eyebrow">TECHNICAL SKILLS</span>
          </div>
          <div className="certs">
            {Object.entries(technicalSkills).map(([category, skills], i) => (
              <div key={category} className="cert">
                <div className="cbar" style={{ background: `var(${spectrumColors[i % spectrumColors.length]})` }}></div>
                <h4 style={{ textTransform: 'capitalize' }}>{category.replace('_', ' ')}</h4>
                <p>{skills.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-panel" id="contact">
        <div className="wrap contact">
          <h2>Let's build something together.</h2>
          <p className="lede">Open to internships, research collaborations, and exciting opportunities.</p>
          <div className="contact-row">
            <a className="btn" href="mailto:you@example.com">EMAIL →</a>
            <a className="btn" href="#">GITHUB →</a>
            <a className="btn" href="#">LINKEDIN →</a>
            <a className="btn" href="#">RESUME →</a>
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
