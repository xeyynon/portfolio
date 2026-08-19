"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide smooth scrolling.
 *
 * Two integration details that are easy to get wrong:
 *
 * 1. Lenis takes over scroll, so CSS `scroll-behavior: smooth` must be off or
 *    the two fight and anchor jumps stutter. That is handled in globals.css
 *    via `html.lenis`.
 * 2. Anchor links (`/#projects`, the rail, the nav) bypass Lenis if left to the
 *    browser, producing an instant jump inside an otherwise eased page. They
 *    are intercepted and routed through `lenis.scrollTo`.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Exponential ease-out: fast handoff from the wheel, long settle. Reads
      // as weight rather than lag.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    document.documentElement.classList.add("lenis");

    let raf = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;

      const anchor = (e.target as HTMLElement).closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href) return;

      // Only same-page hashes. Cross-route links must still navigate.
      const hash = href.startsWith("#")
        ? href
        : href.startsWith("/#") && window.location.pathname === "/"
          ? href.slice(1)
          : null;
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
      history.pushState(null, "", hash);
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("lenis");
      lenis.destroy();
    };
  }, []);

  return null;
}
