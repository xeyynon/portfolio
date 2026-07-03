"use client";
import { useEffect, useRef, useState } from "react";

export default function PrismHero() {
  const [played, setPlayed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setPlayed(true); return; }
    
    // Using IntersectionObserver to play when in view, and reset when out of view
    const obs = new IntersectionObserver(([entry]) => {
      setPlayed(entry.isIntersecting);
    }, { threshold: 0.1 });
    
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const lines = [
    { color: "var(--v400)", y: 14,  delay: 0.0 },
    { color: "var(--v500)", y: 38,  delay: 0.08 },
    { color: "var(--v560)", y: 62,  delay: 0.16 },
    { color: "var(--v600)", y: 86,  delay: 0.24 },
    { color: "var(--v680)", y: 108, delay: 0.32 },
  ];

  return (
    <div className={`prism-wrap ${played ? "play" : ""}`} ref={ref} aria-hidden="true">
      <svg viewBox="0 0 860 120" preserveAspectRatio="none">
        <line x1="0" y1="60" x2="330" y2="60" className="beam-in" pathLength="1" />
        <polygon points="330,20 400,20 365,100" className="prism-outline" pathLength="1" />
        {lines.map((l, i) => (
          <path
            key={i}
            d={`M365,60 L860,${l.y}`}
            className="spectrum-line"
            style={{ stroke: l.color, animationDelay: `${0.55 + l.delay}s`, ["--pulse-delay" as any]: `${1.6 + i * 0.15}s` }}
            pathLength="1"
          />
        ))}
        {lines.map((l, i) => (
          <circle key={`p${i}`} r="2.4" className="pulse-dot" style={{ fill: l.color, animationDelay: `var(--pulse-delay, 0s)` }}>
            {/* The animation starts when 'play' class is added and played state is true */}
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={played ? `${1.6 + i * 0.15}s` : "indefinite"}>
              <mpath href={`#spectrum-path-${i}`} />
            </animateMotion>
          </circle>
        ))}
        {lines.map((l, i) => (
          <path key={`sp${i}`} id={`spectrum-path-${i}`} d={`M365,60 L860,${l.y}`} fill="none" stroke="none" />
        ))}
      </svg>
    </div>
  );
}
