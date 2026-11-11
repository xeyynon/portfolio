import { GEM_CUT, facetFill } from "@/lib/gemCut";
import styles from "./atoms.module.css";

/**
 * Atom: the cut stone itself, as SVG in a unit circle (radius 1), coloured by
 * the `--gem-color` it inherits. Every facet is flat-shaded from that one
 * colour; the table glows from inside, and a hard four-point glint sits on
 * the upper left. Placed by whoever uses it: inside a small <svg> (Gem) or
 * scaled into a bezel (the gauntlet).
 */
export default function GemCut() {
  return (
    <g className={styles.cut}>
      <polygon className={styles.cutRim} points={GEM_CUT.rim} />
      {GEM_CUT.facets.map((f, i) => (
        <polygon key={i} className={styles.facet} points={f.points} style={{ fill: facetFill(f.shade) }} />
      ))}
      <polygon className={styles.facet} points={GEM_CUT.table} style={{ fill: facetFill(0.7) }} />
      {/* light from inside, through the table */}
      <circle className={styles.cutCore} r="0.34" />
      {/* the glint */}
      <path
        className={styles.cutGlint}
        d="M-0.42 -0.62 L-0.36 -0.44 L-0.18 -0.38 L-0.36 -0.32 L-0.42 -0.14 L-0.48 -0.32 L-0.66 -0.38 L-0.48 -0.44 Z"
      />
    </g>
  );
}
