"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { projects } from "@/data/portfolioData";

const stops = [
  ...projects.map((p, i) => ({ id: `p${i + 1}`, label: p.title, color: p.color })),
  { id: "about", label: "About", color: "var(--vwhite)" },
];

export default function Rail() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrollActive, setScrollActive] = useState("");

  // On a project page the active stop is a pure function of the route, so it is
  // derived during render rather than pushed into state from an effect.
  const projectSlug = pathname.startsWith("/projects/") ? pathname.split("/")[2] : null;
  const routeActive = projectSlug
    ? stops[projects.findIndex((p) => p.slug === projectSlug)]?.id ?? null
    : null;

  const activeId = routeActive ?? scrollActive;

  useEffect(() => {
    if (projectSlug) return;

    const targets = stops
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setScrollActive(entry.target.id);
        }
      },
      { threshold: 0.5 }
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [projectSlug]);

  const goTo = (targetId: string) => {
    if (pathname !== "/") {
      router.push(`/#${targetId}`);
      return;
    }
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <nav className="rail" aria-label="Section index">
      {stops.map((stop) => {
        const isActive = activeId === stop.id;
        return (
          <button
            key={stop.id}
            type="button"
            className={`tick ${isActive ? "active" : ""}`}
            onClick={() => goTo(stop.id)}
            aria-current={isActive ? "true" : undefined}
            title={stop.label}
            style={{
              background: isActive ? stop.color : "var(--tick-idle)",
              boxShadow: isActive ? `0 0 10px 1px ${stop.color}` : "none",
            }}
          >
            <span className="sr-only">{stop.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
