import styles from "./SiteNav.module.css";

export type NavItem = { href: string; label: string };

/**
 * Organism: the one bar. The mark is the way back to the top; the links are
 * the sections, in page order. All of them stay visible at every width: a
 * link hidden behind a sideways scroll is a link nobody finds.
 */
export default function SiteNav({ mark, items }: { mark: string; items: NavItem[] }) {
  return (
    <header className={styles.bar}>
      <a className={styles.mark} href="#top" aria-label="Back to the top">
        {mark}
      </a>
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
    </header>
  );
}
