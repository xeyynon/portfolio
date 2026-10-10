"use client";
import { leadership, leadershipOrg, leadershipHighlight } from "@/data/portfolioData";

/**
 * Leadership as a bento (Bento Spectrum style): the chapter's result and its
 * three numbers as tiles, then the four roles as steps along one journey tile.
 * Nothing else: the meters, a "Latest" tag, a step count and a "roles, in
 * order" label were all removed as saying what the layout already says.
 */
export default function LeadershipTimeline() {
  return (
    <div className="wrap">
      <section className="leadership" id="leadership">
        <div className="section-head">
          <h2 className="eyebrow">LEADERSHIP</h2>
        </div>

        <div className="bento lead-bento">
          <div className="tile lead-result span-6 md-12 sm-12">
            <span className="tile-label">{leadershipOrg}</span>
            <span className="lead-result-value">{leadershipHighlight.result}</span>
            <span className="tile-note">{leadershipHighlight.when}</span>
          </div>

          {leadershipHighlight.stats.map((s) => (
            <div className="tile tile-fact span-2 md-4 sm-4" key={s.label}>
              <span className="tile-label">{s.label}</span>
              <span className="tile-value tile-number">{s.value}</span>
            </div>
          ))}

          <div className="tile lead-journey span-12">
            <ol className="lead-steps" aria-label="Roles, oldest first">
              {leadership.map((l) => (
                <li className="lead-step" data-current={l.current ? "true" : undefined} key={l.role}>
                  <span className="lead-node" aria-hidden="true" />
                  <span className="lead-range">{l.range}</span>
                  <span className="lead-role">{l.role}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
