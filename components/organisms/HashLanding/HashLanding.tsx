"use client";

import { useEffect } from "react";

/** How long the page may keep re-aiming at the section while it settles. */
const SETTLE_MS = 2000;

/**
 * Lands on the section named in the address (/#projects) once the page has
 * settled. The browser scrolls to the section on arrival, but the opening
 * above it grows after that (it takes its full scroll length only once the 3D
 * scene is running), which pushes the section down out of view. So for a
 * short while, whenever the page changes height, this puts the section back
 * at the top, and it stops the moment the reader scrolls on their own.
 * Renders nothing.
 */
export default function HashLanding() {
  useEffect(() => {
    let stop: (() => void) | null = null;

    const land = () => {
      stop?.();
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      const aim = () => target.scrollIntoView({ block: "start", behavior: "instant" });
      const sizes = new ResizeObserver(aim);
      sizes.observe(document.body);
      aim();

      const quit = () => cleanup();
      const timer = window.setTimeout(quit, SETTLE_MS);
      const cleanup = () => {
        sizes.disconnect();
        window.clearTimeout(timer);
        window.removeEventListener("wheel", quit);
        window.removeEventListener("touchstart", quit);
        window.removeEventListener("keydown", quit);
        stop = null;
      };
      // the reader takes over: stop re-aiming
      window.addEventListener("wheel", quit, { passive: true });
      window.addEventListener("touchstart", quit, { passive: true });
      window.addEventListener("keydown", quit);
      stop = cleanup;
    };

    land();
    window.addEventListener("hashchange", land);
    return () => {
      window.removeEventListener("hashchange", land);
      stop?.();
    };
  }, []);

  return null;
}
