import type { Digit } from "./hand";
import { CENTRE, FINGERS, HAND_TRANSFORM, SETTINGS, THUMB, digitPlates } from "./hand";
import styles from "./WorkWeb.module.css";

/**
 * The gauntlet at the centre of the web, drawn after the one from the films:
 * the back of a raised right hand in polished gold, each finger in three
 * lapped plates with a ridge down the middle, a stone set in a round bezel on
 * every knuckle and on the thumb, the largest in a pointed setting on the
 * back of the hand, and a flared, fluted cuff. Every gold is a token; the
 * shine is gradients, so it stays sharp at any size.
 *
 * Decoration only: the stones themselves (GauntletStones) and the names of
 * the areas (the key under the web) carry the meaning.
 */
export default function Gauntlet() {
  return (
    <g aria-hidden="true" transform={HAND_TRANSFORM}>
      <defs>
        {/* across a finger: dark at the sides, a bright line just left of centre */}
        <linearGradient id="gt-round" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--gilt-deep)" }} />
          <stop offset="0.2" style={{ stopColor: "var(--gilt-mid)" }} />
          <stop offset="0.4" style={{ stopColor: "var(--gilt-hi)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--home-gold)" }} />
          <stop offset="0.85" style={{ stopColor: "var(--gilt-mid)" }} />
          <stop offset="1" style={{ stopColor: "var(--gilt-deep)" }} />
        </linearGradient>
        {/* a broad plate lit from the upper left */}
        <linearGradient id="gt-plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--gilt-hi)" }} />
          <stop offset="0.3" style={{ stopColor: "var(--home-gold)" }} />
          <stop offset="0.7" style={{ stopColor: "var(--gilt-mid)" }} />
          <stop offset="1" style={{ stopColor: "var(--gilt-deep)" }} />
        </linearGradient>
        {/* a band seen edge on: bright on top, shadowed below */}
        <linearGradient id="gt-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--gilt-hi)" }} />
          <stop offset="0.45" style={{ stopColor: "var(--home-gold)" }} />
          <stop offset="1" style={{ stopColor: "var(--gilt-deep)" }} />
        </linearGradient>
        {/* the inside of a setting, in shadow */}
        <radialGradient id="gt-well" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" style={{ stopColor: "var(--gilt-deep)" }} />
          <stop offset="1" style={{ stopColor: "var(--gilt-edge)" }} />
        </radialGradient>
      </defs>

      {/* the thumb, behind the hand, turned out to the left */}
      <g transform={`rotate(${THUMB.angle} ${THUMB.cx} ${THUMB.base})`}>
        <g className={styles.thumb}>
          <DigitPlates digit={THUMB} />
        </g>
      </g>

      {/* the fingers; the middle one moves in the snap */}
      {FINGERS.map((f) => (
        <g key={f.key} transform={`rotate(${f.angle} ${f.cx} ${f.base})`}>
          <g className={f.key === "middle" ? styles.middle : undefined}>
            <DigitPlates digit={f} />
          </g>
        </g>
      ))}

      {/* the back of the hand */}
      <path
        className={styles.edge}
        fill="url(#gt-plate)"
        d="M310 262 Q306 250 322 248 L440 252 Q456 256 452 272 Q450 330 432 380 L332 380 Q312 330 310 262 Z"
      />
      {/* swept plates either side of the centre stone */}
      <path className={styles.groove} d="M316 300 Q340 318 356 322 M446 300 Q422 318 406 322" />
      <path className={styles.ridge} d="M318 296 Q340 314 356 318 M444 296 Q422 314 406 318" />
      <path className={styles.groove} d="M334 372 Q350 350 366 340 M428 372 Q412 350 396 340" />
      <path className={styles.ridge} d="M381 362 L381 380" />

      {/* the knuckle band the four stones are set in */}
      <path className={styles.edge} fill="url(#gt-band)" d="M308 256 Q380 236 455 260 L453 288 Q380 268 311 290 Z" />

      {/* the pointed setting in the back of the hand */}
      <path
        className={styles.edge}
        fill="url(#gt-band)"
        d={`M${CENTRE.x} ${CENTRE.y - 40} C${CENTRE.x + 30} ${CENTRE.y - 20} ${CENTRE.x + 30} ${CENTRE.y + 20} ${CENTRE.x} ${CENTRE.y + 40} C${CENTRE.x - 30} ${CENTRE.y + 20} ${CENTRE.x - 30} ${CENTRE.y - 20} ${CENTRE.x} ${CENTRE.y - 40} Z`}
      />
      <path
        className={styles.edge}
        fill="url(#gt-well)"
        d={`M${CENTRE.x} ${CENTRE.y - 30} C${CENTRE.x + 21} ${CENTRE.y - 15} ${CENTRE.x + 21} ${CENTRE.y + 15} ${CENTRE.x} ${CENTRE.y + 30} C${CENTRE.x - 21} ${CENTRE.y + 15} ${CENTRE.x - 21} ${CENTRE.y - 15} ${CENTRE.x} ${CENTRE.y - 30} Z`}
      />

      {/* a bezel for every stone: a gold ring, a dark well, four claws */}
      {SETTINGS.map((s, i) =>
        i === 1 ? null : (
          <g key={i}>
            <circle className={styles.edge} fill="url(#gt-band)" cx={s.x} cy={s.y} r={s.r + 4.5} />
            <circle fill="url(#gt-well)" cx={s.x} cy={s.y} r={s.r + 1.2} />
            <path
              className={styles.claw}
              d={`M${s.x} ${s.y - s.r - 3} V${s.y - s.r + 1} M${s.x} ${s.y + s.r + 3} V${s.y + s.r - 1} M${s.x - s.r - 3} ${s.y} H${s.x - s.r + 1} M${s.x + s.r + 3} ${s.y} H${s.x + s.r - 1}`}
            />
          </g>
        ),
      )}

      {/* the cuff: a wrist band, then a bell that flares, fluted, with a rolled rim */}
      <path className={styles.edge} fill="url(#gt-band)" d="M330 378 H434 L438 398 H326 Z" />
      <path className={styles.edge} fill="url(#gt-round)" d="M326 398 H438 Q454 440 466 478 H298 Q310 440 326 398 Z" />
      {[-0.66, -0.33, 0, 0.33, 0.66].map((t) => (
        <g key={t}>
          <path className={styles.groove} d={`M${382 + t * 56} 402 L${382 + t * 84} 476`} />
          <path className={styles.ridge} d={`M${384 + t * 56} 402 L${384 + t * 84} 476`} />
        </g>
      ))}
      <path className={styles.ridge} d="M346 414 L382 438 L418 414" />
      <path className={styles.edge} fill="url(#gt-band)" d="M294 478 H470 L472 490 Q382 498 292 490 Z" />
    </g>
  );
}

function DigitPlates({ digit }: { digit: Digit }) {
  return (
    <>
      {digitPlates(digit).map((p, i) => (
        <g key={i}>
          <path className={styles.edge} fill="url(#gt-round)" d={p.d} />
          <path className={styles.ridge} d={p.ridge} />
        </g>
      ))}
    </>
  );
}
