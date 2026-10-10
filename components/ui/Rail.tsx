"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { projects, projectsInPageOrder, projectLabel } from "@/data/portfolioData";

// Same order as the page: sections, with the project cards in their grouped
// order (software, then embedded). Project ids are p{num}, as on the cards.
const stops = [
  { id: "experience", label: "Experience", color: "var(--vwhite)" },
  { id: "about", label: "About", color: "var(--vwhite)" },
  ...projectsInPageOrder.map((p) => ({ id: `p${parseInt(p.num)}`, label: projectLabel(p), color: p.color })),
  { id: "achievements", label: "Achievements", color: "var(--vwhite)" },
  { id: "leadership", label: "Leadership", color: "var(--vwhite)" },
  { id: "skills", label: "Skills", color: "var(--vwhite)" },
  { id: "contact", label: "Contact", color: "var(--vwhite)" },
];

/**
 * Spectrometer scroll index (desktop). Each tick is a link, so clicks go
 * through SmoothScroll's anchor handling (Lenis, header offset) on the
 * homepage and navigate home from a project page.
 *
 * The active tick is the last stop whose top has crossed 40% of the
 * viewport. The old IntersectionObserver needed a stop to be 50% visible,
 * which sections taller than the screen never were, so it stalled.
 */
export default function Rail() {
  const pathname = usePathname();
  const [scrollActive, setScrollActive] = useState("");

  // On a project page the active stop is a pure function of the route.
  const projectSlug = pathname.startsWith("/projects/") ? pathname.split("/")[2] : null;
  const routeProject = projectSlug ? projects.find((p) => p.slug === projectSlug) : undefined;
  const routeActive = routeProject ? `p${parseInt(routeProject.num)}` : null;
  const activeId = routeActive ?? scrollActive;

  useEffect(() => {
    if (projectSlug) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = "";
      for (const s of stops) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      // At the very bottom the last section (Contact, shorter than the
      // screen) never reaches the 40% line, so it would never light up.
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = stops[stops.length - 1].id;
      setScrollActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [projectSlug]);

  return (
    <nav className="rail" aria-label="Section index">
      {stops.map((stop) => {
        const isActive = activeId === stop.id;
        return (
          <Link
            key={stop.id}
            href={`/#${stop.id}`}
            className={`tick ${isActive ? "active" : ""}`}
            aria-current={isActive ? "true" : undefined}
            title={stop.label}
            style={{
              background: isActive ? stop.color : "var(--tick-idle)",
              boxShadow: isActive ? `0 0 10px 1px ${stop.color}` : "none",
            }}
          >
            <span className="sr-only">{stop.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
