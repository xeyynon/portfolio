"use client";

import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import GemCut from "@/components/atoms/GemCut";
import { litAreas, noAreas, subscribeAreas } from "@/lib/areas";
import type { Socket } from "./web";
import styles from "./WorkWeb.module.css";

type Stone = Socket & { label: string; color: string };

/**
 * The six stones in their bezels: the same cut stone as everywhere else on
 * the site (GemCut), scaled into each setting. The one in the back of the
 * hand (index 1) is drawn long, to fill its pointed setting. A stone burns
 * once the visitor has opened a project that uses its area, like the stones
 * in the bar; until then it is set but dim. Before the browser has said what
 * is lit (and without script) every stone is drawn dim.
 */
export default function GauntletStones({ stones }: { stones: Stone[] }) {
  const lit = useSyncExternalStore(subscribeAreas, litAreas, noAreas);
  return (
    <g aria-hidden="true">
      {stones.map((s, i) => (
        <g
          key={s.label}
          className={styles.stone}
          data-i={i}
          data-lit={lit.includes(s.label)}
          style={{ color: s.color, "--gem-color": s.color, "--i": i } as CSSProperties}
          transform={`translate(${s.x.toFixed(2)} ${s.y.toFixed(2)}) scale(${s.r.toFixed(2)} ${(i === 1 ? s.r * 1.45 : s.r).toFixed(2)})`}
        >
          <GemCut />
        </g>
      ))}
    </g>
  );
}
