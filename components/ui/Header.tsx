"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { personalInfo } from "@/data/portfolioData";

export default function Header() {
  const pathname = usePathname();
  
  const toggleTheme = () => {
    document.documentElement.classList.toggle('light');
  };

  return (
    <header className="nav">
      <div className="wrap flex items-center justify-between">
        <span onClick={toggleTheme} className="logo cursor-pointer hover:text-[var(--v500)] transition-colors select-none">
          {personalInfo.name.toUpperCase()}
        </span>
        <nav className="nav-links flex gap-6">
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
