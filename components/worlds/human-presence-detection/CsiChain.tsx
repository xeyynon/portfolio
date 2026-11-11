import type { ReactNode } from "react";
import { CHAIN, ROLE_LABEL } from "./chain";
import styles from "./csi.module.css";

/** One small line drawing per link. Decoration: the link's name is the text beside it. */
const GLYPHS: Record<string, ReactNode> = {
  // waves leaving a point
  signal: (
    <>
      <circle cx="7" cy="25" r="1.6" fill="currentColor" stroke="none" />
      <path d="M7 18a7 7 0 0 1 7 7M7 11a14 14 0 0 1 14 14M7 4a21 21 0 0 1 21 21" />
    </>
  ),
  // a biquad: two square loops joined at one corner
  receivers: <path d="M16 16 9 9l-7 7 7 7zM16 16l7-7 7 7-7 7zM16 16v12" />,
  // a grid with some cells lit
  spectrograms: (
    <>
      <path d="M4 4h24v24H4zM12 4v24M20 4v24M4 12h24M4 20h24" />
      <path d="M4 20h8v8H4zM12 12h8v8h-8zM20 4h8v8h-8z" fill="currentColor" fillOpacity="0.35" stroke="none" />
    </>
  ),
  // layers narrowing to one answer
  classifier: (
    <>
      <path d="M6 7l10 5M6 16l10-4M6 16l10 4M6 25l10-5M16 12l10 4M16 20l10-4" />
      <circle cx="6" cy="7" r="2" />
      <circle cx="6" cy="16" r="2" />
      <circle cx="6" cy="25" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="16" cy="20" r="2" />
      <circle cx="26" cy="16" r="2" fill="currentColor" />
    </>
  ),
  // a phone with someone on its screen
  app: (
    <>
      <rect x="9" y="3" width="14" height="26" rx="3" />
      <circle cx="16" cy="12" r="2" />
      <path d="M12.5 20a3.5 3.5 0 0 1 7 0M14 25.5h4" />
    </>
  ),
};

/**
 * Organism: the chain from the Wi-Fi signal to the app, in the project's own
 * order, with who built each link said in words. CSI-Sense was a team project;
 * the owner's parts are the app and a hand in the antenna.
 */
export default function CsiChain() {
  return (
    <div className={styles.chainWrap}>
      <p className={styles.chainNote}>A team project. Every link says who built it.</p>
      <ol className={styles.chain}>
        {CHAIN.map((link) => (
          <li key={link.key} className={styles.link} data-role={link.role}>
            <span className={styles.glyph} aria-hidden="true">
              <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
                {GLYPHS[link.key]}
              </svg>
            </span>
            <div className={styles.linkBody}>
              <p className={styles.linkHead}>
                <span className={styles.linkName}>{link.name}</span>
                <span className={styles.role}>{ROLE_LABEL[link.role]}</span>
              </p>
              <p className={styles.linkText}>{link.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
