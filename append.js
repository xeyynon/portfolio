const fs = require('fs');

const css = `
/* ==========================================================================
   Prism Hero Animation
   ========================================================================== */

.prism-wrap { position: relative; height: 120px; margin-top: 36px; }
.prism-wrap svg { width: 100%; height: 100%; overflow: visible; }

.beam-in {
  stroke: var(--ink-hi); stroke-width: 1.4; opacity: 0; fill: none;
  stroke-dasharray: 1; stroke-dashoffset: 1;
}
.prism-outline {
  fill: none; stroke: #33353c; stroke-width: 1.4;
  stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0;
}
.spectrum-line {
  stroke-width: 2.4; fill: none;
  stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0;
}
.pulse-dot { opacity: 0; filter: drop-shadow(0 0 3px currentColor); }

.prism-wrap.play .beam-in {
  animation: draw 0.5s ease forwards;
}
.prism-wrap.play .prism-outline {
  animation: draw 0.4s ease forwards;
  animation-delay: 0.45s;
}
.prism-wrap.play .spectrum-line {
  animation: draw 0.5s ease forwards;
}
.prism-wrap.play .pulse-dot {
  animation: fadeIn 0.3s ease forwards;
}

@keyframes draw {
  from { opacity: 1; stroke-dashoffset: 1; }
  to   { opacity: 1; stroke-dashoffset: 0; }
}
@keyframes fadeIn {
  to { opacity: 0.9; }
}

@media (prefers-reduced-motion: reduce) {
  .beam-in, .prism-outline, .spectrum-line { opacity: 1; stroke-dashoffset: 0; }
  .pulse-dot { display: none; }
}
`;

fs.appendFileSync('app/globals.css', css, 'utf8');
