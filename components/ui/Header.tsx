"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { personalInfo } from "@/data/portfolioData";

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="nav">
      <div className="wrap flex items-center justify-between">
        <span className="logo">{personalInfo.name.toUpperCase()}</span>
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
