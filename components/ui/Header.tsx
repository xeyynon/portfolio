"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

// Same order as the sections on the page (and the rail), so the menu reads
// top to bottom the way the page scrolls.
const SECTIONS = [
  { id: "experience", label: "EXPERIENCE" },
  { id: "about", label: "ABOUT" },
  { id: "projects", label: "PROJECTS" },
  { id: "achievements", label: "ACHIEVEMENTS" },
  { id: "leadership", label: "LEADERSHIP" },
  { id: "skills", label: "SKILLS" },
  { id: "contact", label: "CONTACT" },
];

/**
 * Logo + section links. On phones the seven links did not fit — four were
 * visible and three sat behind a sideways scroll with no affordance — so
 * below 640px they collapse behind a Menu button (CSS decides when the
 * button shows; this component only owns open/closed).
 *
 * Esc closes the menu and returns focus to the button; so does choosing a
 * link, because the link itself disappears with the menu and focus would
 * otherwise fall to <body>.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (navRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const onLinkClick = () => {
    if (!open) return;
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="logo">
          SP
        </Link>
        <button
          ref={buttonRef}
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
        <nav id="site-nav" ref={navRef} className="nav-links" aria-label="Sections" data-open={open}>
          {SECTIONS.map((s) => (
            <Link key={s.id} href={`/#${s.id}`} onClick={onLinkClick}>
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
