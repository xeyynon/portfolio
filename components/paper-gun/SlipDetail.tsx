import Link from "next/link";
import type { SlipKind } from "./slips";

/**
 * Molecule: the detail card for one slip. Kicker, title, one line, a link
 * to where the slip leads, and a close button. Paper-coloured like the
 * slips, so its text uses the fixed dark ink, not the scene's light ink.
 */
export default function SlipDetail({ kind, onClose }: { kind: SlipKind; onClose: () => void }) {
  const go = `${kind.hrefLabel} →`;
  return (
    <div className="pg-card" style={{ "--slip-color": kind.color } as React.CSSProperties}>
      <p className="pg-card-kicker">
        <span className="pg-card-dot" aria-hidden="true" />
        {kind.kicker}
      </p>
      <h4 className="pg-card-title">{kind.title}</h4>
      <p className="pg-card-text">{kind.text}</p>
      <div className="pg-card-row">
        {kind.href.startsWith("/") ? (
          <Link href={kind.href} className="pg-card-link">{go}</Link>
        ) : (
          <a href={kind.href} className="pg-card-link">{go}</a>
        )}
        <button type="button" className="pg-card-close" onClick={onClose} aria-label="Close details">
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
}
