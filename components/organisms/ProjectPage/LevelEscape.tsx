"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Esc goes up one level, from a project back to the list it was opened from.
 * One press undoes one step: it stands aside if something else already took
 * the key, while typing, with a modifier held, on a held key, and while a
 * dialog is open.
 */
export default function LevelEscape({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (document.querySelector("[aria-modal='true']")) return;
      router.push(href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [href, router]);

  return null;
}
