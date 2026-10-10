"use client";
import { leadership, leadershipOrg, leadershipSummary } from "@/data/portfolioData";

export default function LeadershipTimeline() {
  return (
    <div className="wrap" style={{ paddingBottom: '30px' }}>
      <section className="leadership" id="leadership">
        <div className="section-head">
          <h2 className="eyebrow">LEADERSHIP</h2>
          <span className="count">{String(leadership.length).padStart(2, '0')} STAGES</span>
        </div>
        <div className="leadership-org">{leadershipOrg}</div>
        <p className="leadership-summary">{leadershipSummary}</p>

        <ol className="leadership-list">
          {leadership.map((l) => (
            <li className={`leadership-item ${l.tag ? "current" : ""}`} key={l.role}>
              <span className="li-date">{l.date}</span>
              <span className="li-body">
                <span className="li-role">
                  {l.role}
                  {l.tag && <span className="li-tag">{l.tag}</span>}
                </span>
                <span className="li-range">{l.range}</span>
              </span>
              <span className="li-gain" role="img" aria-label={`Responsibility level ${l.gain} of 4`}>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={n <= l.gain ? "seg filled" : "seg"} aria-hidden="true" />
                ))}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
