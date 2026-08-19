/**
 * Scroll-progress source for the pinned prism scene.
 *
 * Deliberately not React state: this is read every rAF frame by
 * PrismCanvas's render loop, and routing that through a re-render would be
 * both wasteful and laggy. `get()` is a plain field read; `subscribe()` only
 * exists for the rarer React consumer (see useSceneProgress.ts) that wants a
 * re-render, e.g. a future wavelength tint on About's copy.
 *
 * Progress is measured against a single tracked element (the `.scene-span`
 * wrapper): 0 when its top is at the viewport top, 1 when its bottom reaches
 * the viewport bottom — i.e. how far the pin has travelled through its own
 * span, not the whole page.
 *
 * Uses a native `scroll` listener, not a Lenis callback. SmoothScroll.tsx
 * returns early under prefers-reduced-motion (no Lenis instance exists in
 * that case), so a Lenis-dependent source would silently stop updating for
 * exactly the users the reduced-motion path exists to serve. Native scroll
 * events fire regardless of Lenis, which itself drives real
 * `window.scrollTo` calls rather than transforming a wrapper element — the
 * same mechanism this file's predecessor (a raw `window.scrollY` read in
 * PrismCanvas.tsx) already relied on.
 */

export type ScrollSceneStore = {
  get(): number;
  subscribe(cb: () => void): () => void;
};

export function createScrollSceneStore(el: HTMLElement): ScrollSceneStore & { dispose(): void } {
  let progress = 0;
  let queued = false;
  const listeners = new Set<() => void>();

  const measure = () => {
    queued = false;
    const r = el.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    const next = span <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / span));
    if (next !== progress) {
      progress = next;
      listeners.forEach((cb) => cb());
    }
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(measure);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  const ro = new ResizeObserver(onScroll);
  ro.observe(el);
  measure();

  return {
    get: () => progress,
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    dispose() {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      listeners.clear();
    },
  };
}
