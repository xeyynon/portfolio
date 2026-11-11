"use client";

import { useId, useRef, type ReactNode } from "react";
import styles from "./StoryCard.module.css";

/**
 * Organism: a point on the journey that opens. The trigger is the point's own
 * label, as a button; it opens a card shaped like a folder tab pulled out of
 * a drawer, holding whatever belongs to that stop (a photo, a few lines).
 *
 * A native modal dialog: focus moves in and comes back to the label when it
 * closes, the rest of the page is inert behind it, Esc closes it, and so does
 * a press outside the card.
 */
export default function StoryCard({
  trigger,
  title,
  when,
  children,
}: {
  trigger: ReactNode;
  title: string;
  when?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" className={styles.open} aria-haspopup="dialog" onClick={() => ref.current?.showModal()}>
        {trigger}
      </button>

      <dialog
        ref={ref}
        className={styles.dialog}
        aria-labelledby={`${id}-title`}
        // A press on the backdrop lands on the dialog itself, not on the card.
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className={styles.folder}>
          <p className={styles.tab}>
            <span className={styles.tabDot} aria-hidden="true" />
            <span id={`${id}-title`} className={styles.tabTitle}>
              {title}
            </span>
            {when && <span className={styles.tabWhen}>{when}</span>}
          </p>
          <div className={styles.card}>
            <button type="button" className={styles.close} onClick={close}>
              Close <kbd aria-hidden="true">Esc</kbd>
            </button>
            <div className={styles.body}>{children}</div>
          </div>
        </div>
      </dialog>
    </>
  );
}
