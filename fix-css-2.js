const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

// The faulty body definition that needs to be fixed:
// body{
//   background:var(--bg-dark);
//   display:flex;flex-direction:column;align-items:center;justify-content:center;
//   gap:5px;z-index:50;
// }
const faultyRegex = /body\{\s*background:var\(--bg-dark\);\s*display:flex;flex-direction:column;align-items:center;justify-content:center;\s*gap:5px;z-index:50;\s*\}/;

const fixedBody = `body{
  background:var(--bg-dark);
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

css = css.replace(faultyRegex, fixedBody);

// We also need to remove the old .wrap{max-width:920px;margin:0 auto;padding:0 32px;}
css = css.replace(/\.wrap\{max-width:920px;margin:0 auto;padding:0 32px;\}\s*/, '');
// And remove the old rail partial definition
css = css.replace(/\.rail\s*\{\s*display:flex;flex-direction:column;align-items:center;justify-content:center;\s*gap:5px;z-index:50;\s*\}/, '');

fs.writeFileSync('app/globals.css', css);
