import { GemRow, type Area } from "@/components/molecules/AreaGems";
import CommandPalette from "@/components/organisms/CommandPalette/CommandPalette";
import type { Command } from "@/lib/commands";
import styles from "./SiteNav.module.css";

export type NavItem = { href: string; label: string };

/**
 * Organism: the one bar. The mark is the way back to the top; the links are
 * the sections, in page order. All of them stay visible at every width: a
 * link hidden behind a sideways scroll is a link nobody finds.
 */
export default function SiteNav({
  mark,
  items,
  areas,
  commands,
}: {
  mark: string;
  items: NavItem[];
  areas?: Area[];
  commands?: Command[];
}) {
  return (
    <header className={styles.bar}>
      <a className={styles.mark} href="#top" aria-label="Back to the top">
        {mark}
      </a>
      {areas && (
        <span className={styles.stones} data-stone-to>
          <GemRow areas={areas} />
        </span>
      )}
      <nav aria-label="Sections">
        <ul className={styles.links}>
          {items.map((item) => (
            <li key={item.href}>
              <a className={styles.link} href={item.href}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {commands && <CommandPalette commands={commands} />}
    </header>
  );
}
