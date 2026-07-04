const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');
css += `
/* Light Mode Theme applied to root element */
:root.light {
  --bg-dark: #F5F3EE;
  --bg-dark-2: #EAE8E2;
  --bg-light: #0B0C0F;
  --ink-hi: #14151A;
  --ink-lo: #F2F0E9;
  --muted-dark: #8a8877;
  --muted-light: #7c7e86;
  --line-dark: #ddd9cd;
  --line-light: #24262c;
}
`;
fs.writeFileSync('app/globals.css', css);
