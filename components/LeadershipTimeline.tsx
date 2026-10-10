"use client";
import { leadership, leadershipOrg, leadershipHighlight } from "@/data/portfolioData";

/**
 * Leadership as a bento (Bento Spectrum style): the chapter's result and its
 * three numbers as tiles, then the four roles as steps along one journey tile.
 * The latest role is marked with a dot plus a word, not a boxed tag.
 */
export default function LeadershipTimeline() {
  return (
    <div className="wrap">
      <section className="leadership" id="leadership">
        <div className="section-head">
          <h2 className="eyebrow">LEADERSHIP</h2>
          <span className="count">{String(leadership.length).padStart(2, "0")} STAGES</span>
        </div>

        <div className="lead-bento">
          <div className="tile lead-result">
            <span className="tile-label">{leadershipOrg}</span>
            <span className="lead-result-value">{leadershipHighlight.result}</span>
            <span className="tile-note">{leadershipHighlight.when}</span>
          </div>

          {leadershipHighlight.stats.map((s) => (
            <div className="tile tile-fact" key={s.label}>
              <span className="tile-label">{s.label}</span>
              <span className="tile-value tile-number">{s.value}</span>
            </div>
          ))}

          <div className="tile lead-journey">
            <span className="tile-label">Roles, in order</span>
            <ol className="lead-steps">
              {leadership.map((l) => (
                <li className="lead-step" data-current={l.tag ? "true" : undefined} key={l.role}>
                  <span className="lead-node" aria-hidden="true" />
                  <span className="lead-range">{l.range}</span>
                  <span className="lead-role">{l.role}</span>
                  {l.tag && (
                    <span className="lead-now">
                      <span className="status-dot" aria-hidden="true" />
                      Latest
                    </span>
                  )}
                  <span className="li-gain" role="img" aria-label={`Responsibility level ${l.gain} of 4`}>
                    {[1, 2, 3, 4].map((n) => (
                      <span key={n} className={n <= l.gain ? "seg filled" : "seg"} aria-hidden="true" />
                    ))}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
