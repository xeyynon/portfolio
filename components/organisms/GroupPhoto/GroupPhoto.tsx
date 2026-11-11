"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import type { Together } from "@/data/portfolioData";
import styles from "./GroupPhoto.module.css";

/**
 * Organism: the one photo with all three in it. It hangs in space and leans
 * toward the pointer; it is blurred until someone in it is pointed at, and
 * then a clear circle opens round that person, like ink coming up on a map,
 * and their name and link lift out of the picture.
 *
 * Each person is a real button: it works by hover, by keyboard focus and by a
 * tap (a tap keeps them shown, since a phone has no hover), and it says whose
 * it is. With reduced motion, and on touch, the photo does not lean.
 *
 * Until the photo is supplied, three plain figures stand in for it.
 */
export default function GroupPhoto({ together }: { together: Together }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const active = hovered ?? pinned;

  const lean = (e: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    card.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
  };
  const rest = () => {
    cardRef.current?.style.removeProperty("--ry");
    cardRef.current?.style.removeProperty("--rx");
  };

  const picture = together.photo ? (
    <Image src={together.photo} alt="" fill sizes="(max-width: 700px) 92vw, 640px" className={styles.image} />
  ) : (
    <Figures count={together.people.length} />
  );

  return (
    <div className={styles.frame} onPointerMove={lean} onPointerLeave={rest}>
      <div className={styles.card} ref={cardRef}>
        <div className={styles.media}>
          <div className={styles.blurred}>{picture}</div>
          {together.people.map((person, i) => (
            <div
              key={person.name}
              className={styles.clear}
              data-on={active === i}
              style={{ "--x": person.at[0], "--y": person.at[1] } as CSSProperties}
            >
              {picture}
            </div>
          ))}
        </div>

        {together.people.map((person, i) => (
          <div
            key={person.name}
            className={styles.spot}
            data-on={active === i}
            style={{ "--x": person.at[0], "--y": person.at[1] } as CSSProperties}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
          >
            <button
              type="button"
              className={styles.ring}
              aria-pressed={pinned === i}
              aria-label={`Show ${person.name}`}
              onClick={() => setPinned(pinned === i ? null : i)}
            />
            <p className={styles.label}>
              <span className={styles.name}>{person.name}</span>
              {person.linkedin && (
                <a className={styles.link} href={person.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn <span aria-hidden="true">↗</span>
                </a>
              )}
            </p>
          </div>
        ))}
      </div>
      <p className={styles.caption}>{together.caption}</p>
    </div>
  );
}

/** Stands in for the photo until it is supplied: one plain figure per person. */
function Figures({ count }: { count: number }) {
  return (
    <svg className={styles.figures} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect className={styles.figuresBack} width="160" height="100" />
      {Array.from({ length: count }, (_, i) => {
        const x = (160 / (count + 1)) * (i + 1);
        return (
          <g key={i} className={styles.figure}>
            <circle cx={x} cy="38" r="11" />
            <path d={`M${x - 22} 100 Q${x - 22} 58 ${x} 58 Q${x + 22} 58 ${x + 22} 100 Z`} />
          </g>
        );
      })}
    </svg>
  );
}
