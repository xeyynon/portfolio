"use client";

import { useEffect, useRef } from "react";
import { flightProgress, stoneAt, stoneProgress } from "./stones";
import styles from "./StoneFlight.module.css";

/**
 * Organism: the six stones leave the waves for the bar. While the opening is
 * on screen the bar keeps an empty place for them; as the six-waves page
 * scrolls away, each stone lifts off its wave, one after another, swings up
 * and sets into its slot beside the mark. Scrolling back up flies them home.
 *
 * It only moves copies: a stone in the legend is hidden while its copy is in
 * the air, and its slot in the bar shows as an empty socket until it lands.
 * With reduced motion, or where the bar has no stones (phones), there is no
 * flight: the bar's stones simply appear once the opening has gone. Without
 * script they are always in the bar.
 */
export default function StoneFlight({ openingSelector }: { openingSelector: string }) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const opening = document.querySelector<HTMLElement>(openingSelector);
    const fromList = document.querySelector<HTMLElement>("[data-stone-from]");
    const toBox = document.querySelector<HTMLElement>("[data-stone-to]");
    if (!layer || !opening || !fromList || !toBox) return;

    const from = [...fromList.querySelectorAll<HTMLElement>("[data-gem]")];
    const to = [...toBox.querySelectorAll<HTMLElement>("[data-gem]")];
    if (!from.length || from.length !== to.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // One copy of each legend stone, to carry through the air.
    const copies = from.map((stone) => {
      const copy = stone.cloneNode(true) as HTMLElement;
      copy.classList.add(styles.copy);
      layer.appendChild(copy);
      return copy;
    });

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const f = flightProgress(opening.getBoundingClientRect().bottom, vh);
      const barHasStones = toBox.offsetParent !== null;
      const fly = barHasStones && !reduced;

      from.forEach((stone, i) => {
        const t = fly ? stoneProgress(f, i, from.length) : f >= 0.5 ? 1 : 0;
        const copy = copies[i];
        const airborne = t > 0 && t < 1;
        stone.style.visibility = t > 0 ? "hidden" : "";
        // Until its stone lands, a slot in the bar shows as an empty socket.
        if (t >= 1) delete to[i].dataset.away;
        else to[i].dataset.away = "true";
        copy.style.display = airborne ? "block" : "none";
        if (!airborne) return;
        const a = stone.getBoundingClientRect();
        const b = to[i].getBoundingClientRect();
        const p = stoneAt(
          { x: a.left + a.width / 2, y: a.top + a.height / 2, size: a.width },
          { x: b.left + b.width / 2, y: b.top + b.height / 2, size: b.width },
          t,
          i,
        );
        copy.style.width = copy.style.height = `${p.size}px`;
        copy.style.transform = `translate(${p.x - p.size / 2}px, ${p.y - p.size / 2}px) rotate(${p.turn}deg)`;
      });
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      copies.forEach((c) => c.remove());
      from.forEach((s) => (s.style.visibility = ""));
      to.forEach((s) => delete s.dataset.away);
    };
  }, [openingSelector]);

  return <div ref={layerRef} className={styles.layer} aria-hidden="true" />;
}
