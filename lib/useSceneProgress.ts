"use client";
import { useSyncExternalStore } from "react";
import type { ScrollSceneStore } from "@/lib/scrollScene";

const subscribeNone = () => () => {};
const getServerSnapshot = () => 0;

/** React-facing read of the scene's scroll progress (0..1). Re-renders the
 * consumer on change — fine for occasional UI (a tint, a label), not for the
 * WebGL render loop, which reads the store directly instead. */
export function useSceneProgress(store: ScrollSceneStore | null): number {
  return useSyncExternalStore(
    store ? store.subscribe : subscribeNone,
    () => store?.get() ?? 0,
    getServerSnapshot
  );
}
