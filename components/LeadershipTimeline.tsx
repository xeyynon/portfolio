"use client";
import { leadership, leadershipOrg } from "@/data/portfolioData";

export default function LeadershipTimeline() {
  return (
    <div className="wrap" style={{ paddingBottom: '30px' }}>
      <section className="leadership" id="leadership">
        <div className="section-head">
          <span className="eyebrow">LEADERSHIP</span>
          <span className="count">{String(leadership.length).padStart(2, '0')} STAGES</span>
        </div>
        <div className="leadership-org">{leadershipOrg}</div>

        <div className="leadership-list">
          {leadership.map((l: any) => (
            <div className={`leadership-item ${l.current || l.tag ? "current" : ""}`} key={l.role}>
              <div className="li-date">{l.date}</div>
              <div className="li-body">
                <div className="li-role">
                  {l.role}
                  {l.tag ? <span className="li-tag" style={{ background: 'var(--bg-light)', color: 'var(--muted-dark)', border: '1px solid var(--line-dark)' }}>{l.tag}</span> : l.current ? <span className="li-tag">CURRENT</span> : null}
                </div>
                <div className="li-range">{l.range}</div>
              </div>
              <div className="li-gain" aria-label={`Gain level ${l.gain} of 4`}>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={n <= l.gain ? "seg filled" : "seg"} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
