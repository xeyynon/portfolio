"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The way back from a pruned branch: to the part of the main line the
 * address split off from. A closed project page (/projects/...) leads back to
 * the projects on the home page; anything else to the top of it.
 */
export default function BackToLine({ home, className, children }: { home: string; className?: string; children: ReactNode }) {
  const path = usePathname() ?? "";
  const base = home.endsWith("/") ? home : `${home}/`;
  const href = path.startsWith("/projects/") ? `${base}#projects` : home;
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
