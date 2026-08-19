"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useScrollSceneStore } from "@/components/ScrollSceneProvider";
import { scheduleIdle } from "@/lib/prismShader";

// The renderer is code-split and never blocks first paint. The SVG below is a
// complete, meaningful hero on its own — the canvas is an enhancement layered
// over it, not a dependency.
const PrismCanvas = dynamic(() => import("./PrismCanvas"), { ssr: false });

const LINES = [
  { color: "var(--v400)", y: 14, delay: 0 },
  { color: "var(--v500)", y: 38, delay: 0.08 },
  { color: "var(--v560)", y: 62, delay: 0.16 },
  { color: "var(--v600)", y: 86, delay: 0.24 },
  { color: "var(--v680)", y: 108, delay: 0.32 },
];

/**
 * The persistent background: fills its parent (`.scene-pin`, sized
 * `100dvh` by CSS, sticky-pinned for the whole scene span) rather than
 * owning its own box like the old hero-only `.prism-stage` did. Everything
 * else — the idle-deferred WebGL mount, the SVG fallback and its draw-in,
 * the failure path — carries over unchanged from the previous PrismHero.
 */
export default function PrismScene() {
  const [canvas, setCanvas] = useState(false);
  const [failed, setFailed] = useState(false);
  const sceneStore = useScrollSceneStore();

  const onFail = useCallback(() => setFailed(true), []);

  useEffect(() => {
    // Defer the WebGL layer until the browser is idle, so it competes with
    // nothing during load.
    const cancelIdle = scheduleIdle(() => setCanvas(true), 1200);
    return () => cancelIdle();
  }, []);

  const live = canvas && !failed;

  // The SVG below used to draw itself in as soon as it scrolled into view
  // (or immediately, under reduced motion) regardless of whether WebGL was
  // about to take over — which it almost always does. That produced a
  // visible flash of a different-looking diagram (reported directly: "the
  // white flash... it is the old prism design") a moment before the WebGL
  // canvas faded in over it. The SVG's own strokes are dashed to zero
  // length until `.play` is applied (see .beam-in/.prism-outline/
  // .spectrum-line in globals.css), so simply never applying `.play` in
  // the success case means visitors never see it animate at all — it only
  // draws itself in on a genuine WebGL failure, which is the one case it
  // actually needs to be seen.
  const drawn = failed;

  return (
    <div className={`prism-scene scene-overlay ${live ? "is-live" : ""}`}>
      {live && <PrismCanvas onFail={onFail} sceneStore={sceneStore} />}

      <div className={`prism-wrap ${drawn ? "play" : ""}`} aria-hidden="true">
        <svg viewBox="0 0 860 120" preserveAspectRatio="none">
          <line x1="0" y1="60" x2="330" y2="60" className="beam-in" pathLength="1" />
          <polygon points="330,20 400,20 365,100" className="prism-outline" pathLength="1" />
          {LINES.map((l, i) => (
            <path
              key={i}
              d={`M365,60 L860,${l.y}`}
              className="spectrum-line"
              style={{ stroke: l.color, animationDelay: `${0.55 + l.delay}s` }}
              pathLength="1"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
