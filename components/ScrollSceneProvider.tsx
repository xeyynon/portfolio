"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createScrollSceneStore, type ScrollSceneStore } from "@/lib/scrollScene";

const ScrollSceneContext = createContext<ScrollSceneStore | null>(null);

/** The store for the nearest ScrollSceneProvider, or null before mount / outside one. */
export function useScrollSceneStore(): ScrollSceneStore | null {
  return useContext(ScrollSceneContext);
}

/**
 * Owns the pinned scene's measured span and hands out a scroll-progress
 * store to everything inside it — the persistent WebGL background (which
 * reads it every frame) and, later, any content-side effect that wants to
 * react to the same progress (a wavelength tint, for instance).
 *
 * Renders the `<section class="scene-span">` itself, since that element is
 * both the pin's positioning root and the thing progress is measured
 * against — the two can't be split apart without desyncing them. Children
 * compose the pin/content bands inside it (see app/page.tsx).
 */
export default function ScrollSceneProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [store, setStore] = useState<ScrollSceneStore | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = createScrollSceneStore(el);
    setStore(s);
    return () => s.dispose();
  }, []);

  return (
    <section className="scene-span" ref={ref}>
      <ScrollSceneContext.Provider value={store}>{children}</ScrollSceneContext.Provider>
    </section>
  );
}
