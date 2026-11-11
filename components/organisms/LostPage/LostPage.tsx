import type { CSSProperties } from "react";
import BackToLine from "./BackToLine";
import { BRANCH_PATH, EMBERS, SPLIT, TIP } from "./prune";
import styles from "./LostPage.module.css";

/**
 * Organism: the page for an address that does not exist, or not yet. The
 * main line of the site runs on; a branch splits off it, which is where the
 * address went, and grows; then it is pruned: a charge strikes its tip and it
 * burns back to where it split, shedding embers, until only a mark is left at
 * the cut. The main line carries on. The way out is back to it, at the part
 * the address split off from (BackToLine).
 *
 * Plays once. The words are there from the start, so nothing waits on the
 * picture; with reduced motion the picture is simply the pruned line.
 */
export default function LostPage({ home }: { home: string }) {
  return (
    <main className={styles.lost} data-redesign>
      <svg className={styles.art} viewBox="0 0 640 220" aria-hidden="true">
        {/* the main line, carrying on */}
        <path className={styles.main} d="M0 110 C80 50 160 50 240 110 S400 170 480 110 S600 50 640 80" />

        {/* the branch: grows off the main line, then burns back from its tip */}
        <path className={styles.branchGlow} d={BRANCH_PATH} />
        <path className={styles.branch} d={BRANCH_PATH} />

        {/* the charge that prunes it, at the tip */}
        <circle className={styles.charge} cx={TIP.x} cy={TIP.y} r="10" />
        <circle className={styles.flash} cx={TIP.x} cy={TIP.y} r="7" />

        {/* what it sheds as it goes: the tip first, the split last */}
        <g className={styles.embers}>
          {EMBERS.map((e, i) => (
            <circle
              key={i}
              className={styles.ember}
              cx={e.x}
              cy={e.y}
              r={e.r}
              style={{ "--f": e.f, "--dx": `${e.dx}px`, "--dy": `${e.dy}px` } as CSSProperties}
            />
          ))}
        </g>

        {/* where it was cut */}
        <g className={styles.cut}>
          <circle cx={SPLIT.x} cy={SPLIT.y} r="9" />
          <path d={`M${SPLIT.x + 6} ${SPLIT.y + 4} l10 8 M${SPLIT.x + 16} ${SPLIT.y + 4} l-10 8`} />
        </g>
        <circle className={styles.split} cx={SPLIT.x} cy={SPLIT.y} r="5" />
      </svg>

      <p className={styles.code}>404 · branch pruned</p>
      <h1 className={styles.title}>This branch has been pruned.</h1>
      <p className={styles.text}>
        The address you followed split off the main line, and it was pruned before it could grow. Everything that is
        real is still on the main line.
      </p>
      <BackToLine className={styles.home} home={home}>
        Back to the main line <span aria-hidden="true">→</span>
      </BackToLine>
    </main>
  );
}
