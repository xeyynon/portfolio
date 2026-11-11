"use client";

import { useState } from "react";
import {
  EXTRACT_STEP,
  GRAPH_STEP,
  LEAD,
  LEAD_STEP,
  PEOPLE,
  REPORTS,
  RESOLVE_STEP,
  STEPS,
  resolvedName,
} from "./case";
import styles from "./surrag.module.css";

/** Where each node of the small graph sits, in the units of its viewBox. */
const NODES: Record<string, { x: number; y: number; label: string; kind: "case" | "person" }> = {
  "FIR 1": { x: 60, y: 34, label: "FIR 1", kind: "case" },
  "FIR 2": { x: 260, y: 34, label: "FIR 2", kind: "case" },
  ravi: { x: 160, y: 34, label: "Ravi Kumar", kind: "person" },
  suresh: { x: 60, y: 104, label: "Suresh", kind: "person" },
  imran: { x: 260, y: 104, label: "Imran", kind: "person" },
};

/**
 * Organism: from a report to a lead, on two made-up reports. Five buttons
 * step through the pipeline; each step adds its marks to the same reports,
 * so the reader sees the names picked out, the two spellings joined, the
 * graph they make and the lead that comes out, with the lines it cites.
 * Every mark is named in words beside it, not shown by colour alone.
 */
export default function SurragTrail() {
  const [step, setStep] = useState<number>(LEAD_STEP);

  return (
    <div className={styles.trail}>
      <p className={styles.schematic}>
        A made-up example. These two reports, their names and places are invented to show the steps; the live demo runs
        on synthetic reports, not real ones.
      </p>

      <ol className={styles.steps}>
        {STEPS.map((s, i) => (
          <li key={s.key}>
            <button
              type="button"
              className={styles.step}
              aria-pressed={step === i}
              data-done={i < step}
              onClick={() => setStep(i)}
            >
              <span className={styles.stepNum}>{i + 1}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      <p className={styles.stepText} aria-live="polite">
        {STEPS[step].text}
      </p>

      <div className={styles.reports}>
        {REPORTS.map((r) => (
          <article key={r.id} className={styles.report}>
            <h3 className={styles.reportId}>{r.id}</h3>
            <p className={styles.reportText}>
              {r.runs.map((run, k) => {
                if (!run.entity || step < EXTRACT_STEP) return <span key={k}>{run.text}</span>;
                const sameAs =
                  step >= RESOLVE_STEP && run.entity.person ? resolvedName(run.entity.person, run.text) : null;
                return (
                  <mark key={k} className={styles.entity} data-kind={run.entity.kind} data-joined={sameAs !== null}>
                    {run.text}
                    <span className={styles.entityTag}>
                      {run.entity.kind}
                      {sameAs && ` · same as ${sameAs}`}
                    </span>
                  </mark>
                );
              })}
            </p>
          </article>
        ))}
      </div>

      {step >= GRAPH_STEP && (
        <div className={styles.graph}>
          <svg className={styles.graphPicture} viewBox="0 0 320 130" aria-hidden="true" focusable="false">
            {PEOPLE.flatMap((p) =>
              p.reports.map((report) => {
                const a = NODES[report];
                const b = NODES[p.key];
                const inLead = step >= LEAD_STEP && p.key === "ravi";
                return (
                  <line
                    key={`${p.key}-${report}`}
                    className={styles.graphEdge}
                    data-lead={inLead}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                  />
                );
              }),
            )}
            {Object.entries(NODES).map(([key, n]) => (
              <g key={key}>
                {n.kind === "case" ? (
                  <rect className={styles.graphCase} x={n.x - 26} y={n.y - 12} width={52} height={24} rx={3} />
                ) : (
                  <circle className={styles.graphPerson} cx={n.x} cy={n.y} r={6} />
                )}
                <text
                  className={styles.graphLabel}
                  x={n.x}
                  y={n.kind === "case" ? n.y + 4 : n.y + 22}
                  textAnchor="middle"
                >
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
          <ul className={styles.graphList}>
            {PEOPLE.map((p) => (
              <li key={p.key}>
                <strong>{p.name}</strong> is named in {p.reports.join(" and ")}.
              </li>
            ))}
          </ul>
        </div>
      )}

      {step >= LEAD_STEP && (
        <div className={styles.lead}>
          <p className={styles.leadText}>
            <span className={styles.leadTag}>Lead</span>
            {LEAD.text}
          </p>
          <ul className={styles.citations}>
            {LEAD.citations.map((c) => (
              <li key={c.report}>
                <span className={styles.citeId}>{c.report}</span>
                <q>{c.line}</q>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
