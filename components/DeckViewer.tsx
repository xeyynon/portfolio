"use client";
import { useState } from "react";

/**
 * Slide decks are multi-megabyte PDFs. Mounting the iframe only on request
 * keeps them entirely off the initial page load; the placeholder carries the
 * cost so the visitor can decide.
 */
export default function DeckViewer({ src, title }: { src: string; title: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="deck-poster" onClick={() => setOpen(true)}>
        <span className="deck-poster-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="3" y="4" width="18" height="13" rx="1" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </span>
        <span className="deck-poster-label">Load presentation</span>
        <span className="deck-poster-meta">PDF · {title}</span>
      </button>
    );
  }

  return (
    <div className="deck-frame">
      <iframe src={src} title={`${title} presentation`} loading="lazy" />
    </div>
  );
}
