"use client";
import { useEffect, useState } from "react";

const words = ["Learning.", "Building.", "Improving."];

export default function IntroSequence({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setSkip(true); setDone(true); return; }

    const perWord = 700; // ms each word stays fully visible
    const timers = words.map((_, i) =>
      setTimeout(() => setIndex(i), i * perWord)
    );
    const finish = setTimeout(() => setDone(true), words.length * perWord);

    return () => { timers.forEach(clearTimeout); clearTimeout(finish); };
  }, []);

  return (
    <>
      {!skip && (
        <div className={`intro-overlay ${done ? "intro-hide" : ""}`} aria-hidden="true">
          <span key={index} className="intro-word">{words[index]}</span>
        </div>
      )}
      <div className={!skip && !done ? "intro-content-hidden" : ""}>{children}</div>
    </>
  );
}
