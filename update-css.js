const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

// The marker where project detail css begins
const marker = '/* ==========================================================================';
const parts = css.split(marker);

const pIndex = css.indexOf('Project Detail Page (.project-page)');
if(pIndex !== -1) {
  const start = css.lastIndexOf(marker, pIndex);
  css = css.substring(0, start);
}

const newCss = `
/* ==========================================================================
   Project Detail Page (.project-page)
   ========================================================================== */

.project-page {
  padding-top: 140px;
  padding-bottom: 100px;
  max-width: 900px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  color: var(--muted-dark);
  font-family: var(--font-mono);
  font-size: 11px;
  text-decoration: none;
  text-transform: uppercase;
  margin-bottom: 40px;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--project-accent);
}

.pp-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.pp-head .pnum {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--muted-dark);
}

.pp-head h1 {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 500;
  color: var(--ink-hi);
  margin: 0;
  line-height: 1.1;
}

.pp-head .ptag {
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 3px 6px;
  border: 1px solid;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0, 0, 0, 0.2);
}

.ppipe {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted-dark);
  margin-bottom: 40px;
}

.pp-section { 
  margin-top: 40px; 
  padding-top: 20px; 
  border-top: 1px solid var(--line-dark); 
}

.eyebrow { 
  font-family: var(--font-mono); 
  font-size: 9.5px; 
  letter-spacing: .1em; 
  color: var(--muted-dark); 
  display: block; 
  margin-bottom: 14px; 
}

.pp-desc {
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--ink-hi);
  line-height: 1.6;
  max-width: 700px;
}

.pp-highlights { 
  list-style: none; 
  padding: 0; 
  display: flex; 
  flex-direction: column; 
  gap: 14px; 
}

.pp-highlights li { 
  position: relative; 
  padding-left: 20px; 
  font-family: var(--font-sans);
  font-size: 14px; 
  color: var(--muted-dark); 
}

.pp-highlights li::before {
  content: "—";
  position: absolute; 
  left: 0;
  color: var(--project-accent, var(--v500));
}

.stack { 
  display: flex; 
  gap: 8px; 
  flex-wrap: wrap; 
}

.stack-chip {
  font-family: var(--font-mono); 
  font-size: 10px; 
  letter-spacing: .04em;
  color: var(--ink-hi); 
  background: var(--bg-dark-2);
  border: 1px solid var(--line-dark); 
  padding: 5px 10px;
}

.pp-nav {
  display: flex; 
  justify-content: space-between;
  margin-top: 56px; 
  padding-top: 20px; 
  border-top: 1px solid var(--line-dark);
}

.pp-nav a {
  font-family: var(--font-mono); 
  font-size: 11px; 
  letter-spacing: .05em;
  color: var(--muted-dark); 
  transition: color .2s;
  text-decoration: none;
}

.pp-nav a:hover { 
  color: var(--project-accent); 
}
`;

fs.writeFileSync('app/globals.css', css + newCss);
