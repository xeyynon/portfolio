"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

// The theme lives on <html>, set before hydration by the inline script in the
// layout. Subscribing to it is the correct primitive here — it is external
// state React does not own, so there is no effect and no sync-on-mount.
const THEME_EVENT = "themechange";

const subscribe = (onChange: () => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
};

const isLight = () => document.documentElement.classList.contains("light");

export default function Header() {
  const light = useSyncExternalStore(subscribe, isLight, () => false);

  const toggleTheme = () => {
    const next = !isLight();
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      // Private browsing: the toggle still works for this session.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <header className="nav">
      <div className="wrap flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <button
          type="button"
          onClick={toggleTheme}
          className="logo"
          aria-pressed={light}
          title={light ? "Switch to dark theme" : "Switch to light theme"}
        >
          SP
          <span className="sr-only">
            {light ? "Switch to dark theme" : "Switch to light theme"}
          </span>
        </button>
        <nav className="nav-links flex gap-6 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 whitespace-nowrap">
          <Link href="/#about">ABOUT</Link>
          <Link href="/#projects">PROJECTS</Link>
          <Link href="/#leadership">LEADERSHIP</Link>
          <Link href="/#achievements">ACHIEVEMENTS</Link>
          <Link href="/#skills">SKILLS</Link>
          <Link href="/#contact">CONTACT</Link>
        </nav>
      </div>
    </header>
  );
}
