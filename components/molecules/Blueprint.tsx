import type { ReactNode } from "react";
import type { ExperienceHighlight } from "@/data/portfolioData";
import styles from "./Blueprint.module.css";

type Sketch = NonNullable<ExperienceHighlight["sketch"]>;

/**
 * Molecule: a workshop line drawing of one build, on a blueprint grid. A
 * schematic of the idea, not a drawing of the real part: no dimensions, and
 * every label is a word already in the text beside it. It draws itself in as
 * it scrolls into view where the browser can tie animation to scrolling.
 */
export default function Blueprint({ sketch }: { sketch: Sketch }) {
  return (
    <svg className={styles.print} viewBox="0 0 320 120" aria-hidden="true">
      <g className={styles.lines}>{SKETCHES[sketch]}</g>
    </svg>
  );
}

const T = ({ x, y, children, a = "middle" }: { x: number; y: number; children: ReactNode; a?: "start" | "middle" | "end" }) => (
  <text className={styles.label} x={x} y={y} textAnchor={a}>
    {children}
  </text>
);

const SKETCHES: Record<Sketch, ReactNode> = {
  // A phone call reaches the Pi over Bluetooth; speech to text, the model, text to speech, and back.
  caller: (
    <>
      <rect x="14" y="30" width="34" height="60" rx="6" />
      <line x1="24" y1="82" x2="38" y2="82" />
      <path d="M56 60 q8 -10 0 -20 M62 64 q12 -14 0 -28" />
      <T x={31} y={106}>call</T>
      <rect x="84" y="38" width="56" height="44" rx="3" />
      <circle cx="96" cy="50" r="3" />
      <line x1="104" y1="70" x2="130" y2="70" />
      <T x={112} y={106}>Raspberry Pi</T>
      <path d="M140 60 H160" />
      <rect x="160" y="46" width="40" height="28" rx="14" />
      <T x={180} y={64}>STT</T>
      <path d="M200 60 H214" />
      <rect x="214" y="46" width="40" height="28" rx="14" />
      <T x={234} y={64}>LLM</T>
      <path d="M254 60 H268" />
      <rect x="268" y="46" width="40" height="28" rx="14" />
      <T x={288} y={64}>TTS</T>
      <path className={styles.dash} d="M288 46 V22 H31 V30" />
      <T x={170} y={16}>1.2 to 2.5 s</T>
    </>
  ),
  // The portal's data reaching a phone, with the private fields masked behind a fingerprint.
  "hr-app": (
    <>
      <rect x="14" y="22" width="110" height="76" rx="4" />
      <line x1="14" y1="36" x2="124" y2="36" />
      <line x1="26" y1="50" x2="96" y2="50" />
      <line x1="26" y1="62" x2="110" y2="62" />
      <line x1="26" y1="74" x2="84" y2="74" />
      <T x={69} y={112}>desktop portal</T>
      <path className={styles.dash} d="M130 60 H186" />
      <path d="M180 54 L188 60 L180 66" />
      <rect x="198" y="10" width="58" height="100" rx="9" />
      <line x1="208" y1="30" x2="246" y2="30" />
      <line x1="208" y1="42" x2="238" y2="42" />
      <T x={227} y={60}>••••</T>
      <T x={227} y={74}>••••</T>
      <path d="M220 92 a7 7 0 0 1 14 0 M216 96 a11 11 0 0 1 22 0" />
      <T x={290} y={64}>4 releases</T>
      <T x={290} y={78}>in 4 days</T>
    </>
  ),
  // A camera looks at the item, the Pi decides, a flap turns it into one of the bins.
  sorter: (
    <>
      <rect x="20" y="14" width="26" height="18" rx="3" />
      <circle cx="33" cy="23" r="5" />
      <path className={styles.dash} d="M33 32 L70 64" />
      <rect x="64" y="56" width="22" height="18" rx="4" />
      <T x={52} y={27} a="start">camera</T>
      <path d="M50 78 H170" />
      <path d="M150 78 L176 96" />
      <circle cx="150" cy="78" r="3" />
      <rect x="168" y="96" width="40" height="18" />
      <rect x="214" y="96" width="40" height="18" />
      <rect x="260" y="96" width="40" height="18" />
      <rect x="220" y="20" width="60" height="40" rx="3" />
      <T x={250} y={44}>Pi 4B</T>
      <path className={styles.dash} d="M220 50 Q170 50 152 74" />
      <T x={110} y={104}>~14.6 s → ~2 s</T>
    </>
  ),
  // One device on an eye-drop bottle, then fifty of them.
  drops: (
    <>
      <path d="M40 20 h12 v12 l8 8 v62 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 v-62 l8 -8 z" />
      <rect x="28" y="62" width="36" height="26" rx="4" />
      <circle cx="46" cy="75" r="4" />
      <path d="M46 6 v6 M46 14 q-3 4 0 6 q3 -2 0 -6" />
      <path className={styles.dash} d="M76 70 H112" />
      {Array.from({ length: 50 }, (_, i) => (
        <rect key={i} x={124 + (i % 10) * 18} y={22 + Math.floor(i / 10) * 16} width="10" height="10" rx="2" />
      ))}
      <T x={205} y={114}>50 units in one week</T>
    </>
  ),
};
