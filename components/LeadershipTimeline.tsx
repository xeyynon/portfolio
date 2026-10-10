"use client";
import {
  leadership,
  leadershipEvents,
  leadershipOrg,
  leadershipHighlight,
  otherRoles,
  volunteering,
} from "@/data/portfolioData";

/**
 * Leadership as a bento (Bento Spectrum style): the chapter's result and its
 * three numbers as tiles, then the four roles as steps (each with one line on
 * what it involved) beside the events coordinated as Student Coordinator,
 * then roles outside the chapter (Vectr, the Entrepreneurship Club) and a
 * volunteering strip.
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

          <div className="tile lead-journey span-8 md-12">
            <ol className="lead-steps" aria-label="Roles, oldest first">
              {leadership.map((l) => (
                <li className="lead-step" data-current={l.current ? "true" : undefined} key={l.role}>
                  <span className="lead-node" aria-hidden="true" />
                  <span className="lead-range">{l.range}</span>
                  <span className="lead-role">{l.role}</span>
                  {l.did && <span className="lead-did">{l.did}</span>}
                </li>
              ))}
            </ol>
          </div>

          <div className="tile lead-events span-4 md-12 rows-2">
            <span className="tile-label">Events I coordinated</span>
            <ul className="lead-event-list">
              {leadershipEvents.map((e) => (
                <li key={e.name}>
                  <span>{e.name}</span>
                  <span className="lead-event-when">{e.when}</span>
                </li>
              ))}
            </ul>
          </div>

          {otherRoles.map((r) => (
            <div className="tile lead-other span-4 md-6 sm-12" key={r.org}>
              <span className="tile-label">{r.range}</span>
              <span className="lead-other-org">{r.org}</span>
              <span className="lead-other-role">{r.role}</span>
              <span className="tile-note">{r.note}</span>
            </div>
          ))}

          <div className="tile lead-vol span-12">
            <span className="tile-label">Volunteering</span>
            <ul className="lead-vol-list">
              {volunteering.map((v) => (
                <li key={v.event}>
                  <span className="lead-vol-event">{v.event}</span>
                  <span className="tile-note">
                    {v.role} · {v.org}
                  </span>
                  <span className="lead-event-when">{v.when}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
