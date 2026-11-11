import type { ButtonHTMLAttributes } from "react";

type KeycapProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Tiny legend printed in the cap's top-right corner (decorative). */
  legend: string;
  /** paper: the light primary cap. ink: the dark secondary cap. */
  tone?: "paper" | "ink";
};

/**
 * Atom: a physical keycap button. 54px tall with a solid 7px side below it;
 * pressing sinks the cap onto its side and releasing springs it back
 * (transform only). Always a real <button>, so it has keyboard operation
 * and the shared focus ring for free.
 */
export default function Keycap({ legend, tone = "paper", className, children, ...rest }: KeycapProps) {
  return (
    <button type="button" className={`keycap keycap-${tone}${className ? ` ${className}` : ""}`} {...rest}>
      <span className="keycap-legend" aria-hidden="true">{legend}</span>
      {children}
    </button>
  );
}
