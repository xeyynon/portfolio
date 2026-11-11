"use client";

import { useState } from "react";
import {
  EXAMPLE_NOTE,
  SHELF,
  mostAllowed,
  priceOrder,
  quantityText,
  rupees,
  sentences,
  stepped,
  type Note,
} from "./order";
import styles from "./dukaan.module.css";

/**
 * Organism: the split between the model and code. On the left is all the
 * model hands over: which items and how many, which the visitor can change.
 * On the right is everything code then does with it: the stock check, the
 * rounding, the total, and the sentences that state an amount.
 *
 * The shelf, the prices and the wording are an example written for this page,
 * not the agent's own code; the first line says so.
 */
export default function MoneySplit() {
  const [note, setNote] = useState<Note>(EXAMPLE_NOTE);
  const order = priceOrder(note);
  const said = sentences(order);

  return (
    <div className={styles.split}>
      <p className={styles.schematic}>
        An example order. The shelf, the prices, the rounding and the wording are invented for this page, and this
        is not the agent&apos;s own code. In the project itself, all voices, shops and orders are synthetic.
      </p>

      <div className={styles.sides}>
        <section className={`${styles.side} ${styles.sideModel}`} aria-label="What the model says">
          <p className={styles.sideTag}>Model</p>
          <p className={styles.sideLead}>Which items and how many. Nothing else. Change what it heard:</p>
          <ul className={styles.note}>
            {SHELF.map((item) => {
              const quantity = note[item.key] ?? 0;
              // At either end a button stays focusable and says it is unavailable; the step is clamped.
              const set = (direction: 1 | -1) =>
                setNote((now) => ({ ...now, [item.key]: stepped(item, now[item.key] ?? 0, direction) }));
              return (
                <li key={item.key} className={styles.noteLine}>
                  <span className={styles.noteName}>{item.name}</span>
                  <span className={styles.stepper}>
                    <button
                      type="button"
                      className={styles.stepButton}
                      aria-label={`Less ${item.name.toLowerCase()}`}
                      aria-disabled={quantity <= 0}
                      onClick={() => set(-1)}
                    >
                      −
                    </button>
                    <span className={styles.quantity}>{quantityText(item, quantity)}</span>
                    <button
                      type="button"
                      className={styles.stepButton}
                      aria-label={`More ${item.name.toLowerCase()}`}
                      aria-disabled={quantity >= mostAllowed(item)}
                      onClick={() => set(1)}
                    >
                      +
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={`${styles.side} ${styles.sideCode}`} aria-label="What code does">
          <p className={styles.sideTag}>Code</p>
          <p className={styles.sideLead}>Checks stock, rounds, totals, and writes every sentence that states an amount.</p>

          <ul className={styles.lines}>
            {order.lines.map((line) => (
              <li key={line.item.key} className={styles.line} data-short={!line.inStock}>
                <span className={styles.lineName}>{line.item.name}</span>
                <span className={styles.lineAmount}>
                  {!line.inStock
                    ? "left out"
                    : line.exact === line.amount
                      ? rupees(line.amount)
                      : `${rupees(line.exact)} → ${rupees(line.amount)}`}
                </span>
                <span className={styles.lineCheck}>
                  {line.inStock
                    ? `In stock · ${quantityText(line.item, line.quantity)} × ${rupees(line.item.price)}`
                    : `Short · asked for ${quantityText(line.item, line.quantity)}, ${quantityText(line.item, line.item.stock)} on the shelf`}
                </span>
              </li>
            ))}
            <li className={`${styles.line} ${styles.totalLine}`}>
              <span className={styles.lineName}>Total</span>
              <span className={styles.lineAmount}>{rupees(order.total)}</span>
            </li>
          </ul>

          <div className={styles.said} aria-live="polite">
            <p className={styles.speaker}>What code writes for the agent to say</p>
            {said.map((sentence, i) => (
              <p key={i} className={styles.saidLine}>
                {sentence.map((part, j) =>
                  part.amount ? (
                    <strong key={j} className={styles.amount}>
                      {part.text}
                    </strong>
                  ) : (
                    part.text
                  ),
                )}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
