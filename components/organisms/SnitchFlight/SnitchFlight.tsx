"use client";

import { useEffect, useRef } from "react";
import SnitchMark from "@/components/atoms/SnitchMark";
import { flight } from "./flight";
import styles from "./SnitchFlight.module.css";

type Props = {
  /** Selector of the element the opening occupies; the flight starts as it leaves. */
  openingSelector: string;
  /** Id of the landing spot: an element that contains a SnitchMark. */
  landingId: string;
};

const FLYER_WIDTH = 76; // px, the width of the flying Snitch

/**
 * Organism: the small Snitch that follows the visitor down the page and lands
 * in Contact, where the one waiting there opens. It is decoration: it sits in
 * a fixed layer that takes no clicks and is hidden from assistive technology.
 * The landing spot is a real link in the page and works without any of this.
 *
 * Without JavaScript, or with reduced motion, nothing flies: the landing
 * Snitch is simply there, open.
 */
export default function SnitchFlight({ openingSelector, landingId }: Props) {
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const flyer = flyerRef.current;
    const opening = document.querySelector<HTMLElement>(openingSelector);
    const landing = document.getElementById(landingId);
    const waiting = landing?.querySelector<SVGElement>("svg");
    if (!flyer || !opening || !landing || !waiting) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const spot = waiting.getBoundingClientRect();
      const state = flight({
        scrollY: window.scrollY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        openingEnd: opening.getBoundingClientRect().bottom + window.scrollY,
        landing: { x: spot.left + spot.width / 2, y: spot.top + spot.height / 2 + window.scrollY },
      });

      // It grows to the size of the one waiting as it comes in, so the swap is not seen.
      const scale = 1 + (spot.width / FLYER_WIDTH - 1) * state.approach;
      flyer.style.transform = `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      flyer.style.opacity = state.landed ? "0" : state.presence.toFixed(2);

      // The one in the page stays out of sight until the flyer arrives, then opens.
      waiting.style.opacity = state.landed ? "1" : "0";
      waiting.dataset.open = String(state.landed);
      landing.dataset.landed = String(state.landed);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      // Leave the page as it is without this component: the Snitch there, open.
      waiting.style.opacity = "";
      waiting.dataset.open = "true";
      delete landing.dataset.landed;
    };
  }, [openingSelector, landingId]);

  return (
    <div className={styles.flyer} ref={flyerRef} aria-hidden="true">
      <SnitchMark />
    </div>
  );
}
