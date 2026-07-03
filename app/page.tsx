import Link from "next/link";
import { personalInfo, projects, achievements, skills } from "@/data/portfolioData";
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
              <span key={c} className="chip" style={{ background: `var(${c})` }}>{[400, 450, 500, 560, 600, 680][i]}nm</span>
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
              const pmatch = projects.find(p => p.slug.includes(ach.project) || ach.project.includes(p.slug));
              return (
                <div key={i} className="ach">
                  <span className="ach-year">{year}</span>
                  <span>
                    {pmatch ? (
                      <Link href={`/projects/${pmatch.slug}`} className="ach-title hover:text-[var(--v500)] transition-colors inline-block">{ach.title} — {ach.event}</Link>
                    ) : (
                      <span className="ach-title">{ach.title} — {ach.event}</span>
                    )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--line-light)] border border-[var(--line-light)] mt-[20px]">
            {skills.map((s) => (
              <div key={s.label} className="bg-[var(--bg-light)] p-6 transition-colors hover:bg-[#eeece3]">
                <span className="block w-7 h-[3px] mb-2.5" style={{ background: s.color }} />
                <h4 className="text-[12.5px] font-semibold text-[var(--ink-lo)] uppercase tracking-wider">{s.label}</h4>
                <p className="font-mono text-[9.5px] text-[var(--muted-light)] mt-1.5 leading-relaxed">{s.items.join(" · ")}</p>
                <div className="flex gap-[3px] mt-3">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={`w-[5px] h-[12px] ${n <= s.level ? "shadow-[0_0_4px_" + s.color + "]" : ""}`}
                      style={{ background: n <= s.level ? s.color : "var(--line-light)" }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-panel" id="contact">
        <div className="wrap contact">
          <h2>Let's build something together.</h2>
          <p className="lede mb-4">Open to internships, research collaborations, and exciting opportunities.</p>
          <span className="inline-flex items-center gap-2 text-xs font-mono text-[var(--muted-dark)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--v500)] animate-pulse shadow-[0_0_8px_var(--v500)]" />
            Currently open to opportunities
          </span>
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
