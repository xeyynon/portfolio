"use client";

import { useState } from "react";
import { DOTS, FIELD, QUERIES, RADIUS, SEARCH_STEP, STEPS, TREE, search } from "./kdtree";
import styles from "./orca.module.css";

/**
 * Organism: the KD-tree search, on a flat field of made-up dots. Three
 * buttons show the catalog, the tree cut over it, and the search round one
 * object; a fourth moves the search to another object. The counts under the
 * picture are worked out from the tree that is drawn, and say what the
 * picture shows in words.
 */
export default function OrcaTree() {
  const [step, setStep] = useState<number>(SEARCH_STEP);
  const [turn, setTurn] = useState(0);

  const searching = step === SEARCH_STEP;
  const self = QUERIES[turn % QUERIES.length];
  const found = search(self);
  const inside = new Set(found.inside);

  const stateOf = (i: number) => {
    if (!searching) return "plain";
    if (i === self) return "self";
    return inside.has(i) ? "in" : "out";
  };

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.field}
        viewBox={`0 0 ${FIELD.width} ${FIELD.height}`}
        aria-hidden="true"
        focusable="false"
      >
        {searching &&
          found.opened.map((i) => {
            const { box } = TREE.leaves[i];
            return (
              <rect
                key={i}
                className={styles.opened}
                x={box.x0}
                y={box.y0}
                width={box.x1 - box.x0}
                height={box.y1 - box.y0}
              />
            );
          })}
        {step > 0 &&
          TREE.cuts.map((c, i) => <line key={i} className={styles.cut} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} />)}
        {searching && <circle className={styles.reach} cx={DOTS[self].x} cy={DOTS[self].y} r={RADIUS} />}
        {DOTS.map((d, i) => {
          const state = stateOf(i);
          return (
            <circle
              key={i}
              className={styles.dot}
              data-state={state}
              cx={d.x}
              cy={d.y}
              r={state === "self" ? 4 : state === "in" ? 3.2 : 2.2}
            />
          );
        })}
      </svg>

      <figcaption className={styles.caption}>
        <p className={styles.schematic}>
          A flat, made-up picture of the idea: {DOTS.length} invented dots and an invented radius. The real search runs
          over the 15,968-object catalog.
        </p>

        <ol className={styles.steps}>
          {STEPS.map((s, i) => (
            <li key={s.key}>
              <button type="button" className={styles.step} aria-pressed={step === i} onClick={() => setStep(i)}>
                <span className={styles.stepNum}>{i + 1}</span>
                {s.label}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={styles.replay}
              onClick={() => {
                setStep(SEARCH_STEP);
                setTurn((t) => t + 1);
              }}
            >
              Search another object
            </button>
          </li>
        </ol>

        <div className={styles.stepText} aria-live="polite">
          <p>{STEPS[step].text}</p>
          {searching && (
            <p className={styles.tally}>
              In this picture: {found.opened.length} of {TREE.leaves.length} boxes opened, {found.checked} of the other{" "}
              {DOTS.length - 1} dots measured, {found.inside.length} inside the radius.
            </p>
          )}
        </div>

        <ul className={styles.key}>
          <li>
            <span className={styles.keyObject} aria-hidden="true" />A pale dot is an object. The white one with a coral
            edge is the object being searched round.
          </li>
          <li>
            <span className={styles.keyApproach} aria-hidden="true" />
            Coral is the search: the dashed circle is the radius, the tinted boxes are the ones opened, and the coral
            dots are the candidates found.
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}
