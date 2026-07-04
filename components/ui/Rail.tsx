"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { projects } from "@/data/portfolioData";

export default function Rail() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // If we're on a specific project page, set that as active based on pathname
    if (pathname.startsWith('/projects/')) {
      const slug = pathname.split('/')[2];
      const projectIndex = projects.findIndex(p => p.slug === slug);
      if (projectIndex !== -1) {
        setTimeout(() => setActiveId(`p${projectIndex + 1}`), 0);
      }
      return; // Skip intersection observer on project pages
    }

    // Otherwise, we are on the homepage, use IntersectionObserver
    const ticks = document.querySelectorAll<HTMLElement>('.rail .tick');
    const targets = Array.from(ticks).map(t => document.getElementById(t.dataset.target!)).filter(Boolean) as HTMLElement[];

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, { threshold: 0.5 });

    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);

  const handleTickClick = (targetId: string) => {
    if (pathname !== "/") {
      router.push(`/#${targetId}`);
    } else {
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <nav className="rail" aria-label="Signal spectrum index">
      {projects.map((proj, i) => {
        const targetId = `p${i + 1}`;
        const isActive = activeId === targetId;
        return (
          <div 
            key={targetId} 
            className={`tick ${isActive ? 'active' : ''}`} 
            data-target={targetId} 
            onClick={() => handleTickClick(targetId)}
            style={{ 
              background: isActive ? proj.color : '#2b2d34',
              boxShadow: isActive ? `0 0 10px 1px ${proj.color}` : 'none'
            }}
          />
        );
      })}
      <div 
        className={`tick ${activeId === 'about' ? 'active' : ''}`} 
        data-target="about" 
        onClick={() => handleTickClick('about')}
        style={{
          background: activeId === 'about' ? 'var(--vwhite)' : '#2b2d34',
          boxShadow: activeId === 'about' ? '0 0 10px 1px var(--vwhite)' : 'none'
        }}
      />
      <div className="rail-label" id="railLabel">400nm</div>
    </nav>
  );
}
