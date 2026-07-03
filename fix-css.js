const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

// The faulty string introduced by the bad replacement
const faultyStr = `  background:var(--bg-dark);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:5px;z-index:50;
}`;

const correctStr = `  background:var(--bg-dark);
  color:var(--ink-hi);
  font-family:var(--font-sans);
  overflow-x:hidden;
}
::selection{background:var(--v500);color:var(--bg-dark);}
a{color:inherit;text-decoration:none;}
.wrap {
  max-width: min(1400px, 90vw);
  margin: 0 auto;
  padding: 0 48px;
}

/* ---------- SPECTROMETER RAIL (signature element) ---------- */
.rail{
  position:fixed;left:0;top:0;bottom:0;width:26px;
  background:var(--bg-dark);border-right:1px solid var(--line-dark);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:5px;z-index:50;
}`;

css = css.replace(faultyStr, correctStr);

// Also we need to append the Prism Hero CSS if it's missing
if (!css.includes('Prism Hero Animation')) {
  css += `
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
}

// And the links CSS if missing
if (!css.includes('Project Links')) {
  css += `
/* ==========================================================================
   Project Links
   ========================================================================== */

.pp-links { display: flex; gap: 10px; margin-top: 18px; margin-bottom: 24px; }
.link-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .05em;
  border: 1px solid var(--line-dark); padding: 7px 12px; color: var(--muted-dark);
  transition: border-color .2s, color .2s;
  text-decoration: none;
}
.link-btn:hover { border-color: var(--project-accent, var(--v500)); color: var(--project-accent, var(--v500)); }
`;
}

fs.writeFileSync('app/globals.css', css);
