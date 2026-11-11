"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Gem from "@/components/atoms/Gem";
import type { SphereScene, SphereStats } from "@/scene/sphere/SphereScene";
import { stickyProgress } from "@/scene/sphere/timeline";
import styles from "./SphereOpening.module.css";

type Props = {
  name: string;
  motto: string;
  mottoBy: string;
  /**
   * The six areas of work. What the Snitch opens onto is six waves, one in
   * each area's colour; with this they are named, each by its own stone.
   */
  areas?: { label: string; color: string }[];
  /** Frame rate and resolution in the corner, for judging the prototype. */
  showReadings?: boolean;
  /** Laid over the stage once the sphere has opened (the lab uses it). */
  children?: ReactNode;
};

type Status = "loading" | "running" | "still" | "unavailable";

/**
 * Organism: the opening. Mounts the sphere and feeds it scroll progress.
 * three.js is imported inside the effect, so it is a separate chunk that
 * loads after the page has painted; until then, and if WebGL is missing, the
 * CSS poster stands in for it. The tall scroll track exists only while the
 * scene is running, so content below is never held behind the show.
 */
export default function SphereOpening({ name, motto, mottoBy, areas, showReadings = false, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [stats, setStats] = useState<SphereStats | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    let scene: SphereScene | null = null;
    let cancelled = false;

    const onScroll = () => {
      const rect = root.getBoundingClientRect();
      const p = stickyProgress(rect.top, rect.height, window.innerHeight);
      root.style.setProperty("--p", p.toFixed(4));
      scene?.setProgress(p);
      // Past the hand-off the waves are drawn behind the page: rest the scene.
      scene?.setActive(root.dataset.handoff !== "true");
    };

    import("@/scene/sphere/SphereScene")
      .then(({ SphereScene }) => {
        if (cancelled) return;
        // ?q= carries the scene's measuring switches (see SphereOptions.debug).
        const debug = new URLSearchParams(window.location.search).get("q") ?? "";
        // A browser drawing WebGL without a real GPU says so when asked for a
        // context that must not have a major performance caveat.
        const probe = document.createElement("canvas");
        const lite = !probe.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
        scene = new SphereScene(canvas, { tokenSource: root, reducedMotion, coarsePointer, onStats: setStats, debug, lite });
        setStatus(reducedMotion ? "still" : "running");
        if (!reducedMotion) {
          root.dataset.live = "true";
          window.addEventListener("scroll", onScroll, { passive: true });
          window.addEventListener("resize", onScroll);
          onScroll();
        }
        root.dataset.ready = "true";
      })
      .catch(() => {
        // No WebGL, or the chunk did not load: the poster and the plain page stay.
        if (!cancelled) setStatus("unavailable");
      });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      delete root.dataset.live;
      delete root.dataset.ready;
      scene?.dispose();
    };
  }, []);

  return (
    <div className={styles.lab} ref={rootRef} data-opening>
      <div className={styles.stage}>
        <div className={styles.poster} aria-hidden="true" />
        <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />

        <div className={styles.title}>
          <p className={styles.motto}>
            &ldquo;{motto}&rdquo;
            <span className={styles.mottoBy}>{mottoBy}</span>
          </p>
          <h1 className={styles.name}>{name}</h1>
          {status === "running" && <p className={styles.hint}>Scroll to open</p>}
        </div>

        {areas && (
          <div className={styles.legend}>
            <p className={styles.legendTitle}>Six areas of work, one branch each</p>
            <ul className={styles.legendList} data-stone-from>
              {areas.map((area, i) => (
                // --row places the name on its own branch, at the right where the
                // branches have parted: the scene draws the first area lowest
                // and the last highest (shaders.ts, INSIDE_FRAG).
                <li key={area.label} className={styles.legendItem} style={{ "--row": i } as CSSProperties}>
                  <Gem color={area.color} />
                  {area.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showReadings && (
          <p className={styles.hud} aria-hidden="true">
            {status === "loading" && "loading scene"}
            {status === "unavailable" && "3D unavailable · still image"}
            {status === "still" && "reduced motion · still frame"}
            {status === "running" &&
              (stats ? `${stats.fps} fps · dpr ${stats.dpr.toFixed(2)} · bloom ${stats.bloom ? "on" : "off"}` : "starting")}
          </p>
        )}
      </div>

      {children && <div className={styles.inside}>{children}</div>}
    </div>
  );
}
