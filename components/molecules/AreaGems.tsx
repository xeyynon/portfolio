"use client";

import { useEffect, useSyncExternalStore } from "react";
import Gem from "@/components/atoms/Gem";
import { lightAreas, litAreas, noAreas, subscribeAreas } from "@/lib/areas";
import styles from "./molecules.module.css";

export type Area = { label: string; color: string };

const useLit = () => useSyncExternalStore(subscribeAreas, litAreas, noAreas);

/**
 * Molecule: the six stones in a row. One lights for each area of work the
 * visitor has come across by opening a project. The count is said in words,
 * so the row is not colour alone.
 */
export function GemRow({ areas }: { areas: Area[] }) {
  const lit = useLit();
  const count = areas.filter((a) => lit.includes(a.label)).length;
  const all = count === areas.length;
  return (
    <p
      className={styles.gemRow}
      data-all={all}
      title={all ? "All six areas found" : "Open a project to light the areas it uses"}
    >
      {areas.map((a) => (
        <Gem key={a.label} color={a.color} lit={lit.includes(a.label)} />
      ))}
      {/* Said, not shown: the stones themselves show it. */}
      <span className="sr-only">
        {count} of {areas.length} areas of work found. Open a project to light the areas it uses.
      </span>
    </p>
  );
}

/** One area's stone, lit or not, for beside its name. */
export function AreaGem({ area }: { area: Area }) {
  const lit = useLit();
  return <Gem color={area.color} lit={lit.includes(area.label)} />;
}

/** Lights a project's areas when its page is opened. Renders nothing. */
export function AreaCollector({ labels }: { labels: string[] }) {
  const key = labels.join("|");
  useEffect(() => {
    lightAreas(key.split("|"));
  }, [key]);
  return null;
}
