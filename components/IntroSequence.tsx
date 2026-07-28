"use client";
import { useCallback, useEffect, useState } from "react";

const words = ["Learning.", "Building.", "Improving."];
const PER_WORD = 620;

export default function IntroSequence({ children }: { children: React.ReactNode }) {
  // Default to "not playing" so the server render and first paint are the real
  // page. The overlay is opted into on mount, never on the critical path.
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    sessionStorage.setItem("intro-seen", "1");
    setTimeout(() => setPlaying(false), 400);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem("intro-seen")) return;

    // Begin on the next frame rather than synchronously, so the real page gets
    // its first paint before the overlay is ever mounted.
    const start = requestAnimationFrame(() => setPlaying(true));
    const timers = words.map((_, i) => setTimeout(() => setIndex(i), i * PER_WORD));
    const finish = setTimeout(dismiss, words.length * PER_WORD);

    return () => {
      cancelAnimationFrame(start);
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [dismiss]);

  // Any deliberate input skips the rest of the sequence.
  useEffect(() => {
    if (!playing) return;
    const skip = () => dismiss();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
    };
  }, [playing, dismiss]);

  return (
    <>
      {playing && (
        <div className={`intro-overlay ${leaving ? "intro-hide" : ""}`} aria-hidden="true">
          <span key={index} className="intro-word">
            {words[index]}
          </span>
          <span className="intro-skip">press any key to skip</span>
        </div>
      )}
      {children}
    </>
  );
}
