"use client";

import Link from "next/link";
import { personalInfo } from "@/data/portfolioData";

export default function Header() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('light');
  };

  return (
    <header className="nav">
      <div className="wrap flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <span onClick={toggleTheme} className="logo cursor-pointer hover:text-[var(--v500)] transition-colors select-none">
          SP
        </span>
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
