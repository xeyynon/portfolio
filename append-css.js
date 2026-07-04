const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

const newCSS = `

/* ==========================================================================
   Intro Sequence Overlay
   ========================================================================== */
.intro-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: var(--bg-dark);
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.4s ease, visibility 0.4s ease;
}
.intro-hide { opacity: 0; visibility: hidden; pointer-events: none; }

.intro-word {
  font-family: var(--font-display);
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 600; letter-spacing: -0.01em;
  color: var(--ink-hi);
  animation: introFade 0.7s ease;
}
@keyframes introFade {
  0% { opacity: 0; transform: translateY(6px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; }
  100% { opacity: 0; }
}

.intro-content-hidden { visibility: hidden; }

@media (prefers-reduced-motion: reduce) {
  .intro-overlay, .intro-word { animation: none; transition: none; }
}
`;

if (!css.includes('.intro-overlay')) {
  fs.writeFileSync('app/globals.css', css + newCSS);
}
