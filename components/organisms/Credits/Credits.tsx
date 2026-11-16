"use client";

import { useRef } from "react";
import SnitchMark from "@/components/atoms/SnitchMark";
import { builtWith, inspirations, notice, styles as designStyles, thanks, type Credit, type } from "@/data/credits";
import styles from "./Credits.module.css";

/**
 * Organism: the credits. A link in the footer opens a sheet that slides up
 * from the bottom and names what the site borrows from: the films and books
 * behind its pieces, the design styles, the typefaces, the tools, the people.
 * Each line says where on the site it shows.
 *
 * A native modal dialog, like the journey cards: focus moves in and comes
 * back, the page behind is inert, Esc closes it, so does a press outside.
 */
export default function Credits({ className }: { className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" className={className ?? styles.open} aria-haspopup="dialog" onClick={() => ref.current?.showModal()}>
        Credits <span aria-hidden="true">↑</span>
      </button>

      <dialog ref={ref} className={styles.sheet} aria-labelledby="credits-title" onClick={(e) => e.target === e.currentTarget && close()}>
        <div className={styles.panel}>
          <span className={styles.handle} aria-hidden="true" />
          <div className={styles.head}>
            <SnitchMark className={styles.mark} />
            <div className={styles.heading}>
              <h2 id="credits-title" className={styles.eyebrow}>
                Credits
              </h2>
              <p className={styles.title}>What this site borrows from</p>
            </div>
            <button type="button" className={styles.close} onClick={close} aria-label="Close credits" title="Close (Esc)">
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4 4 L12 12 M12 4 L4 12" />
              </svg>
            </button>
          </div>
          <div className={styles.body}>
            <Group title="Inspired by" items={inspirations} />
            <Group title="Design styles" items={designStyles} />
            <Group title="Typefaces" items={type} />
            <section className={styles.group}>
              <h3 className={styles.groupTitle}>Built with</h3>
              <p className={styles.plain}>{builtWith.join(" · ")}</p>
            </section>
            <section className={styles.group}>
              <h3 className={styles.groupTitle}>Thanks</h3>
              <p className={styles.plain}>{thanks}</p>
            </section>
            <p className={styles.notice}>{notice}</p>
          </div>
        </div>
      </dialog>
    </>
  );
}

function Group({ title, items }: { title: string; items: Credit[] }) {
  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ul className={styles.list}>
        {items.map((c) => (
          <li key={c.what} className={styles.item}>
            <span className={styles.what}>{c.what}</span>
            <span className={styles.from}>{c.from}</span>
            <span className={styles.where}>{c.where}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
