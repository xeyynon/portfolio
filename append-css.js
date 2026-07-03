const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');
css += `\n/* Soft bleed section transitions */
section + section.light-panel { position: relative; }
section + section.light-panel::before {
  content: ""; position: absolute; top: -12px; left: 0; right: 0; height: 12px;
  background: linear-gradient(to bottom, transparent, var(--bg-light));
  pointer-events: none;
}\n`;
fs.writeFileSync('app/globals.css', css);
