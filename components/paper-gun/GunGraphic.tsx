import type { Ref } from "react";
import { spectrum } from "@/data/portfolioData";

/**
 * Atom: the paper gun, drawn as an inline SVG (no image files). A chunky
 * angular box: lit top face, a graded side face with PORTFOLIO printed on
 * it, a darker front face holding the dark slot the paper leaves from, a
 * slanted grip, a trigger guard and a trigger.
 *
 * Why it is ivory, not red: on this site red (--v680) means Hardware, and a
 * spectrum colour may not be borrowed for emphasis (rules.md, Colour). The
 * gun is charged by the background prism's light and fires the spectrum.
 * The six-band stripe under the print is its charge meter.
 *
 * Decorative: the button that wraps it carries the accessible name.
 */
export default function GunGraphic({
  slotRef,
  recoilRef,
  chargeRef,
  glowRef,
  intakeRef,
}: {
  slotRef: Ref<SVGCircleElement>;
  intakeRef: Ref<SVGCircleElement>;
  recoilRef: Ref<HTMLSpanElement>;
  chargeRef: Ref<SVGGElement>;
  glowRef: Ref<HTMLSpanElement>;
}) {
  const stop = (token: string) => ({ stopColor: `var(${token})` });
  const band = 388 / spectrum.length;

  return (
    <span className="gun" aria-hidden="true">
      <span className="gun-shadow" />
      <span className="gun-glow" ref={glowRef} />
      <span className="gun-tilt">
        <span className="gun-recoil" ref={recoilRef}>
          <svg className="gun-svg" viewBox="0 0 760 440" focusable="false">
            <defs>
              <linearGradient id="pg-top" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={stop("--gun-top-a")} />
                <stop offset="1" style={stop("--gun-top-b")} />
              </linearGradient>
              <linearGradient id="pg-side" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={stop("--gun-side-a")} />
                <stop offset=".55" style={stop("--gun-side-b")} />
                <stop offset="1" style={stop("--gun-side-c")} />
              </linearGradient>
              <linearGradient id="pg-end" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={stop("--gun-end-a")} />
                <stop offset="1" style={stop("--gun-end-b")} />
              </linearGradient>
              <linearGradient id="pg-grip" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" style={stop("--gun-side-a")} />
                <stop offset=".5" style={stop("--gun-side-b")} />
                <stop offset="1" style={stop("--gun-side-c")} />
              </linearGradient>
            </defs>

            {/* Trigger guard and trigger sit behind the body's lower edge. */}
            <path className="gun-guard" d="M360 236 L360 298 Q360 330 392 330 L502 330" />
            <path className="gun-trigger" d="M410 236 L432 236 Q434 278 402 302 Q420 270 410 236 Z" />

            {/* Grip: a darker back face, then the graded side face. */}
            <path className="gun-end" d="M572 236 L598 236 L650 398 Q652 410 640 412 L626 412 Z" />
            <path fill="url(#pg-grip)" d="M468 236 L574 236 L628 404 Q630 416 616 418 L540 422 Q526 422 523 410 Z" />
            <path className="gun-shine" d="M478 246 L530 404" />

            {/* Body: top, front (with the slot), side. */}
            <path fill="url(#pg-top)" d="M70 120 L40 92 L620 92 L650 120 Z" />
            <path fill="url(#pg-end)" d="M70 120 L40 92 L40 212 L70 240 Z" />
            <path className="gun-slot" d="M62 138 L48 124 L48 196 L62 210 Z" />
            <rect fill="url(#pg-side)" x="70" y="120" width="580" height="120" />
            <path className="gun-shine" d="M74 123.5 L646 123.5" />
            <path className="gun-panel" d="M140 130 L140 232 M590 130 L590 232" />
            {[
              [90, 138],
              [630, 138],
              [90, 224],
              [630, 224],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} className="gun-rivet" cx={cx} cy={cy} r="4" />
            ))}
            {/* The owner's monogram, matching the header (owner, 2026-11-09). */}
            <text className="gun-print" x="360" y="204" textAnchor="middle">
              SP
            </text>
            {/* The charge meter: a dim spectrum track, and the same stripe
                lit on top of it, filled left to right by the prism's light
                (the engine scales it). */}
            <g className="gun-charge-track">
              {spectrum.map((s, i) => (
                <rect key={s.token} x={166 + i * band} y="222" width={band} height="8" style={{ fill: `var(${s.token})` }} />
              ))}
            </g>
            <g className="gun-charge" ref={chargeRef}>
              {spectrum.map((s, i) => (
                <rect key={s.token} x={166 + i * band} y="222" width={band} height="8" style={{ fill: `var(${s.token})` }} />
              ))}
            </g>

            {/* Where slips leave from; the engine measures this point. */}
            <circle ref={slotRef} cx="55" cy="167" r="1" fill="none" />
            {/* Where the prism's rays end: just inside the base of the grip.
                The light leaves the prism behind the gun's front, so a
                target on the body hid the whole beam; the grip base leaves
                a visible run under the body and into the handle. */}
            <circle ref={intakeRef} cx="576" cy="404" r="1" fill="none" />
          </svg>
        </span>
      </span>
    </span>
  );
}
